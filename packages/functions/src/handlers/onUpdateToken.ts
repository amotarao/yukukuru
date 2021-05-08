import { TokenData } from '@yukukuru/types';
import { setUserToActive, setUserToNotActive } from '../modules/firestore/users/active';
import { FirestoreOnUpdateHandler } from '../types/functions';

export const onUpdateTokenHandler: FirestoreOnUpdateHandler = async ({ after }) => {
  const { twitterAccessToken = null, twitterAccessTokenSecret = null, twitterId = null } = after.data() as TokenData;
  const invalid = !twitterAccessToken || !twitterAccessTokenSecret || !twitterId;
  if (invalid) {
    await setUserToNotActive(after.id);
  } else {
    await setUserToActive(after.id);
  }
};
