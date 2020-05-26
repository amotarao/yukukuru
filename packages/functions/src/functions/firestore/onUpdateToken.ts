import { TokenData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { setUserToActive, setUserToNotActive } from '../../utils/firestore/users';

export const onUpdateTokenHandler = async ({ after }: functions.Change<FirebaseFirestore.DocumentSnapshot>) => {
  const { twitterAccessToken = null, twitterAccessTokenSecret = null, twitterId = null } = after.data() as TokenData;
  const invalid = !twitterAccessToken || !twitterAccessTokenSecret || !twitterId;
  if (invalid) {
    await setUserToNotActive(after.id);
  } else {
    await setUserToActive(after.id);
  }
};
