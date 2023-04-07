import { RecordV2, RecordV2User } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { DocumentReference } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { getRecordsV2NullTwitterUser, setRecordsV2TwitterUser } from '../../modules/firestore/recordsV2';
import { getSharedTokensForGetUsers } from '../../modules/firestore/sharedToken';
import { convertTwitterUserToRecordV2User } from '../../modules/twitter-user-converter';
import { getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';

export const checkRecords = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/5 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);
    const [token] = await getSharedTokensForGetUsers(now.subtract(15, 'minutes').toDate(), 1);
    if (!token) {
      throw new Error('❌ Not found token.');
    }

    const docs = await getRecordsV2NullTwitterUser();
    const twitterIds = docs.map((doc) => doc.data().twitterId);

    const client = getClient({
      accessToken: token.data().accessToken,
      accessSecret: token.data().accessTokenSecret,
    });
    const twitterUsers = await getUsers(client, twitterIds);
    if ('error' in twitterUsers) {
      throw new Error('❌ Failed to get twitter users.');
    }

    type Item = {
      ref: DocumentReference<RecordV2>;
      data: RecordV2User;
    };
    const items: Item[] = docs
      .map((doc) => {
        const twitterUser = twitterUsers.users.find((twitterUser) => twitterUser.id === doc.data().twitterId);
        if (!twitterUser) return null;
        return { ref: doc.ref, data: convertTwitterUserToRecordV2User(twitterUser) };
      })
      .filter((item): item is Item => item !== null);
    await setRecordsV2TwitterUser(items);
    console.log(`updated ${items.length} items.`);
  });
