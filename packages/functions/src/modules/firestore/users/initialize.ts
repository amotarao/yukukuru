import { FirestoreDateLike, User, UserTwitter } from '@yukukuru/types';
import { getGroupIndex } from '../../group';
import { usersCollectionRef } from '.';

/**
 * ユーザーを初期化
 */
export const initializeUser = async (id: string, twitter: UserTwitter): Promise<void> => {
  const data: User<FirestoreDateLike> = {
    role: null,
    group: getGroupIndex(id),
    linkedUserIds: [],
    twitter,
    _getFollowersV2Status: {
      lastRun: new Date(0),
      nextToken: null,
      lastSetTwUsers: new Date(0),
    },
    _checkIntegrityV2Status: {
      lastRun: new Date(0),
    },
  };
  await usersCollectionRef.doc(id).set(data, { merge: true });
};
