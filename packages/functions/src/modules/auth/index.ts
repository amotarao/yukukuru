import { StripeRole } from '@yukukuru/types';
import { auth } from '../firebase';

export const getStripeRole = async (uid: string): Promise<StripeRole> => {
  const role = await auth
    .getUser(uid)
    .then((user) => (user.customClaims?.stripeRole ?? null) as StripeRole)
    .catch(() => null);
  return role;
};

export const deleteAuth = async (uid: string): Promise<void> => {
  await auth.deleteUser(uid);
};

export const getCreatedDate = async (uid: string): Promise<Date> => {
  const user = await auth.getUser(uid);
  const date = new Date(user.metadata.creationTime);
  return date;
};
