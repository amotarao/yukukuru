import * as functions from 'firebase-functions';
import { admin } from '../../modules/firebase';
import * as queues from '../../utils/firestore/queues';
import * as followersStorage from '../../utils/storage/followers';
import { getFollowersIds } from '../../utils/twitter/getFollowersIds';
import * as twitterError from '../../utils/twitter/error';

type Props = functions.Change<FirebaseFirestore.DocumentSnapshot>;
type Context = functions.EventContext;

export async function onUpdateQueueTypeGetFollowers(props: Props, context: Context): Promise<void> {
  const beforeStatus = props.before.get('status') as queues.QueueStatus;
  const afterStatus = props.after.get('status') as queues.QueueStatus;

  /** 動作条件 */
  // before が waiting, pending / after が working で run
  if ((beforeStatus === 'waiting' || beforeStatus === 'pending') && afterStatus === 'working') {
    console.log('run: onUpdateQueueTypeGetFollowers/run');
    await run(props, context);
    return;
  }
  // before が working / after が completed で terminate
  if (beforeStatus === 'working' && afterStatus === 'completed') {
    console.log('run: onUpdateQueueTypeGetFollowers/terminate');
    await terminate(props);
    return;
  }
}

/**
 * フォロワー一覧取得処理を実行
 */
async function run({ after }: Props, context: Context): Promise<void> {
  const now = new Date(context.timestamp);
  const queueId = after.id;
  const { uid, twId, twToken, twSecret } = after.get('params') as queues.QueueTypeGetFollowersParams;
  const { cursor } = after.get('state') as queues.QueueTypeGetFollowersState;

  /** フォロワー一覧取得 */
  const { response, errors } = await getFollowersIds({ key: twToken, secret: twSecret }, { userId: twId, cursor, count: 75000 });
  const { ids, next_cursor_str: nextCursor } = response;
  const completed = nextCursor === '-1' || nextCursor === '0';

  /** Twitter API エラー処理 */
  if (errors.length) {
    console.error(`Queue ID ${queueId}`, 'Twitter Error', errors);
    if (twitterError.checkRateLimitExceeded(errors)) {
      // 何もしない
    }
    if (twitterError.checkInvalidToken(errors)) {
      // Todo: キューを中止する
      // Todo: checkAddedToken キュー追加
    }
    if (twitterError.checkSuspendUser(errors)) {
      // Todo: キューを中止する
      // Todo: checkUnsuspendedUser キュー追加
    }
  }

  /** フォロワー一覧を保存 */
  const storagePath = [uid, queueId, cursor || '-1'].join('/');
  await followersStorage.saveFollowers(storagePath, ids);

  /** キューを更新 */
  type UpdateData = Parameters<typeof queues.updateQueueTypeGetFollowersState>[1];
  // status
  const status: UpdateData['status'] = completed ? 'completed' : 'pending';
  // runAt: 完了していたら60分待機し、完了していなければ20分待機する
  const waitingMinutes = completed ? 60 : 20;
  const runAt: UpdateData['runAt'] = new Date(now.getTime());
  runAt.setMinutes(now.getMinutes() + waitingMinutes, 0, 0);
  // state
  const state: UpdateData['state'] = {
    cursor: nextCursor,
    storagePaths: admin.firestore.FieldValue.arrayUnion(storagePath),
  };

  const data: UpdateData = {
    status,
    runAt,
    state,
  };
  await queues.updateQueueTypeGetFollowersState(queueId, data);

  /** ログを追加 */
  type Log = Parameters<typeof queues.addQueueTypeGetFollowersLog>[1];
  const log: Log = {
    success: true,
    text: '',
    runAt: now,
    storagePath,
  };
  await queues.addQueueTypeGetFollowersLog(queueId, log);
}

/**
 * フォロワー一覧取得処理を終了
 * 新規キューを作成
 * Todo: フォロワー比較 キュー追加
 */
async function terminate({ after }: Props): Promise<void> {
  type Props = Parameters<typeof queues.addQueueTypeGetFollowers>[0];

  const runAt: Props['runAt'] = after.get('runAt') as FirebaseFirestore.Timestamp;
  const params: Props['params'] = after.get('params') as queues.QueueTypeGetFollowersParams;
  const latestQueueStoragePaths = after.get('state.storagePaths') as string[];
  const state: Props['state'] = {
    cursor: '',
    latestQueueStoragePaths,
    storagePaths: [],
  };

  const props: Props = {
    runAt,
    params,
    state,
  };
  await queues.addQueueTypeGetFollowers(props);
}
