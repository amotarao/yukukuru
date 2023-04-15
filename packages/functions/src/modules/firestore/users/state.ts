import { User, UserTwitter } from '@yukukuru/types';
import { usersCollectionRef } from '.';

/**
 * フォロワー取得処理の状態を保存
 */
export const setUserGetFollowersV2Status = async (
  userId: string,
  nextToken: string | null,
  ended: boolean,
  date: Date
): Promise<void> => {
  await usersCollectionRef.doc(userId).update(
    ended
      ? {
          '_getFollowersV2Status.lastRun': date,
          '_getFollowersV2Status.nextToken': nextToken,
        }
      : {
          '_getFollowersV2Status.nextToken': nextToken,
        }
  );
};

export const setCheckIntegrityV2Status = async (userId: string, date: Date): Promise<void> => {
  await usersCollectionRef.doc(userId).update({
    '_checkIntegrityV2Status.lastRun': date,
  });
};

export const setUserTwitter = async (
  userId: string,
  twitter: UserTwitter,
  status?: User<Date>['_twitterStatus']
): Promise<void> => {
  await usersCollectionRef.doc(userId).update({
    twitter,
    _twitterStatus: status,
  });
};

export const setUserTwitterProtected = async (userId: string): Promise<void> => {
  await usersCollectionRef.doc(userId).update({
    'twitter.protected': true,
  });
};

export const setUserGetFollowersV2LastSetTwUsers = async (userId: string, date: Date): Promise<void> => {
  await usersCollectionRef.doc(userId).update({
    '_getFollowersV2Status.lastSetTwUsers': date,
  });
};
