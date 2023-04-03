import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../../firestore';

export type WatchV2<T extends FirestoreDateLike = Timestamp> = {
  /** フォロワーのIDリスト */
  followers: string[];

  /** 取得日時 */
  date: T;

  /** 取得が完了しているかどうか */
  ended: boolean;
};
