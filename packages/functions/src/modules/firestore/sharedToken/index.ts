import { FirestoreDateLike, SharedToken } from '@yukukuru/types';
import { CollectionReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

const collectionId = 'sharedTokens';
export const sharedTokensCollectionRef = firestore.collection(collectionId) as CollectionReference<
  SharedToken<FirestoreDateLike>
>;

export const checkExistsSharedToken = async (id: string): Promise<boolean> => {
  const doc = await sharedTokensCollectionRef.doc(id).get();
  return doc.exists;
};

export const initializeSharedToken = async (
  id: string,
  inputData: Pick<SharedToken<Date>, 'accessToken' | 'accessTokenSecret' | '_lastUpdated'>
): Promise<void> => {
  const data: SharedToken<Date> = {
    ...inputData,
    _lastChecked: inputData._lastUpdated,
    _lastUsed: {
      v2_getUserFollowers: new Date(2000, 0, 1),
      v2_getUsers: new Date(2000, 0, 1),
    },
  };
  sharedTokensCollectionRef.doc(id).set(data, { merge: true });
};

export const updateSharedToken = async (
  id: string,
  inputData: Pick<SharedToken<Date>, 'accessToken' | 'accessTokenSecret' | '_lastUpdated'>
): Promise<void> => {
  const data: Pick<SharedToken<Date>, 'accessToken' | 'accessTokenSecret' | '_lastUpdated' | '_lastChecked'> = {
    ...inputData,
    _lastChecked: inputData._lastUpdated,
  };
  sharedTokensCollectionRef.doc(id).update(data);
};

export const getSharedTokenDocsOrderByLastChecked = async (
  beforeDate: Date,
  limit: number
): Promise<QueryDocumentSnapshot<SharedToken>[]> => {
  const snapshot = await sharedTokensCollectionRef
    .where('_lastChecked', '<', beforeDate)
    .orderBy('_lastChecked', 'asc')
    .limit(limit)
    .get();
  return snapshot.docs as QueryDocumentSnapshot<SharedToken>[];
};

export const updateLastCheckedSharedToken = async (id: string, lastChecked: Date): Promise<void> => {
  const data: Pick<SharedToken<Date>, '_lastChecked'> = {
    _lastChecked: lastChecked,
  };
  await sharedTokensCollectionRef.doc(id).update(data);
};

export const deleteSharedToken = async (id: string): Promise<void> => {
  await sharedTokensCollectionRef.doc(id).delete();
};

export const getSharedTokensForGetFollowersV2 = async (
  beforeDate: Date,
  limit: number
): Promise<QueryDocumentSnapshot<SharedToken>[]> => {
  const snapshot = await sharedTokensCollectionRef
    .where('_lastUsed.v2_getUserFollowers', '<', beforeDate)
    .orderBy('_lastUsed.v2_getUserFollowers')
    .limit(limit)
    .get();
  return snapshot.docs as QueryDocumentSnapshot<SharedToken>[];
};

export const getSharedTokensForGetUsers = async (
  beforeDate: Date,
  limit: number
): Promise<QueryDocumentSnapshot<SharedToken>[]> => {
  const snapshot = await sharedTokensCollectionRef
    .where('_lastUsed.v2_getUsers', '<', beforeDate)
    .orderBy('_lastUsed.v2_getUsers')
    .limit(limit)
    .get();
  return snapshot.docs as QueryDocumentSnapshot<SharedToken>[];
};

export const updateLastUsedSharedToken = async (
  id: string,
  targetApis: (keyof SharedToken['_lastUsed'])[],
  now: Date
): Promise<void> => {
  const data: Partial<{ [key in `_lastUsed.${keyof SharedToken['_lastUsed']}`]: Date }> = {};
  targetApis.forEach((api) => {
    data[`_lastUsed.${api}`] = now;
  });
  await sharedTokensCollectionRef.doc(id).update(data);
};

export const getSharedTokensByAccessToken = async (
  accessToken: string
): Promise<QueryDocumentSnapshot<SharedToken>[]> => {
  const snapshot = await sharedTokensCollectionRef.where('accessToken', '==', accessToken).get();
  return snapshot.docs as QueryDocumentSnapshot<SharedToken>[];
};
