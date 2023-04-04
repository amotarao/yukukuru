import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../../firestore';

export type Watch<T extends FirestoreDateLike = Timestamp> = {
  /** フォロワーのIDリスト */
  followers: string[];

  /** 取得開始日時 */
  getStartDate: T;

  /** 取得終了日時 */
  getEndDate: T;

  /** 取得が完了しているかどうか */
  ended?: boolean;
};
