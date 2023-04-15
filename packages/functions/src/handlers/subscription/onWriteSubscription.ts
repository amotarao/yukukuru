import { StripeRole } from '@yukukuru/types';
import * as functions from 'firebase-functions';
import { setRoleToUser } from '../../modules/firestore/users';
import { getWriteType } from '../../modules/functions/firestore';

/**
 * サブスクリプションが更新されたときの処理
 * role がサポーターになったら、User ドキュメントの role フィールドを更新する
 * どのような動作になるか分からないため、一旦 role がサポーターになったときのみ処理を行う
 */
export const onWriteSubscription = functions
  .region('asia-northeast1')
  .runWith({
    timeoutSeconds: 10,
    memory: '256MB',
  })
  .firestore.document('stripeCustomers/{stripeCustomerId}/subscriptions/{subscriptionId}')
  .onWrite(async (change, context) => {
    const writeType = getWriteType(change);
    const userId = context.params.stripeCustomerId;

    if (writeType === 'unknown') {
      throw new Error('Unknown write type');
    }
    if (writeType === 'delete') {
      return;
    }

    const { role, status } = change.after.data() as {
      role: StripeRole;
      status: 'active' | string;
    };
    if (role === 'supporter' && status === 'active') {
      await setRoleToUser(userId, role);
    }
  });
