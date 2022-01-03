import { TokenData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { setUserToActive, setUserToNotActive } from '../../modules/firestore/users/active';

/** Firestore: トークンが更新されたときの処理 */
export const updateActive = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .firestore.document('tokens/{userId}')
  .onUpdate(async ({ after }) => {
    const { twitterAccessToken = null, twitterAccessTokenSecret = null, twitterId = null } = after.data() as TokenData;
    const invalid = !twitterAccessToken || !twitterAccessTokenSecret || !twitterId;
    if (invalid) {
      await setUserToNotActive(after.id);
    } else {
      await setUserToActive(after.id);
    }
  });