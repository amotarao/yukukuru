import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../../firestore';

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
  user?: RecordV2User;

  /** checkIntegrity により追加 */
  _addedByCheckIntegrity: boolean;

  /** checkIntegrity により削除 */
  _deletedByCheckIntegrity: boolean;
};

export type RecordV2User = {
  /** Twitter ID (@から始まるID) */
  screenName: string;

  /** 名前 (プロフィールの名前) */
  displayName: string;

  /** プロフィール画像の URL */
  photoUrl: string;
};
