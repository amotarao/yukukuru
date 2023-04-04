import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../firestore';

export type User<T extends FirestoreDateLike = Timestamp> = {
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

  /** getFollowersV2 の状態保存 */
  _getFollowersV2Status: {
    lastRun: T;
    nextToken: string | null;
  };

  /** _checkIntegrityV2 の状態保存 */
  _checkIntegrityV2Status: {
    lastRun: T;
  };

  /** Twitter情報 */
  twitter: UserTwitter;

  /** @deprecated 廃止予定の Twitter API v1.1 ベースのフィールド */
  _getFollowersV1Status: {
    /** フォロワー一覧取得 最終実行日時 */
    lastUpdated: T;
    /** フォロワー一覧取得 state cursor */
    nextCursor: string;
    /** フォロワー一覧取得 state doc-id */
    currentWatchesId: string;
    /** フォロワー一覧取得 state 途中かどうか */
    pausedGetFollower: boolean;
  };
};

export type UserTwitter = {
  /** Twitter UID (ユニークな数字のID) */
  id: string;

  /** Twitter ID (@から始まるID) */
  screenName: string;

  /** 名前 (プロフィールの名前) */
  name: string;

  /** 非公開ユーザーかどうか */
  protected: boolean;

  /** プロフィール画像の URL */
  photoUrl: string;

  /** フォロワー数 */
  followersCount: number;

  /** 認証済みユーザーかどうか */
  verified: boolean;
};
