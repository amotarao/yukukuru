import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { setUserResultLegacy } from '../../modules/firestore/users/state';
import { getGroupFromTime } from '../../modules/group';

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
