import { FirestoreDateLike, Timestamp } from '../firestore';

export type User<T extends FirestoreDateLike = Timestamp> = {
  /** ロール */
  role: 'supporter' | null;

  /** 有効かどうか */
  active: boolean;

  /** グループ番号 0-14 のいずれか */
  group: number;

  /** 連携したユーザー ID リスト */
  linkedUserIds?: string[];

  /** getFollowersV2 の状態保存 */
  _getFollowersV2Status: {
    lastRun: T;
    nextToken: string | null;
    lastSetTwUsers: T;
  };

  /** _checkIntegrityV2 の状態保存 */
  _checkIntegrityV2Status: {
    lastRun: T;
  };

  /** Twitter情報 */
  twitter: UserTwitter;
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
};
