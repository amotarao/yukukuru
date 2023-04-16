import * as functions from 'firebase-functions';
import { getStripeRole } from '../../modules/auth';
import { setDeletedUser } from '../../modules/firestore/deletedUsers';
import { deleteUser, getUser } from '../../modules/firestore/users';
import { existsUser } from '../../modules/firestore/users/exists';

/** ユーザーが削除されたときの処理 */
export const onDelete = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 15,
    memory: '128MB',
  })
  .auth.user()
  .onDelete(async ({ uid }, context) => {
    const exists = await existsUser(uid);
    if (!exists) {
      throw new Error('❌ Not found user document.');
    }

    const user = await getUser(uid);
    const role = await getStripeRole(uid);

    await setDeletedUser(uid, {
      role,
      twitter: user.twitter,
      _deleted: new Date(context.timestamp),
    });
    await deleteUser(uid);
  });
