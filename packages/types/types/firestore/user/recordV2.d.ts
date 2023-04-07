import { FirestoreDateLike, Timestamp } from '../../firestore';

export type RecordV2Type = 'yuku' | 'kuru';

export type RecordV2<T extends FirestoreDateLike = Timestamp> = {
  /** record のタイプ */
  type: RecordV2Type;

  /** 記録日時 */
  date: T;

  /** Twitter ID */
  twitterId: string;

  /** アカウント状態 */
  status: 'active' | 'deleted' | 'suspended' | 'unknown';

  /** ユーザー情報 */
  user: RecordV2User | null;

  /** 論理削除したかどうか */
  _deleted: boolean;

  /** 追加した関数 */
  _addedBy: 'recordV2' | 'checkIntegrityV2';

  /** 削除した関数 */
  _deletedBy: 'checkIntegrityV2' | null;
};

export type RecordV2User = {
  /** Twitter ID (@から始まるID) */
  screenName: string;

  /** 名前 (プロフィールの名前) */
  displayName: string;

  /** プロフィール画像の URL */
  photoUrl: string;
};
