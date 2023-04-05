import { UserTwitter } from '@yukukuru/types';
import { usersCollection } from '.';

/**
 * フォロワー取得処理の状態を保存
 */
export const setUserGetFollowersV2Status = async (
  userId: string,
  nextToken: string | null,
  ended: boolean,
  date: Date
): Promise<void> => {
  await usersCollection.doc(userId).update(
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
  await usersCollection.doc(userId).update({
    '_checkIntegrityV2Status.lastRun': date,
  });
};

export const setUserTwitter = async (userId: string, twitter: UserTwitter): Promise<void> => {
  await usersCollection.doc(userId).update({
    twitter,
  });
};

export const setUserTwitterProtected = async (userId: string): Promise<void> => {
  await usersCollection.doc(userId).update({
    'twitter.protected': true,
  });
};
