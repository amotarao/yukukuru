export const topicName = 'cleanUsers';

export type Message = {
  /** Firebase UID */
  uid: string;

  /** 有効かどうか */
  active: boolean;

  /** auth が削除されているかどうか */
  deletedAuth: boolean;

  /** フォロワー一覧取得 最終実行日時 */
  lastUpdated: Date | string;

  /** フォロワー数 */
  followersCount: number;

  /** 送信日時 */
  publishedAt: Date | string;
};
