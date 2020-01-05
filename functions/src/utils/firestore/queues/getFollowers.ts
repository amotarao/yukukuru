import { admin } from '../../../modules/firebase';
import { DateLike } from '../types';
import { collection, QueueBase } from '.';

export interface QueueTypeGetFollowersParams {
  /** Firebase UID */
  uid: string;

  /** Twitter ID */
  twId: string;

  /** Twitter Access Token */
  twToken: string;

  /** Twitter Access Token Secret */
  twSecret: string;
}

export interface QueueTypeGetFollowersState {
  /** API's cursor */
  cursor: string;

  /** 前回のキュー参照 */
  latestQueueStoragePaths: string[];

  /** ストレージのパスリスト */
  storagePaths: string[] | FirebaseFirestore.FieldValue;
}

export interface QueueTypeGetFollowersLog {
  /** 成功したかどうか */
  success: boolean;

  /** テキスト */
  text: string;

  /** 実行日時 */
  runAt: DateLike;

  /** ストレージのパス */
  storagePath: string;
}

export interface QueueTypeGetFollowers extends QueueBase {
  params: QueueTypeGetFollowersParams;
  state: QueueTypeGetFollowersState;
  logs: QueueTypeGetFollowersLog[];
}

/**
 * フォロワー一覧取得処理のキューを追加
 */
export async function addQueueTypeGetFollowers(props: Pick<QueueTypeGetFollowers, 'runAt' | 'params' | 'state'>): Promise<void> {
  const data: QueueTypeGetFollowers = {
    type: 'getFollowers',
    status: 'waiting',
    logs: [],
    ...props,
  };
  await collection.add(data);
}

/**
 * フォロワー一覧取得処理の状態を変更
 */
type UpdateQueueTypeGetFollowersStateProps = Pick<QueueTypeGetFollowers, 'status' | 'runAt'> & { state: Partial<QueueTypeGetFollowers['state']> };

export async function updateQueueTypeGetFollowersState(id: string, props: UpdateQueueTypeGetFollowersStateProps): Promise<void> {
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
 * フォロワー一覧取得処理のパラメータを変更
 */
export async function updateQueueTypeGetFollowersParams(id: string, params: Partial<QueueTypeGetFollowersParams>): Promise<void> {
  const flatParams: { [key: string]: any } = {};
  Object.entries(params).forEach(([key, value]) => {
    flatParams[`params.${key}`] = value;
  });
  await collection.doc(id).update(flatParams);
}

/**
 * フォロワー一覧取得処理のログを追加
 */
export async function addQueueTypeGetFollowersLog(id: string, log: QueueTypeGetFollowersLog): Promise<void> {
  await collection.doc(id).update({
    logs: admin.firestore.FieldValue.arrayUnion(log),
  });
}
