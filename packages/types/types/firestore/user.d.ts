import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../firestore';

export type UserData<T extends FirestoreDateLike = Timestamp> = {
  /** ロール */
  role: 'supporter' | null;

  /** 有効かどうか */
  active: boolean;

  /** auth が削除されているかどうか */
  deletedAuth: boolean;

  /** グループ番号 0-14 のいずれか */
  group: number;

  /** アクセス許可されたユーザーリスト */
  allowedAccessUsers?: string[];

  /** フォロワー情報取得 最終実行日時 */
  lastUpdatedTwUsers: T;

  /** 整合性チェック 最終実行日時 */
  lastUpdatedCheckIntegrity: T;

  /** Twitter情報 最終実行日時 */
  lastUpdatedUserTwitterInfo: T;

  /** Twitter情報 */
  twitter: {
    /** Twitter UID (ユニークな数字のID) */
    id: string;

    /** Twitter ID (@から始まるID) */
    screenName: string;

    /** 名前 (プロフィールの名前) */
    name: string;

    /** プロフィール画像の URL */
    photoUrl: string;

    /** フォロワー数 */
    followersCount: number;

    /** 認証済みユーザーかどうか */
    verified: boolean;
  };

  /**
   * フォロワー一覧取得 最終実行日時
   *
   * @deprecated 廃止予定の Twitter API v1.1 ベースのフィールド
   */
  lastUpdated: T;

  /**
   * フォロワー一覧取得 state cursor
   *
   * @deprecated 廃止予定の Twitter API v1.1 ベースのフィールド
   */
  nextCursor: string;

  /**
   * フォロワー一覧取得 state doc-id
   *
   * @deprecated 廃止予定の Twitter API v1.1 ベースのフィールド
   */
  currentWatchesId: string;

  /**
   * フォロワー一覧取得 state 途中かどうか
   *
   * @deprecated 廃止予定の Twitter API v1.1 ベースのフィールド
   */
  pausedGetFollower: boolean;
};
