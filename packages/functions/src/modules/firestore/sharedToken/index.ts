import { SharedToken } from '@yukukuru/types';
import { firestore } from '../../firebase';

const collectionId = 'sharedTokens';

export const existsSharedToken = async (id: string): Promise<boolean> => {
  const doc = await firestore.collection(collectionId).doc(id).get();
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
      v2_getUserFollowers: new Date(2000, 0, 1),
      v2_getUsers: new Date(2000, 0, 1),
    },
  };
  firestore.collection(collectionId).doc(id).set(data);
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
  firestore.collection(collectionId).doc(id).update(data);
};

export const getSharedTokenDocsOrderByLastChecked = async (): Promise<{ id: string; data: SharedToken }[]> => {
  const snapshot = await firestore
    .collection(collectionId)
    .where('_invalid', '==', false)
    .orderBy('_lastChecked', 'asc')
    .limit(100)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, data: doc.data() as SharedToken }));
};

export const setInvalidSharedToken = async (id: string): Promise<void> => {
  await firestore.collection(collectionId).doc(id).update({ _invalid: true });
};

export const setLastCheckedSharedToken = async (id: string, lastChecked: Date): Promise<void> => {
  await firestore.collection(collectionId).doc(id).update({ _lastChecked: lastChecked });
};
