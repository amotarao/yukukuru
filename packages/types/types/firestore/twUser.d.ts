import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../firestore';

export interface TwUserData<T extends FirestoreDateLike = Timestamp> {
  /** Twitter UID (ユニークな数字のID) */
  id: string;

  /** Twitter ID (@から始まるID) */
  screenName: string;

  /** 名前 (プロフィールの名前) */
  name: string;

  /** プロフィール画像の URL */
  photoUrl: string;

  /** 最終更新日時 */
  lastUpdated: T;
}
