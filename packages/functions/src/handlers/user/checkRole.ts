import * as functions from 'firebase-functions';
import { getStripeRole } from '../../modules/auth/claim';
import {
  getUserDocsByGroups,
  getUsersInAllowedAccessUsers,
  removeIdFromAllowedAccessUsers,
  setRoleToUser,
} from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';
import { publishMessages } from '../../modules/pubsub/publish';

const topicName = 'checkRole';

type Message = {
  /** User ID */
  userId: string;
};

export const publish = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('10 0-14 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const groups = [getGroupFromTime(60, now)];

    const docs = await getUserDocsByGroups(groups);
    const messages: Message[] = docs.map((doc) => ({ userId: doc.id }));

    await publishMessages(topicName, messages);
    console.log(`✔️ Completed publish ${messages.length} message.`);
  });

export const run = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.topic(topicName)
  .onPublish(async (message) => {
    const { userId } = message.json as Message;

    const role = await getStripeRole(userId);
    await setRoleToUser(userId, role);

    if (role !== 'supporter') {
      const users = await getUsersInAllowedAccessUsers(userId);
      await Promise.all(
        users.map(async (user) => {
          await removeIdFromAllowedAccessUsers(user.id, userId);
        })
      );
    }
  });
