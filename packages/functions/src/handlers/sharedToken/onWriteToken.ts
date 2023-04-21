import { Token } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import {
  deleteSharedToken,
  deleteSharedTokens,
  getSharedTokensByAccessToken,
  initializeSharedToken,
  updateSharedToken,
} from '../../modules/firestore/sharedToken';
import { checkExistsSharedToken } from '../../modules/firestore/sharedToken/index';
import { deleteTokens, getTokensByAccessToken } from '../../modules/firestore/tokens';
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

    console.log(`ℹ️ Token [${docId}] is ${writeType}d.`);

    const data = (change.after.data() as Token | undefined) || { twitterAccessToken: '', twitterAccessTokenSecret: '' };
    const { twitterAccessToken: accessToken, twitterAccessTokenSecret: accessTokenSecret } = data;

    const exists = await checkExistsSharedToken(docId);

    switch (writeType) {
      case 'create':
      case 'update': {
        if (exists) {
          await updateSharedToken(docId, {
            accessToken,
            accessTokenSecret,
            _lastUpdated: now,
          });
        } else {
          await initializeSharedToken(docId, {
            accessToken,
            accessTokenSecret,
            _lastUpdated: now,
          });
        }

        // 同じアクセストークンを持つドキュメントを削除
        await Promise.all([
          getTokensByAccessToken(accessToken)
            .then((docs) => docs.filter((doc) => doc.id !== docId).map((doc) => doc.id))
            .then((ids) => {
              console.log(`Same token(s): ${ids.map((id) => `[${id}]`).join(', ')}.`);
              return ids;
            })
            .then((ids) => deleteTokens(ids)),
          getSharedTokensByAccessToken(accessToken)
            .then((docs) => docs.filter((doc) => doc.id !== docId).map((doc) => doc.id))
            .then((ids) => {
              console.log(`Same shared token(s): ${ids.map((id) => `[${id}]`).join(', ')}.`);
              return ids;
            })
            .then((ids) => deleteSharedTokens(ids)),
        ]);
        break;
      }
      case 'delete': {
        if (exists) {
          await deleteSharedToken(docId);
        }
        break;
      }
    }
  });
