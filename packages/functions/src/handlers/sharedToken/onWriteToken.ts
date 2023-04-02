import { TokenData } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { initializeSharedToken, updateSharedToken } from '../../modules/firestore/sharedToken';
import { existsSharedToken } from '../../modules/firestore/sharedToken/index';
import { getWriteType } from '../../modules/firestore/utils';

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
        : (change.after.data() as TokenData);
    const _invalid = !accessToken || !accessTokenSecret;

    const exists = await existsSharedToken(docId);
    const setter =
      exists && (writeType === 'update' || writeType === 'delete') ? updateSharedToken : initializeSharedToken;

    await setter(docId, {
      accessToken,
      accessTokenSecret,
      _invalid,
      _lastUpdated: now,
    });
  });
