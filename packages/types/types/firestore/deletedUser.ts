import { UserTwitter } from './user.d';

export type DeletedUser = {
  /** ロール */
  role: 'supporter' | null;

  /** Twitter情報 */
  twitter: UserTwitter;
};
