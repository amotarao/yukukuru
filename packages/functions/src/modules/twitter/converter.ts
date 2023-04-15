import { InlineErrorV2 } from 'twitter-api-v2';
import { getInlineErrorV2Status } from './error';
import { PickedTwitterUser, TwitterErrorUser, TwitterUser } from './types';

export const toRequiredTwitterUser = (user: PickedTwitterUser): TwitterUser => {
  return {
    ...user,
    protected: user.protected || false,
    profile_image_url: user.profile_image_url || '',
    public_metrics: user.public_metrics || {
      followers_count: 0,
      following_count: 0,
      tweet_count: 0,
      listed_count: 0,
    },
  };
};

export const convertErrorUsers = (errors?: InlineErrorV2[]): TwitterErrorUser[] => {
  return (
    errors
      ?.map((errorUser): TwitterErrorUser | null => {
        const id = errorUser.resource_id;
        const status = getInlineErrorV2Status(errorUser);

        if (!id || status === 'unknown') {
          console.log('Unknown error user', JSON.stringify(errorUser));
        }
        if (!id) {
          return null;
        }
        return { id, status };
      })
      .filter((errorUser): errorUser is TwitterErrorUser => errorUser !== null) ?? []
  );
};
