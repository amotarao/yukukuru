import { Timestamp } from '@firebase/firestore-types';
import { FirestoreDateLike } from '../firestore';

export type SharedToken<T extends FirestoreDateLike = Timestamp> = {
  /** アクセストークン */
  accessToken: string;

  /** アクセストークンシークレット */
  accessTokenSecret: string;

  /** 無効かどうか */
  _invalid: boolean;

  /** 最終更新日時 */
  _lastUpdated: T;

  /** 最終確認日時 */
  _lastChecked: T;

  /** 最終利用日時 */
  _lastUsed: {
    /**
     * v1.1 GET /followers/ids
     *
     * @see https://developer.twitter.com/en/docs/twitter-api/v1/accounts-and-users/follow-search-get-users/api-reference/get-followers-ids
     * @deprecated 廃止予定の Twitter API v1.1 ベースのフィールド
     */
    v1_getFollowersIds: T;

    /**
     * v2 GET /2/users/:id/followers
     *
     * @see https://developer.twitter.com/en/docs/twitter-api/users/follows/api-reference/get-users-id-followers
     */
    v2_getUserFollowers: T;

    /**
     * v2 GET /2/users
     *
     * @see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users
     */
    v2_getUsers: T;
  };
};
