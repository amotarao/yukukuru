import * as functions from 'firebase-functions';
import { EApiV1ErrorCode, EApiV2ErrorCode } from 'twitter-api-v2';
import {
  deleteSharedToken,
  getInvalidSharedTokenDocsOrderByLastChecked,
  getSharedTokensByAccessToken,
  getValidSharedTokenDocsOrderByLastChecked,
  setInvalidSharedToken,
  setValidSharedToken,
} from '../../modules/firestore/sharedToken';
import { publishMessages } from '../../modules/pubsub/publish';
import { getClient } from '../../modules/twitter/client';
import { getMe } from '../../modules/twitter/users/me';

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

    const items: Message[] = [...validDocs, ...invalidDocs].map((doc) => ({
      id: doc.id,
      accessToken: doc.data.accessToken,
      accessTokenSecret: doc.data.accessTokenSecret,
    }));
    await publishMessages(topicName, items);
    console.log(`✔️ Completed publish ${items.length} message.`);
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

    const me = await getMe(client);
    if ('error' in me) {
      console.log(me.error);

      // 認証エラー
      if (me.error.isAuthError) {
        await deleteSharedToken(id);
        return;
      }
      // サポート外のトークン
      // トークンが空欄の際に発生する
      if (me.error.data.type === EApiV2ErrorCode.UnsupportedAuthentication) {
        await deleteSharedToken(id);
        return;
      }
      // 無効、期限切れのトークン
      if (me.error.hasErrorCode(EApiV1ErrorCode.InvalidOrExpiredToken)) {
        await deleteSharedToken(id);
        return;
      }

      // 403
      // アカウントが削除済みの場合に発生する
      if (me.error.code === 403) {
        await setInvalidSharedToken(id, now);
        return;
      }
      // アカウントの一時的なロック
      if (me.error.hasErrorCode(EApiV1ErrorCode.AccountLocked)) {
        await setInvalidSharedToken(id, now);
        return;
      }

      throw new Error(`❗️[Error]: Failed to get user info: ${me.error.message}`);
    }

    // 同じアクセストークンを持つドキュメントを削除
    const sameAccessTokens = (await getSharedTokensByAccessToken(accessToken)).filter((doc) => doc.id !== id);
    await Promise.all(sameAccessTokens.map((doc) => deleteSharedToken(doc.id)));

    await setValidSharedToken(id, now);
  });
