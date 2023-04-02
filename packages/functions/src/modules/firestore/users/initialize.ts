import { FirestoreDateLike, UserData } from '@yukukuru/types';
import * as admin from 'firebase-admin';
import { firestore } from '../../firebase';
import { getGroupIndex } from '../../group';

const collection = firestore.collection('users');

/**
 * ユーザーを初期化
 */
export const initializeUser = async (id: string, twitter: UserData['twitter']): Promise<void> => {
  const now = admin.firestore.FieldValue.serverTimestamp();

  const data: UserData<FirestoreDateLike> = {
    role: null,
    active: true,
    deletedAuth: false,
    lastUpdated: new Date(0),
    lastUpdatedTwUsers: new Date(0),
    lastUpdatedCheckIntegrity: new Date(0),
    lastUpdatedUserTwitterInfo: now,
    nextCursor: '-1',
    currentWatchesId: '',
    pausedGetFollower: false,
    group: getGroupIndex(id),
    allowedAccessUsers: [],
    twitter,
  };
  await collection.doc(id).set(data, { merge: true });
};
