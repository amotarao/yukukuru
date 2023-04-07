import { FirestoreDateLike, Timestamp } from '../firestore';

export type UserStatus<T extends FirestoreDateLike = Timestamp> = {
  /** 最終閲覧日時 */
  lastViewing: T;
};
