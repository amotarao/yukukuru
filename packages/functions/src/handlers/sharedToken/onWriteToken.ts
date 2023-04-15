import { Token } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { deleteSharedToken, initializeSharedToken, updateSharedToken } from '../../modules/firestore/sharedToken';
import { checkExistsSharedToken } from '../../modules/firestore/sharedToken/index';
import { getWriteType } from '../../modules/functions/firestore';

/** Firestore: トークンが更新されたときの処理 */
export const onWriteToken = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .firestore.document('tokens/{userId}')
  .onWrite(async (change, context) => {
    const now = new Date(context.timestamp);
    const writeType = getWriteType(change);
    const docId = change.after.id;

    if (writeType === 'unknown') {
      throw new Error('Unknown write type');
    }

    const { twitterAccessToken: accessToken, twitterAccessTokenSecret: accessTokenSecret } =
      writeType === 'delete'
        ? { twitterAccessToken: '', twitterAccessTokenSecret: '' }
        : (change.after.data() as Token);

    const exists = await checkExistsSharedToken(docId);

    switch (writeType) {
      case 'create': {
        await initializeSharedToken(docId, {
          accessToken,
          accessTokenSecret,
          _lastUpdated: now,
        });
        return;
      }
      case 'update': {
        if (exists) {
          await updateSharedToken(docId, {
            accessToken,
            accessTokenSecret,
            _lastUpdated: now,
          });
          return;
        }
        await initializeSharedToken(docId, {
          accessToken,
          accessTokenSecret,
          _lastUpdated: now,
        });
        return;
      }
      case 'delete': {
        if (exists) {
          await deleteSharedToken(docId);
        }
      }
    }
  });
