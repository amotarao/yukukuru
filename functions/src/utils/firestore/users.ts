import { firestore, admin } from '../../modules/firebase';
import { DateLike } from './types';

const collection = firestore.collection('users');

export interface User {
  /** Twitter プロフィール画像URL */
  photoUrl: string;

  /** Twitter 名前 */
  displayName: string;

  /** 有効かどうか */
  active: boolean;

  /** 無効かどうか */
  invalid: boolean;

  /** 新しいユーザーかどうか */
  newUser: boolean;

  /** フォロワー一覧取得 最終実行日時 */
  lastUpdated: DateLike;

  /** フォロワー情報取得 最終実行日時 */
  lastUpdatedTwUsers: DateLike;

  /** フォロワー一覧取得 state cursor */
  nextCursor: string;

  /** フォロワー一覧取得 state doc-id */
  currentWatchesId: string;

  /** フォロワー一覧取得 state 途中かどうか */
  pausedGetFollower: boolean;
}

/**
 * ユーザーを初期化
 */
export async function initializeUser(id: string, props: Pick<User, 'photoUrl' | 'displayName'>): Promise<void> {
  const now = admin.firestore.FieldValue.serverTimestamp();

  const data: User = {
    active: true,
    invalid: false,
    newUser: true,
    lastUpdated: admin.firestore.Timestamp.now(),
    lastUpdatedTwUsers: now,
    nextCursor: '-1',
    currentWatchesId: '',
    pausedGetFollower: false,
    ...props,
  };
  await collection.doc(id).set(data, { merge: true });
}

/**
 * ユーザーのactiveをfalseにする
 */
export async function setUserToNotActive(id: string): Promise<void> {
  const data: Pick<User, 'active'> = { active: false };
  await collection.doc(id).set(data, { merge: true });
}

/**
 * ユーザーのinvalidを変更
 */
export async function updateUserInvalid(id: string, invalid: boolean): Promise<void> {
  const data: Pick<User, 'invalid'> = { invalid };
  await collection.doc(id).set(data, { merge: true });
}
