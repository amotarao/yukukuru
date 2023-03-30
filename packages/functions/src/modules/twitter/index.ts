import { UserV1 } from 'twitter-api-v2';

/**
 * @deprecated 廃止予定の Twitter API v1.1 ベースの型
 */
export type TwitterUserLegacy = Pick<
  UserV1,
  'id_str' | 'screen_name' | 'name' | 'profile_image_url_https' | 'followers_count' | 'verified'
>;
