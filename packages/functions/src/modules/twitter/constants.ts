import { UsersV2Params } from 'twitter-api-v2';

export const userFields: Pick<UsersV2Params, 'user.fields'> = {
  'user.fields': ['id', 'username', 'name', 'protected', 'profile_image_url', 'public_metrics'],
};
