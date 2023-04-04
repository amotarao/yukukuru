import { FirestoreDateLike, UserData } from '@yukukuru/types';
import { getGroupIndex } from '../../group';
import { usersCollection } from '.';

/**
 * ユーザーを初期化
 */
export const initializeUser = async (id: string, twitter: UserData['twitter']): Promise<void> => {
  const data: UserData<FirestoreDateLike> = {
    role: null,
    active: true,
    deletedAuth: false,
    group: getGroupIndex(id),
    allowedAccessUsers: [],
    twitter,
    _getFollowersV2Status: {
      lastRun: new Date(0),
      nextToken: null,
    },
    _checkIntegrityV2Status: {
      lastRun: new Date(0),
    },
    _getFollowersV1Status: {
      lastUpdated: new Date(0),
      nextCursor: '-1',
      currentWatchesId: '',
      pausedGetFollower: false,
    },
  };
  await usersCollection.doc(id).set(data, { merge: true });
};
