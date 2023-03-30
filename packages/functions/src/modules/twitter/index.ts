import { UserV2 } from 'twitter-api-v2';

export type TwitterUser = Required<
  Pick<UserV2, 'id' | 'username' | 'name' | 'profile_image_url' | 'public_metrics' | 'verified'>
>;
