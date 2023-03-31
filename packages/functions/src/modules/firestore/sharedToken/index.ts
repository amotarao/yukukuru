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
      v1_getFollowersIds: new Date(2000, 0, 1),
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
