import { StripeRole } from '@yukukuru/types';
import { auth } from '../firebase';

export const getStripeRole = async (uid: string): Promise<StripeRole> => {
  const role = await auth
    .getUser(uid)
    .then((user) => (user.customClaims?.stripeRole ?? null) as StripeRole)
    .catch(() => null);
  return role;
};
