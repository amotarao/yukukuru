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

  /** フォロワー情報取得 最終実行日時 */
  lastUpdatedTwUsers: DateLike;

  /** 一時データ */
  tmp: { [key: string]: any };

  /**
   * [deprecated] 新しいユーザーかどうか
   * Todo: フォロワー取得処理のキュー化完了後、不要なので削除
   */
  newUser?: boolean;

  /**
   * [deprecated] フォロワー一覧取得 最終実行日時
   * Todo: フォロワー取得処理のキュー化完了後、不要なので削除
   */
  lastUpdated?: DateLike;

  /**
   * [deprecated] フォロワー一覧取得 state cursor
   * Todo: フォロワー取得処理のキュー化完了後、不要なので削除
   */
  nextCursor?: string;

  /**
   * [deprecated] フォロワー一覧取得 state doc-id
   * Todo: フォロワー取得処理のキュー化完了後、不要なので削除
   */
  currentWatchesId?: string;

  /**
   * [deprecated] フォロワー一覧取得 state 途中かどうか
   * Todo: フォロワー取得処理のキュー化完了後、不要なので削除
   */
  pausedGetFollower?: boolean;
}

/**
 * ユーザーを初期化
 */
export async function initializeUser(id: string, props: Pick<User, 'photoUrl' | 'displayName'>): Promise<void> {
  const now = admin.firestore.FieldValue.serverTimestamp();

  const data: User = {
    photoUrl: props.photoUrl,
    displayName: props.displayName,
    active: true,
    invalid: false,
    lastUpdatedTwUsers: now,
    tmp: {
      /** 旧フォロワー取得処理を止めているかどうか */
      stopedOldGetFollowers: true,
    },
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
