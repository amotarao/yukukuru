import * as functions from 'firebase-functions';
import { EApiV1ErrorCode, EApiV2ErrorCode } from 'twitter-api-v2';
import {
  deleteSharedToken,
  getInvalidSharedTokenDocsOrderByLastChecked,
  getSharedTokensByAccessToken,
  getValidSharedTokenDocsOrderByLastChecked,
  setInvalidSharedToken,
  setInvalidV1SharedToken,
  setValidSharedToken,
} from '../../modules/firestore/sharedToken';
import { setValidV1SharedToken } from '../../modules/firestore/sharedToken/index';
import { publishMessages } from '../../modules/pubsub/publish';
import { getFollowersIdsLegacy } from '../../modules/twitter/api-legacy/followers-ids';
import { getMe } from '../../modules/twitter/api/me';
import { getClient } from '../../modules/twitter/client';

const topicName = 'checkValiditySharedToken';

type Message = {
  /** Document ID */
  id: string;

  /** アクセストークン */
  accessToken: string;

  /** アクセストークンシークレット */
  accessTokenSecret: string;
};

export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/10 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const validDocs = await getValidSharedTokenDocsOrderByLastChecked(100);
    const invalidDocs = await getInvalidSharedTokenDocsOrderByLastChecked(10);

    const messages: Message[] = [...validDocs, ...invalidDocs].map((doc) => ({
      id: doc.id,
      accessToken: doc.data.accessToken,
      accessTokenSecret: doc.data.accessTokenSecret,
    }));
    await publishMessages(topicName, messages);
    console.log(`✔️ Completed publish ${messages.length} message.`);
  });

export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 20,
    memory: '256MB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message, context) => {
    const { id, accessToken, accessTokenSecret } = message.json as Message;
    const now = new Date(context.timestamp);

    console.log(`⚙️ Starting check validity Twitter token of [${id}].`);

    const client = getClient({
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });

    const resV2 = await getMe(client);
    if ('error' in resV2) {
      console.log(resV2.error);

      // 認証エラー
      if (resV2.error.isAuthError) {
        await deleteSharedToken(id);
        return;
      }
      // サポート外のトークン
      // トークンが空欄の際に発生する
      if (resV2.error.hasErrorCode(EApiV2ErrorCode.UnsupportedAuthentication)) {
        await deleteSharedToken(id);
        return;
      }

      // 403
      // アカウントが削除済みの場合に発生する
      if (resV2.error.code === 403) {
        await setInvalidSharedToken(id, now);
        return;
      }

      throw new Error(`❗️[Error]: Failed to access Twitter API v2: ${resV2.error.message}`);
    }

    // 同じアクセストークンを持つドキュメントを削除
    const sameAccessTokens = (await getSharedTokensByAccessToken(accessToken)).filter((doc) => doc.id !== id);
    await Promise.all(sameAccessTokens.map((doc) => deleteSharedToken(doc.id)));

    await setValidSharedToken(id, now);

    const resV1 = await getFollowersIdsLegacy(client, { userId: '783214', count: 1 });
    if ('error' in resV1) {
      console.log(resV1.error);

      // 認証エラー
      if (resV1.error.isAuthError) {
        await setInvalidV1SharedToken(id, now);
        return;
      }
      // 無効、期限切れのトークン
      if (resV1.error.hasErrorCode(EApiV1ErrorCode.InvalidOrExpiredToken)) {
        await setInvalidV1SharedToken(id, now);
        return;
      }
      // アカウントの一時的なロック
      if (resV1.error.hasErrorCode(EApiV1ErrorCode.AccountLocked)) {
        await setInvalidV1SharedToken(id, now);
        return;
      }

      throw new Error(`❗️[Error]: Failed to access Twitter API v1.1: ${resV1.error.message}`);
    }

    await setValidV1SharedToken(id, now);
  });
