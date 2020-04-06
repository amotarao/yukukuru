import { FirestoreDateLike } from '../../firestore';

export type RecordType = 'yuku' | 'kuru';

export interface RecordData {
  /** record のタイプ */
  type: RecordType;

  /** ユーザー情報 */
  user: RecordUserData;

  /** record が更新された可能性のある期間の開始日時 */
  durationStart: FirestoreDateLike;

  /** record が更新された可能性のある期間の終了日時 */
  durationEnd: FirestoreDateLike;
}

export interface RecordUserData {
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
}

/**
 * Memo: 古い形式のため、移行が完了したら削除する
 */
export interface RecordDataOld {
  /** この期間にフォローされたユーザーリスト (くる) */
  cameUsers: RecordUserDataOld[];

  /** この期間にフォロー解除されたユーザーリスト (ゆく) */
  leftUsers: RecordUserDataOld[];

  /** record が更新された可能性のある期間の開始日時 */
  durationStart: FirestoreDateLike;

  /** record が更新された可能性のある期間の終了日時 */
  durationEnd: FirestoreDateLike;
}

/**
 * Memo: 古い形式のため、移行が完了したら削除する
 */
export interface RecordUserDataOld {
  /** Twitter UID (ユニークな数字のID) */
  id: string;

  /** Twitter ID (@から始まるID) */
  name?: string;

  /** 名前 (プロフィールの名前) */
  screenName?: string;

  /** プロフィール画像の URL */
  photoUrl?: string;

  /** 削除または凍結された可能性があるかどうか */
  notFounded?: boolean;
}
