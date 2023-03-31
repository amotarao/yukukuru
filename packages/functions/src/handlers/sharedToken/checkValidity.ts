import * as functions from 'firebase-functions';
import {
  getSharedTokenDocsOrderByLastChecked,
  setInvalidSharedToken,
  setLastCheckedSharedToken,
} from '../../modules/firestore/sharedToken';
import { publishMessages } from '../../modules/pubsub/publish';
import { getClient } from '../../modules/twitter/client';
import { checkInvalidOrExpiredToken } from '../../modules/twitter/error';
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
    const docs = await getSharedTokenDocsOrderByLastChecked();
    const items: Message[] = docs.map((doc) => ({
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

    const client = getClient({
      accessToken: accessToken,
      accessSecret: accessTokenSecret,
    });

    const me = await getMe(client);
    if ('error' in me) {
      if (checkInvalidOrExpiredToken(me.error)) {
        await setInvalidSharedToken(id);
        return;
      }
      throw new Error(`❗️[Error]: Failed to get user info: ${me.error.message}`);
    }

    await setLastCheckedSharedToken(id, now);
  });
