import { RecordUserWithProfile, TwUserData, UserData } from '@yukukuru/types';
import { TwitterUser } from '../twitter/types';

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
  (user: TwitterUser): RecordUserWithProfile => {
    return {
      id: user.id,
      screenName: user.username,
      displayName: user.name,
      photoUrl: user.profile_image_url,
      maybeDeletedOrSuspended,
    };
  };

export const convertTwitterUserToTwUser = (user: TwitterUser): Omit<TwUserData, 'lastUpdated'> => {
  return {
    id: user.id,
    screenName: user.username,
    name: user.name,
    photoUrl: user.profile_image_url,
  };
};

export const convertTwUserDataToRecordUserData =
  (maybeDeletedOrSuspended = false) =>
  (twUser: TwUserData): RecordUserWithProfile => {
    return {
      id: twUser.id,
      screenName: twUser.screenName,
      displayName: twUser.name,
      photoUrl: twUser.photoUrl,
      maybeDeletedOrSuspended,
    };
  };
