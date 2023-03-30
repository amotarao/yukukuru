import { UserV2 } from 'twitter-api-v2';

export type PickedTwitterUser = Pick<
  UserV2,
  'id' | 'username' | 'name' | 'profile_image_url' | 'public_metrics' | 'verified'
>;

export type TwitterUser = Required<PickedTwitterUser>;
