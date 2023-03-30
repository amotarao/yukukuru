import { RecordUserData, UserData } from '@yukukuru/types';
import { PickedTwitterUser, TwitterUser } from '../twitter';

export const toRequiredTwitterUser = (user: PickedTwitterUser): TwitterUser => {
  return {
    ...user,
    profile_image_url: user.profile_image_url || '',
    public_metrics: user.public_metrics || {
      followers_count: 0,
      following_count: 0,
      tweet_count: 0,
      listed_count: 0,
    },
    verified: user.verified || false,
  };
};

export const convertTwitterUserToUserDataTwitter = (user: TwitterUser): UserData['twitter'] => {
  return {
    id: user.id,
    screenName: user.username,
    name: user.name,
    photoUrl: user.profile_image_url,
    followersCount: user.public_metrics.followers_count || 0,
    verified: user.verified,
  };
};

export const convertTwitterUserToRecordUserData =
  (maybeDeletedOrSuspended = false) =>
  (user: TwitterUser): RecordUserData => {
    return {
      id: user.id,
      screenName: user.username,
      displayName: user.name,
      photoUrl: user.profile_image_url,
      maybeDeletedOrSuspended,
    };
  };
