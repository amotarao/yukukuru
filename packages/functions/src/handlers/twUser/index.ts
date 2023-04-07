import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { deleteTwUsers, getOldTwUsers } from '../../modules/firestore/twUsers';

export const deleteOldTwUsers = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .pubsub.schedule('20 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);
    const twUsers = await getOldTwUsers(now.subtract(1, 'year').toDate(), 1000);
    await deleteTwUsers(twUsers.map((twUser) => twUser.id));
    console.log(`deleted ${twUsers.length} items.`);
  });
