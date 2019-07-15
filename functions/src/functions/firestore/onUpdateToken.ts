import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { TokenData } from '../../utils/interfaces';

export default async ({ after }: functions.Change<FirebaseFirestore.DocumentSnapshot>) => {
  const { twitterAccessToken = null, twitterAccessTokenSecret = null, twitterId = null } = after.data() as TokenData;

  const invalid = !twitterAccessToken || !twitterAccessTokenSecret || !twitterId;

  await firestore
    .collection('users')
    .doc(after.id)
    .set({ invalid }, { merge: true });
};
