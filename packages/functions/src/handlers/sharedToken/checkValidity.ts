import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { EApiV2ErrorCode } from 'twitter-api-v2';
import {
  checkExistsSharedToken,
  deleteSharedToken,
  getSharedTokenDocsOrderByLastChecked,
  getSharedTokensByAccessToken,
  updateLastCheckedSharedToken,
} from '../../modules/firestore/sharedToken';
import { checkExistsToken, deleteToken } from '../../modules/firestore/tokens';
import { publishMessages } from '../../modules/pubsub';
import { getUser } from '../../modules/twitter/api/users';
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
  .pubsub.schedule('15 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const beforeDate = dayjs(now).subtract(3, 'days').toDate();

    // 3日前以前のトークンをチェック
    const docs = await getSharedTokenDocsOrderByLastChecked(beforeDate, 100);
    const messages: Message[] = docs.map((doc) => ({
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

    if (!accessToken || !accessTokenSecret) {
      console.log('❗️ Access Token is not set.');
      await deleteTokens(id);
      return;
    }

    const client = getClient({
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });

    const officialTwitterId = '783214';
    const response = await getUser(client, officialTwitterId);
    if ('error' in response) {
      // 認証エラー
      if (response.error.isAuthError) {
        console.log('❗️ Auth Error.');
        await deleteTokens(id);
        return;
      }

      // サポート外のトークン
      // トークンが空欄の際に発生する
      if (response.error.hasErrorCode(EApiV2ErrorCode.UnsupportedAuthentication)) {
        console.log('❗️ Unsupported Authentication.');
        await deleteTokens(id);
        return;
      }

      // 403
      // アカウントが削除済み、一時的なロックが発生している場合に発生する
      if (response.error.data.title === 'Forbidden') {
        console.log('❗️ Forbidden.');
        await deleteTokens(id);
        return;
      }

      throw new Error('❌ Failed to access Twitter API v2');
    }

    // 同じアクセストークンを持つドキュメントを削除
    const sameAccessTokens = (await getSharedTokensByAccessToken(accessToken)).filter((doc) => doc.id !== id);
    await Promise.all(sameAccessTokens.map((doc) => deleteSharedToken(doc.id)));

    const existsSharedToken = await checkExistsSharedToken(id);
    if (existsSharedToken) await updateLastCheckedSharedToken(id, now);
  });

const deleteTokens = async (id: string): Promise<void> => {
  await Promise.all([
    checkExistsSharedToken(id).then(async (exists) => {
      if (exists) await deleteSharedToken(id);
    }),
    checkExistsToken(id).then(async (exists) => {
      if (exists) await deleteToken(id);
    }),
  ]);
};
