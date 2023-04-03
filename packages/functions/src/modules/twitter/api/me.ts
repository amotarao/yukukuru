import { TwitterApiReadOnly } from 'twitter-api-v2';
import { userFields } from '../constants';
import { toRequiredTwitterUser } from '../converter';
import { twitterClientErrorHandler } from '../error';

export const getMe = async (ownClient: TwitterApiReadOnly) => {
  return ownClient.v2
    .me({ ...userFields })
    .then((me) => toRequiredTwitterUser(me.data))
    .catch(twitterClientErrorHandler);
};
