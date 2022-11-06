import { UserV1 } from 'twitter-api-v2';

export type TwitterUser = Pick<
  UserV1,
  'id_str' | 'screen_name' | 'name' | 'profile_image_url_https' | 'followers_count' | 'verified'
>;
