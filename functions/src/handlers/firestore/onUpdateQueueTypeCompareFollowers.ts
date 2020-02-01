import * as functions from 'firebase-functions';
import * as _ from 'lodash';
import * as queues from '../../utils/firestore/queues';
import * as records from '../../utils/firestore/users/records';
import { DateLike } from '../../utils/firestore/types';
import * as followersStorage from '../../utils/storage/followers';

type Props = functions.Change<FirebaseFirestore.DocumentSnapshot>;
type Context = functions.EventContext;

export async function onUpdateQueueTypeCompareFollowers(props: Props, context: Context): Promise<void> {
  const beforeStatus = props.before.get('status') as queues.QueueStatus;
  const afterStatus = props.after.get('status') as queues.QueueStatus;

  /** 動作条件 */
  // before が waiting, pending / after が working で run
  if ((beforeStatus === 'waiting' || beforeStatus === 'pending') && afterStatus === 'working') {
    console.log('run: onUpdateQueueTypeCompareFollowers/run', props.after.id);
    await run(props, context);
    return;
  }
}

/**
 * フォロワー一覧取得処理を実行
 */
async function run({ after }: Props, context: Context): Promise<void> {
  const now = new Date(context.timestamp);
  const queueId = after.id;
  const params = after.get('params') as queues.QueueTypeCompareFollowersParams;
  const { uid, beforeQueueId, afterQueueId, durationStart, durationEnd } = params;
  const runAt = after.get('runAt') as DateLike;

  /** ストレージからフォロワーIDリストを取得 */
  const [beforeIds, afterIds] = await Promise.all([
    followersStorage.getFollowers(uid, beforeQueueId),
    followersStorage.getFollowers(uid, afterQueueId),
  ]);

  /** フォロワーを比較 */
  const yukuIds = _.difference(beforeIds, afterIds);
  const kuruIds = _.difference(afterIds, beforeIds);

  /** 比較した情報をデータベースに保存 */
  async function addRecord(type: records.Record['type'], twId: records.Record['twId']): Promise<void> {
    const data: records.Record = {
      type,
      twId,
      durationStart,
      durationEnd,
    };
    return records.addRecord(uid, data);
  }
  const saveYukuDocs = yukuIds.map(async (id) => addRecord('yuku', id));
  const saveKuruDocs = kuruIds.map(async (id) => addRecord('kuru', id));
  await Promise.all([...saveYukuDocs, ...saveKuruDocs]);

  /** 現在のキューのステートを更新 */
  type UpdateData = Parameters<typeof queues.updateQueueTypeCompareFollowersState>[1];
  const data: UpdateData = {
    status: 'completed',
    runAt,
    state: {},
  };
  await queues.updateQueueTypeCompareFollowersState(queueId, data);

  /** 現在のキューにログを追加 */
  type Log = Parameters<typeof queues.addQueueTypeCompareFollowersLog>[1];
  const log: Log = {
    success: true,
    text: '',
    runAt: now,
    yukuCount: yukuIds.length,
    kuruCount: kuruIds.length,
  };
  await queues.addQueueTypeCompareFollowersLog(queueId, log);
}
