import * as functions from 'firebase-functions';
import { EApiV2ErrorCode } from 'twitter-api-v2';
import {
  deleteSharedToken,
  getInvalidSharedTokenDocsOrderByLastChecked,
  getSharedTokensByAccessToken,
  getValidSharedTokenDocsOrderByLastChecked,
  setInvalidSharedToken,
  setValidSharedToken,
} from '../../modules/firestore/sharedToken';
import { publishMessages } from '../../modules/pubsub';
import { getUsers } from '../../modules/twitter/api/users';
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

export const publishCheckValiditySharedToken = async (...messages: Message[]): Promise<void> => {
  await publishMessages(topicName, messages);
};

export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/5 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const validDocs = await getValidSharedTokenDocsOrderByLastChecked(100);
    const invalidDocs = await getInvalidSharedTokenDocsOrderByLastChecked(10);

    const messages: Message[] = [...validDocs, ...invalidDocs].map((doc) => ({
      id: doc.id,
      accessToken: doc.data().accessToken,
      accessTokenSecret: doc.data().accessTokenSecret,
    }));
    await publishCheckValiditySharedToken(...messages);
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

    const response = await getUsers(client, ['783214']);
    if ('error' in response) {
      // 認証エラー
      if (response.error.isAuthError) {
        await deleteSharedToken(id);
        return;
      }
      // サポート外のトークン
      // トークンが空欄の際に発生する
      if (response.error.hasErrorCode(EApiV2ErrorCode.UnsupportedAuthentication)) {
        await deleteSharedToken(id);
        return;
      }

      // 403
      // アカウントが削除済み、一時的なロックが発生している場合に発生する
      if (response.error.data.title === 'Forbidden') {
        await setInvalidSharedToken(id, now);
        return;
      }

      throw new Error(`❗️[Error]: Failed to access Twitter API v2: ${response.error.message}`);
    }

    // 同じアクセストークンを持つドキュメントを削除
    const sameAccessTokens = (await getSharedTokensByAccessToken(accessToken)).filter((doc) => doc.id !== id);
    await Promise.all(sameAccessTokens.map((doc) => deleteSharedToken(doc.id)));

    await setValidSharedToken(id, now);
  });
