import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../firestore';

export interface UserData<T extends FirestoreDateLike = Timestamp> {
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
  lastUpdated: T;

  /** フォロワー情報取得 最終実行日時 */
  lastUpdatedTwUsers: T;

  /** フォロワー一覧取得 state cursor */
  nextCursor: string;

  /** フォロワー一覧取得 state doc-id */
  currentWatchesId: string;

  /** フォロワー一覧取得 state 途中かどうか */
  pausedGetFollower: boolean;

  /** グループ番号 0-14 のいずれか */
  group: number;
}
