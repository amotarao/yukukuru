import { TwitterApiReadOnly } from 'twitter-api-v2';
import { toRequiredTwitterUser } from '../../twitter-user-converter';
import { twitterClientErrorHandler } from '../error';

export const getMe = async (ownClient: TwitterApiReadOnly) => {
  return ownClient.v2
    .me({
      'user.fields': ['id', 'username', 'name', 'profile_image_url', 'public_metrics', 'verified'],
    })
    .then((me) => toRequiredTwitterUser(me.data))
    .catch(twitterClientErrorHandler);
};
