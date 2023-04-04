import { RecordV2 } from '@yukukuru/types';
import * as dayjs from 'dayjs';
import { QuerySnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { firestore } from '../../modules/firebase';
import { getTwUsers } from '../../modules/firestore/twUsers';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { setUserResultLegacy } from '../../modules/firestore/users/state';
import { getGroupFromTime } from '../../modules/group';
import { convertTwUserDataToRecordV2User } from '../../modules/twitter-user-converter';

export const addLastUpdatedField = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('* * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const now = dayjs(context.timestamp);
    const groups = [getGroupFromTime(1, now.toDate())];
    const docs = await getUserDocsByGroups(groups);

    const result = await Promise.all(
      docs.map(async (doc) => {
        if ('_getFollowersV1Status' in doc.data()) {
          return false;
        }
        await setUserResultLegacy(doc.id, '', true, '', new Date(0));
        return true;
      })
    );
    console.log(`updated ${result.filter((r) => r).length} items.`);
  });

export const bindTwUserRecordV2 = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .pubsub.schedule('*/5 * * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async () => {
    const snapshot = (await firestore.collectionGroup('recordsV2').get()) as QuerySnapshot<RecordV2>;
    const targetDocs = snapshot.docs.filter((doc) => !doc.data().user);
    const twitterIds = targetDocs.map((doc) => doc.data().twitterId);
    const twUsers = await getTwUsers(twitterIds);
    const result = await Promise.all(
      targetDocs.map(async (doc) => {
        const twUser = twUsers.find((twUser) => twUser.id === doc.data().twitterId);
        if (!twUser) return false;
        await doc.ref.update({
          user: convertTwUserDataToRecordV2User(twUser),
        });
        return true;
      })
    );

    console.log(`updated ${result.filter((r) => r).length} items.`);
  });
