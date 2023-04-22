import { FirestoreDateLike, SharedToken } from '@yukukuru/types';
import { CollectionReference, QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';
import { getTwitterIdFromAccessToken } from '../../twitter-id-access-token';
import { bulkWriterErrorHandler } from '../error';

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
      v2_getUserFollowers: new Date(0),
      v2_getUsers: new Date(0),
      v2_getUser: new Date(0),
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

export const updateLastCheckedSharedToken = async (
  id: string,
  lastChecked: Date,
  skipCheckExists = false
): Promise<void> => {
  if (!skipCheckExists) {
    const exists = await checkExistsSharedToken(id);
    if (!exists) return;
  }

  const data: Pick<SharedToken<Date>, '_lastChecked'> = {
    _lastChecked: lastChecked,
  };
  await sharedTokensCollectionRef.doc(id).update(data);
};

export const deleteSharedToken = async (id: string, skipCheckExists = false): Promise<void> => {
  if (!skipCheckExists) {
    const exists = await checkExistsSharedToken(id);
    if (!exists) return;
  }

  await sharedTokensCollectionRef.doc(id).delete();
};

export const deleteSharedTokens = async (ids: string[]): Promise<void> => {
  const bulkWriter = firestore.bulkWriter();
  bulkWriter.onWriteError(bulkWriterErrorHandler);
  ids.forEach((id) => {
    bulkWriter.delete(sharedTokensCollectionRef.doc(id));
  });
  await bulkWriter.close();
};

export const getSharedTokensForGetFollowers = async (
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
  now: Date,
  skipCheckExists = false
): Promise<void> => {
  if (!skipCheckExists) {
    const exists = await checkExistsSharedToken(id);
    if (!exists) return;
  }

  const data: Partial<{ [key in `_lastUsed.${keyof SharedToken['_lastUsed']}`]: Date }> = {};
  targetApis.forEach((api) => {
    data[`_lastUsed.${api}`] = now;
  });
  await sharedTokensCollectionRef.doc(id).update(data);
};

export const getSharedTokensByAccessToken = async (
  accessToken: string
): Promise<QueryDocumentSnapshot<SharedToken>[]> => {
  const twitterId = getTwitterIdFromAccessToken(accessToken);
  const snapshot = await sharedTokensCollectionRef
    .where('accessToken', '>=', `${twitterId}-`) // - charCode 45
    .where('accessToken', '<', `${twitterId}.`) // . charCode 46
    .get();
  return snapshot.docs as QueryDocumentSnapshot<SharedToken>[];
};
