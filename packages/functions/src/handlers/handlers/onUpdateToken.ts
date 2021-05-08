import { TokenData } from '@yukukuru/types';
import { updateUserInvalidToken, updateUserValidToken } from '../../modules/firestore/users/validToken';
import { FirestoreOnUpdateHandler } from '../../types/functions';

export const onUpdateTokenHandler: FirestoreOnUpdateHandler = async ({ after }) => {
  const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = after.data() as TokenData;
  const invalid = !twitterAccessToken || !twitterAccessTokenSecret || !twitterId;
  if (invalid) {
    await updateUserInvalidToken(after.id);
  } else {
    await updateUserValidToken(after.id);
  }
};
