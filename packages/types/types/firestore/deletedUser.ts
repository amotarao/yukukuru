import { StripeRole } from '..';
import { FirestoreDateLike, Timestamp } from '../firestore';
import { UserTwitter } from './user.d';

export type DeletedUser<T extends FirestoreDateLike = Timestamp> = {
  /** ロール */
  role: StripeRole;

  /** Twitter情報 */
  twitter: UserTwitter;

  _deleted: T;
};
