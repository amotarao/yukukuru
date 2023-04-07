import { FirestoreDateLike, Timestamp } from '../firestore';
import { UserTwitter } from './user.d';

export type DeletedUser<T extends FirestoreDateLike = Timestamp> = {
  /** ロール */
  role: 'supporter' | null;

  /** Twitter情報 */
  twitter: UserTwitter;

  _deleted: T;
};
