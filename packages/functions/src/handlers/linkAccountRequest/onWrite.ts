import { LinkAccountRequest } from '@yukukuru/types';
import { DocumentSnapshot } from 'firebase-admin/firestore';
import * as functions from 'firebase-functions';
import { addLinkedUserIds } from '../../modules/firestore/users/linkedUserIds';
import { getUserByTwitterScreenName } from '../../modules/firestore/users/twitter';
import { getWriteType } from '../../modules/functions/firestore';

export const onWriteRequest = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 15,
    memory: '256MB',
  })
  .firestore.document('linkAccountRequests/{requestId}')
  .onWrite(async (change) => {
    const writeType = getWriteType(change);

    if (writeType === 'unknown') {
      throw new Error('Unknown write type.');
    }
    if (writeType === 'delete') {
      return;
    }

    const after = change.after as DocumentSnapshot<LinkAccountRequest>;
    const data = after.data();
    if (!data) {
      throw new Error('Data is undefined.');
    }

    switch (data.step) {
      case 'create': {
        const user = await getUserByTwitterScreenName(data.to.screenName);

        if (!user) {
          await after.ref.update({
            step: 'error',
            error: `ユーザーが見つかりません。
ユーザー名が正しいか、ゆくくるに登録済みかどうかご確認ください。`,
          });
          return;
        }

        const [from] = data.canView;
        await after.ref.update({
          step: 'created',
          canView: [from, user.id],
          'to.uid': user.id,
          'to.twitter': user.data.twitter,
        });
        return;
      }

      case 'cancel': {
        const [from] = data.canView;
        await after.ref.update({
          step: 'canceled',
          canView: [from],
        });
        return;
      }

      case 'approve': {
        const [from, to] = data.canView;
        await Promise.all([addLinkedUserIds(from, to), addLinkedUserIds(to, from)]);
        await after.ref.update({
          step: 'approved',
        });
        return;
      }

      case 'reject': {
        const [from] = data.canView;
        await after.ref.update({
          step: 'rejected',
          canView: [from],
        });
        return;
      }
    }
  });
