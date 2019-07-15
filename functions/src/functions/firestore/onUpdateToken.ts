import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';

interface TokenData {
  twitterAccessToken: string;
  twitterAccessTokenSecret: string;
  twitterId: string;
}

export default async ({ after }: functions.Change<FirebaseFirestore.DocumentSnapshot>) => {
  const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = after.data() as TokenData;

  const invalid = !twitterAccessToken || !twitterAccessTokenSecret || !twitterId;

  await firestore
    .collection('users')
    .doc(after.id)
    .set({ invalid }, { merge: true });
};
