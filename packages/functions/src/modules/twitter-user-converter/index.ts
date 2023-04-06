import { RecordUserWithProfile, RecordV2User, TwUser, UserTwitter } from '@yukukuru/types';
import { TwitterUser } from '../twitter/types';

export const convertTwitterUserToUserTwitter = (user: TwitterUser): UserTwitter => {
  return {
    id: user.id,
    screenName: user.username,
    name: user.name,
    protected: user.protected,
    photoUrl: user.profile_image_url,
    followersCount: user.public_metrics.followers_count || 0,
  };
};

export const convertTwitterUserToRecordUser =
  (maybeDeletedOrSuspended = false) =>
  (user: TwitterUser): RecordUserWithProfile => {
    return {
      id: user.id,
      screenName: user.username,
      displayName: user.name,
      photoUrl: user.profile_image_url,
      maybeDeletedOrSuspended,
    };
  };

export const convertTwitterUserToTwUser = (user: TwitterUser): Omit<TwUser, 'lastUpdated'> => {
  return {
    id: user.id,
    screenName: user.username,
    name: user.name,
    photoUrl: user.profile_image_url,
  };
};

export const convertTwUserToRecordUser =
  (maybeDeletedOrSuspended = false) =>
  (twUser: TwUser): RecordUserWithProfile => {
    return {
      id: twUser.id,
      screenName: twUser.screenName,
      displayName: twUser.name,
      photoUrl: twUser.photoUrl,
      maybeDeletedOrSuspended,
    };
  };

export const convertTwUserToRecordV2User = (twUser: TwUser): RecordV2User => {
  return {
    screenName: twUser.screenName,
    displayName: twUser.name,
    photoUrl: twUser.photoUrl,
  };
};

export const convertTwitterUserToRecordV2User = (twitterUser: TwitterUser): RecordV2User => {
  return {
    screenName: twitterUser.username,
    displayName: twitterUser.name,
    photoUrl: twitterUser.profile_image_url,
  };
};
