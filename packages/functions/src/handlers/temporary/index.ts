import * as dayjs from 'dayjs';
import * as functions from 'firebase-functions';
import { getUserDocsByGroups } from '../../modules/firestore/users';
import { getGroupFromTime } from '../../modules/group';

export const initializeGetFollowersV2Status = functions
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
        const exists = '_getFollowersV2Status' in doc.data();
        if (exists) {
          return false;
        }
        await doc.ref.update({
          '_getFollowersV2Status.lastRun': new Date(0),
          '_getFollowersV2Status.nextToken': null,
        });
        return true;
      })
    );
    console.log(`updated ${result.filter((s) => s).length} items.`);
  });
