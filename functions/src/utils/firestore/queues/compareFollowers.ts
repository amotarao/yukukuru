import { admin } from '../../../modules/firebase';
import { DateLike } from '../types';
import { collection, QueueBase } from '.';

export interface QueueTypeCompareFollowersParams {
  /** Firebase UID */
  uid: string;

  /** 変更前のキューID */
  beforeQueueId: string;

  /** 変更後のキューID */
  afterQueueId: string;

  /** 期間開始日時 */
  durationStart: DateLike;

  /** 期間終了日時 */
  durationEnd: DateLike;
}

export interface QueueTypeCompareFollowersState {}

export interface QueueTypeCompareFollowersLog {
  /** 成功したかどうか */
  success: boolean;

  /** テキスト */
  text: string;

  /** 実行日時 */
  runAt: DateLike;

  /** "ゆく" 人数 */
  yukuCount: number;

  /** "くる" 人数 */
  kuruCount: number;
}

export interface QueueTypeCompareFollowers extends QueueBase {
  params: QueueTypeCompareFollowersParams;
  state: QueueTypeCompareFollowersState;
  logs: QueueTypeCompareFollowersLog[];
}

/**
 * フォロワー比較処理のキューを追加
 */
export async function addQueueTypeCompareFollowers(
  props: Pick<QueueTypeCompareFollowers, 'runAt' | 'params' | 'state'>
): Promise<void> {
  const data: QueueTypeCompareFollowers = {
    type: 'compareFollowers',
    status: 'waiting',
    logs: [],
    ...props,
  };
  await collection.add(data);
}

/**
 * フォロワー比較処理の状態を変更
 */
type UpdateQueueTypeCompareFollowersStateProps = Pick<QueueTypeCompareFollowers, 'status' | 'runAt'> & {
  state: Partial<QueueTypeCompareFollowers['state']>;
};

export async function updateQueueTypeCompareFollowersState(
  id: string,
  props: UpdateQueueTypeCompareFollowersStateProps
): Promise<void> {
  const flatState: { [key: string]: any } = {};
  Object.entries(props.state).forEach(([key, value]) => {
    flatState[`state.${key}`] = value;
  });
  const data = {
    status: props.status,
    runAt: props.runAt,
    ...flatState,
  };
  await collection.doc(id).update(data);
}

/**
 * フォロワー比較処理のパラメータを変更
 */
export async function updateQueueTypeCompareFollowersParams(
  id: string,
  params: Partial<QueueTypeCompareFollowersParams>
): Promise<void> {
  const flatParams: { [key: string]: any } = {};
  Object.entries(params).forEach(([key, value]) => {
    flatParams[`params.${key}`] = value;
  });
  await collection.doc(id).update(flatParams);
}

/**
 * フォロワー比較処理のログを追加
 */
export async function addQueueTypeCompareFollowersLog(id: string, log: QueueTypeCompareFollowersLog): Promise<void> {
  await collection.doc(id).update({
    logs: admin.firestore.FieldValue.arrayUnion(log),
  });
}
