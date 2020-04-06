import { FirestoreDateLike } from '../../firestore';

export interface WatchData {
  /** フォロワーのIDリスト */
  followers: string[];

  /** 取得開始日時 */
  getStartDate: FirestoreDateLike;

  /** 取得終了日時 */
  getEndDate: FirestoreDateLike;

  /** 取得が完了しているかどうか */
  ended?: boolean;
}
