import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../../firestore';

export type RecordType = 'yuku' | 'kuru';

export type RecordData<T extends FirestoreDateLike = Timestamp> = {
  /** record のタイプ */
  type: RecordType;

  /** ユーザー情報 */
  user: RecordUserData;

  /** record が更新された可能性のある期間の開始日時 */
  durationStart: T;

  /** record が更新された可能性のある期間の終了日時 */
  durationEnd: T;
};

export type RecordUserData = {
  /** Twitter UID (ユニークな数字のID) */
  id: string;

  /** Twitter ID (@から始まるID) */
  screenName?: string;

  /** 名前 (プロフィールの名前) */
  displayName?: string;

  /** プロフィール画像の URL */
  photoUrl?: string;

  /** 削除または凍結された可能性があるかどうか */
  maybeDeletedOrSuspended: boolean;
};
