import { setUserResult } from '../utils/firestore/users/setUserResult';
import { setUserResultWithNoChange } from '../utils/firestore/users/setUserResultWithNoChange';
import { tmpGetTargetsToGetFollowers } from '../utils/firestore/users/tmpGetTargetsToGetFollowers';
import { addWatch } from '../utils/firestore/users/watches/addWatch';
import { getToken } from '../utils/firestore/tokens/getToken';
import { setTokenInvalid } from '../utils/firestore/tokens/setTokenInvalid';
import { getFollowersIds } from '../utils/twitter/getFollowersIds';
import { checkInvalidToken, checkProtectedUser } from '../utils/twitter/error';
import { TwitterAccessToken } from '../utils/twitter/generateClient';

export default async (): Promise<void> => {
  const now = new Date();
  const targets = await tmpGetTargetsToGetFollowers();

  const requests = targets.map(async (doc) => {
    const { nextCursor } = doc.data;

    const token = await getToken(doc.id);
    if (!token) {
      console.log(doc.id, 'no-token');
      await setTokenInvalid(doc.id);
      return;
    }
    const { twitterAccessToken, twitterAccessTokenSecret, twitterId } = token;

    const twitterToken: TwitterAccessToken = {
      access_token_key: twitterAccessToken,
      access_token_secret: twitterAccessTokenSecret,
    };

    const result = await getFollowersIds(twitterToken, {
      userId: twitterId,
      cursor: nextCursor,
      count: 10000, // Firestore ドキュメント データサイズ制限を考慮した数値
    });

    if (result.errors.length) {
      console.error(doc.id, result.errors);

      const invalidToken = checkInvalidToken(result.errors);
      const protectedUser = checkProtectedUser(result.errors);

      if (invalidToken) {
        await setTokenInvalid(doc.id);
      }

      if (protectedUser) {
        await setUserResultWithNoChange(doc.id, now);
      }
      if (invalidToken || protectedUser) {
        return;
      }
    }

    const { ids, nextCursor: newNextCursor } = result;

    if (newNextCursor === null) {
      console.error('no next cursor');
      return;
    }

    const ended = newNextCursor === '0' || newNextCursor === '-1';
    const watchId = await addWatch(doc.id, ids, now, ended);
    await setUserResult(doc.id, watchId, newNextCursor, now);

    return {
      userId: doc.id,
      watchId,
      newNextCursor,
    };
  });

  const results = await Promise.all(requests);
  console.log(results);
};
