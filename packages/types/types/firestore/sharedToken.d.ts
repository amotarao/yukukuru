import { FirestoreDateLike, Timestamp } from '../firestore';

export type SharedToken<T extends FirestoreDateLike = Timestamp> = {
  /** アクセストークン */
  accessToken: string;

  /** アクセストークンシークレット */
  accessTokenSecret: string;

  /** 最終更新日時 */
  _lastUpdated: T;

  /** 最終確認日時 */
  _lastChecked: T;

  /** 最終利用日時 */
  _lastUsed: {
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

    /**
     * v2 GET /2/users/:id
     *
     * @see https://developer.twitter.com/en/docs/twitter-api/users/lookup/api-reference/get-users-id
     */
    v2_getUser: T;
  };
};
