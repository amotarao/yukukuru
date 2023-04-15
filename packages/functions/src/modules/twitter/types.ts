import { UserV2 } from 'twitter-api-v2';

export type PickedTwitterUser = Pick<
  UserV2,
  'id' | 'username' | 'name' | 'protected' | 'profile_image_url' | 'public_metrics'
>;

export type TwitterUser = Required<PickedTwitterUser>;

export type TwitterErrorUser = {
  id: string;
  status: 'deleted' | 'suspended' | 'unknown';
};
