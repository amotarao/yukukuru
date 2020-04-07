import { TokenData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { updateUserInvalid } from '../../utils/firestore/users';

export default async ({ after }: functions.Change<FirebaseFirestore.DocumentSnapshot>): void => {
  const { twitterAccessToken = null, twitterAccessTokenSecret = null, twitterId = null } = after.data() as TokenData;
  const invalid = !twitterAccessToken || !twitterAccessTokenSecret || !twitterId;
  await updateUserInvalid(after.id, invalid);
};
