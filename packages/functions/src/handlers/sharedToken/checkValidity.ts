import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { EApiV2ErrorCode } from 'twitter-api-v2';
import {
  deleteSharedToken,
  getSharedTokenDocsOrderByLastChecked,
  updateLastCheckedSharedToken,
  updateLastUsedSharedToken,
} from '../../modules/firestore/sharedToken';
import { deleteToken } from '../../modules/firestore/tokens';
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
        await deleteTokens(id);
        throw new Error('❗️ Auth Error.');
      }

      // サポート外のトークン
      // トークンが空欄の際に発生する
      if (response.error.hasErrorCode(EApiV2ErrorCode.UnsupportedAuthentication)) {
        await deleteTokens(id);
        throw new Error('❗️ Unsupported Authentication.');
      }

      // 403
      // アカウントが削除済み、一時的なロックが発生している場合に発生する
      if (response.error.data.title === 'Forbidden') {
        await deleteTokens(id);
        throw new Error('❗️ Forbidden.');
      }

      // 429
      if (response.error.data.title === 'Too Many Requests') {
        await updateLastUsedSharedToken(id, ['v2_getUser'], dayjs(now).add(6, 'hours').toDate());
        throw new Error('❗️ Too Many Requests.');
      }

      throw new Error('❌ Failed to access Twitter API v2');
    }

    await updateLastCheckedSharedToken(id, now);
    await updateLastUsedSharedToken(id, ['v2_getUser'], now);
  });

const deleteTokens = async (id: string): Promise<void> => {
  await Promise.all([deleteSharedToken(id), deleteToken(id)]);
};
