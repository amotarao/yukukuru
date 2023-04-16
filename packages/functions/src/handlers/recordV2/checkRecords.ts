import { RecordV2, RecordV2User } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { DocumentReference } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { getRecordsV2NullTwitterUser, setRecordsV2TwitterUser } from '../../modules/firestore/recordsV2';
import { getSharedTokensForGetUsers, updateLastUsedSharedToken } from '../../modules/firestore/sharedToken';
import { setTwUsers } from '../../modules/firestore/twUsers';
import { convertTwitterUserToRecordV2User } from '../../modules/twitter-user-converter';
import { getUsers } from '../../modules/twitter/api/users';
import { getClient } from '../../modules/twitter/client';

export const checkRecords = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
  })
  .pubsub.schedule('*/5 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = new Date(context.timestamp);
    const [token] = await getSharedTokensForGetUsers(dayjs(now).subtract(15, 'minutes').toDate(), 1);
    if (!token) {
      throw new Error('❌ Not found token.');
    }

    const docs = await getRecordsV2NullTwitterUser();
    const twitterIds = docs.map((doc) => doc.data().twitterId);

    const client = getClient({
      accessToken: token.data().accessToken,
      accessSecret: token.data().accessTokenSecret,
    });
    const response = await getUsers(client, twitterIds);
    if ('error' in response) {
      throw new Error('❌ Failed to get twitter users.');
    }

    type Item = {
      ref: DocumentReference<RecordV2>;
      data: RecordV2User;
    };
    const items: Item[] = docs
      .map((doc) => {
        const twitterUser = response.users.find((twitterUser) => twitterUser.id === doc.data().twitterId);
        if (!twitterUser) return null;
        return { ref: doc.ref, data: convertTwitterUserToRecordV2User(twitterUser) };
      })
      .filter((item): item is Item => item !== null);
    await setRecordsV2TwitterUser(items);
    await setTwUsers(response.users);
    await updateLastUsedSharedToken(token.id, ['v2_getUsers'], now);
    console.log(`updated ${items.length} items.`);
  });
