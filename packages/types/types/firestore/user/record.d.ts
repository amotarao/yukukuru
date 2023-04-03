import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../../firestore';

export type RecordType = 'yuku' | 'kuru';

export type Record<T extends FirestoreDateLike = Timestamp> = {
  /** record のタイプ */
  type: RecordType;

  /** ユーザー情報 */
  user: RecordUser;

  /** record が更新された可能性のある期間の開始日時 */
  durationStart: T;

  /** record が更新された可能性のある期間の終了日時 */
  durationEnd: T;
};

export type RecordUser = RecordUserWithProfile | RecordUserWithoutProfile;

export type RecordUserWithProfile = {
  /** Twitter UID (ユニークな数字のID) */
  id: string;

  /** Twitter ID (@から始まるID) */
  screenName: string;

  /** 名前 (プロフィールの名前) */
  displayName: string;

  /** プロフィール画像の URL */
  photoUrl: string;

  /** 削除または凍結された可能性があるかどうか */
  maybeDeletedOrSuspended: boolean;
};

export type RecordUserWithoutProfile = {
  /** Twitter UID (ユニークな数字のID) */
  id: string;

  /** 削除または凍結された可能性があるかどうか */
  maybeDeletedOrSuspended: boolean;
};
