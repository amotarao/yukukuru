import { FirestoreDateLike, FirestoreIdData, SharedToken } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { CollectionReference, QuerySnapshot } from 'firebase-admin/firestore';
import { firestore } from '../../firebase';

const collectionId = 'sharedTokens';
const collectionRef = firestore.collection(collectionId) as CollectionReference<SharedToken<FirestoreDateLike>>;

const convertToIdData = (snapshot: QuerySnapshot<SharedToken<FirestoreDateLike>>): FirestoreIdData<SharedToken>[] => {
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as SharedToken }));
};

export const existsSharedToken = async (id: string): Promise<boolean> => {
  const doc = await collectionRef.doc(id).get();
  return doc.exists;
};

export const initializeSharedToken = async (
  id: string,
  inputData: Pick<SharedToken<Date>, 'accessToken' | 'accessTokenSecret' | '_invalid' | '_lastUpdated'>
): Promise<void> => {
  const data: SharedToken<Date> = {
    ...inputData,
    _lastChecked: inputData._lastUpdated,
    _lastUsed: {
      v1_getFollowersIds: new Date(2000, 0, 1),
      v2_getUserFollowers: new Date(2000, 0, 1),
      v2_getUsers: new Date(2000, 0, 1),
    },
  };
  collectionRef.doc(id).set(data);
};

export const updateSharedToken = async (
  id: string,
  inputData: Pick<SharedToken<Date>, 'accessToken' | 'accessTokenSecret' | '_invalid' | '_lastUpdated'>
): Promise<void> => {
  const data: Pick<
    SharedToken<Date>,
    'accessToken' | 'accessTokenSecret' | '_invalid' | '_lastUpdated' | '_lastChecked'
  > = {
    ...inputData,
    _lastChecked: inputData._lastUpdated,
  };
  collectionRef.doc(id).update(data);
};

export const getValidSharedTokenDocsOrderByLastChecked = async (
  limit: number
): Promise<FirestoreIdData<SharedToken>[]> => {
  const snapshot = await collectionRef.where('_invalid', '==', false).orderBy('_lastChecked', 'asc').limit(limit).get();
  return convertToIdData(snapshot);
};

export const getInvalidSharedTokenDocsOrderByLastChecked = async (
  limit: number
): Promise<FirestoreIdData<SharedToken>[]> => {
  const snapshot = await collectionRef.where('_invalid', '==', true).orderBy('_lastChecked', 'asc').limit(limit).get();
  return convertToIdData(snapshot);
};

export const setValidSharedToken = async (id: string, lastChecked: Date): Promise<void> => {
  const data: Pick<SharedToken<Date>, '_invalid' | '_lastChecked'> = {
    _invalid: false,
    _lastChecked: lastChecked,
  };
  await collectionRef.doc(id).update(data);
};

export const setInvalidSharedToken = async (id: string, lastChecked: Date): Promise<void> => {
  const data: Pick<SharedToken<Date>, '_invalid' | '_lastChecked'> = {
    _invalid: true,
    _lastChecked: lastChecked,
  };
  await collectionRef.doc(id).update(data);
};

export const deleteSharedToken = async (id: string): Promise<void> => {
  await collectionRef.doc(id).delete();
};

export const getSharedTokensForGetFollowersIds = async (
  now: Date,
  limit: number
): Promise<FirestoreIdData<SharedToken>[]> => {
  const beforeDate = dayjs(now).subtract(15, 'minutes').toDate();
  const snapshot = await collectionRef
    .where('_invalid', '==', false)
    .where('_lastUsed.v1_getFollowersIds', '<', beforeDate)
    .orderBy('_lastUsed.v1_getFollowersIds')
    .limit(limit)
    .get();
  return convertToIdData(snapshot);
};

export const setLastUsedSharedToken = async (
  id: string,
  targetApis: (keyof SharedToken['_lastUsed'])[],
  now: Date
): Promise<void> => {
  const data: Partial<{ [key in `_lastUsed.${keyof SharedToken['_lastUsed']}`]: Date }> = {};
  targetApis.forEach((api) => {
    data[`_lastUsed.${api}`] = now;
  });
  await collectionRef.doc(id).update(data);
};

export const getSharedTokensByAccessToken = async (accessToken: string): Promise<FirestoreIdData<SharedToken>[]> => {
  const snapshot = await collectionRef.where('accessToken', '==', accessToken).get();
  return convertToIdData(snapshot);
};
