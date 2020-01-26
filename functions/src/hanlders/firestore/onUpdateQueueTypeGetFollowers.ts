import * as functions from 'firebase-functions';
import * as queues from '../../utils/firestore/queues';
import * as followersStorage from '../../utils/storage/followers';
import { getFollowersIds } from '../../utils/twitter/getFollowersIds';
import * as twitterError from '../../utils/twitter/error';

type Props = functions.Change<FirebaseFirestore.DocumentSnapshot>;
type Context = functions.EventContext;

/**
 * キュー(type: getFollowers)を処理する
 */
export async function onUpdateQueueTypeGetFollowers(props: Props, context: Context): Promise<void> {
  const beforeStatus = props.before.get('status') as queues.QueueStatus;
  const afterStatus = props.after.get('status') as queues.QueueStatus;

  /** 動作条件 */
  // before が waiting, pending / after が working で run
  if ((beforeStatus === 'waiting' || beforeStatus === 'pending') && afterStatus === 'working') {
    console.log('run: onUpdateQueueTypeGetFollowers/run', props.after.id);
    await run(props, context);
    return;
  }
  // before が working / after が completed で terminate
  if (beforeStatus === 'working' && afterStatus === 'completed') {
    console.log('run: onUpdateQueueTypeGetFollowers/terminate', props.after.id);
    await terminate(props, context);
    return;
  }
}

/**
 * キュー(type: getFollowers)の、フォロワー一覧取得処理を実行
 */
async function run({ after }: Props, context: Context): Promise<void> {
  const now = new Date(context.timestamp);
  const queueId = after.id;
  const { uid, twId, twToken, twSecret } = after.get('params') as queues.QueueTypeGetFollowersParams;
  const { cursor } = after.get('state') as queues.QueueTypeGetFollowersState;

  /** TwitterからフォロワーIDリストを取得 */
  const { response, errors } = await getFollowersIds(
    { key: twToken, secret: twSecret },
    { userId: twId, cursor, count: 75000 }
  );
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

  /** ストレージにフォロワーIDリストを保存 */
  await followersStorage.saveFollowers(uid, queueId, cursor, ids);

  /** 現在のキューのステートを更新 */
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
    durationStart: cursor === '' ? now : undefined,
    durationEnd: now,
  };

  const data: UpdateData = {
    status,
    runAt,
    state,
  };
  await queues.updateQueueTypeGetFollowersState(queueId, data);

  /** 現在のキューにログを追加 */
  type Log = Parameters<typeof queues.addQueueTypeGetFollowersLog>[1];
  const log: Log = {
    success: true,
    text: '',
    runAt: now,
    beforeCursor: cursor,
    afterCursor: nextCursor,
  };
  await queues.addQueueTypeGetFollowersLog(queueId, log);
}

/**
 * フォロワー一覧取得処理を終了
 * 新規キューを作成
 */
async function terminate({ after }: Props, context: Context): Promise<void> {
  const now = new Date(context.timestamp);

  const currentQueueId = after.id;
  const currentRunAt = after.get('runAt') as FirebaseFirestore.Timestamp;
  const currentParams = after.get('params') as queues.QueueTypeGetFollowersParams;
  const currentState = after.get('state') as queues.QueueTypeGetFollowersState;

  /**
   * 次回のキューを作成する
   */
  async function createNextQueue() {
    type Props = Parameters<typeof queues.addQueueTypeGetFollowers>[0];

    // 次の state
    const state: Props['state'] = {
      cursor: '',
      durationStart: null, // run で更新
      durationEnd: null, // run で更新
      latestQueueId: currentQueueId,
      latestDurationStart: currentState.durationStart,
    };

    // 次の props
    const props: Props = {
      runAt: currentRunAt,
      params: currentParams,
      state,
    };
    await queues.addQueueTypeGetFollowers(props);
  }

  /**
   * キュー(type: compareFollowers)を作成する
   */
  async function createCompareFollowersQueue() {
    type Props = Parameters<typeof queues.addQueueTypeCompareFollowers>[0];

    const params: Props['params'] = {
      uid: currentParams.uid,
      beforeQueueId: currentState.latestQueueId,
      afterQueueId: currentQueueId,
      durationStart: currentState.latestDurationStart,
      durationEnd: currentState.durationEnd,
    };

    const props: Props = {
      runAt: now,
      params,
      state: {},
    };
    await queues.addQueueTypeGetFollowers(props);
  }

  await Promise.all([createNextQueue(), createCompareFollowersQueue()]);
}
