import * as functions from 'firebase-functions';
import { checkExistsSharedToken, initializeSharedToken } from '../../modules/firestore/sharedToken';
import { deleteToken, getTokens } from '../../modules/firestore/tokens';
import { getGroupFromTime, getGroupIndex } from '../../modules/group';
import { publishCheckValiditySharedToken } from '../sharedToken/checkValidity';

export const addNotExistsSharedTokens = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.schedule('*/12 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const group = getGroupFromTime(12, now);
    const tokens = (await getTokens()).filter((token) => getGroupIndex(token.id) === group);

    const r = await Promise.all(
      tokens.map(async (token) => {
        const id = token.id;

        if (!token.twitterAccessToken || !token.twitterAccessTokenSecret) {
          await deleteToken(id);
          console.error(`${id}'s token data is undefined.`);
          return;
        }

        const existsSharedToken = await checkExistsSharedToken(id);
        if (existsSharedToken) return false;

        await initializeSharedToken(id, {
          accessToken: token.twitterAccessToken,
          accessTokenSecret: token.twitterAccessTokenSecret,
          _lastUpdated: now,
        });
        await publishCheckValiditySharedToken({
          id,
          accessToken: token.twitterAccessToken,
          accessTokenSecret: token.twitterAccessTokenSecret,
        });
        return true;
      })
    );

    console.log(`✔️ ${r.filter((r) => r).length} added.`);
  });
