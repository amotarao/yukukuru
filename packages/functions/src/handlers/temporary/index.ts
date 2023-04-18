import * as functions from 'firebase-functions';
import { checkExistsSharedToken, initializeSharedToken } from '../../modules/firestore/sharedToken';
import { getToken } from '../../modules/firestore/tokens';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';
import { publishCheckValiditySharedToken } from '../sharedToken/checkValidity';

export const addNotExistsSharedTokens = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);

    // 対象ユーザーの取得
    const groups = [getGroupFromTime(1, now)];
    const docs = await getUserDocsByGroups(groups);

    const r = await Promise.all(
      docs.map(async (doc) => {
        const id = doc.id;

        const token = await getToken(id);
        if (!token) return false;

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
