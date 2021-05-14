import { auth } from '../firebase';

export type StripeRole = 'supporter' | null;

export const getStripeRole = async (uid: string): Promise<StripeRole> => {
  const user = await auth.getUser(uid);
  return ((user.customClaims?.stripeRole || null) ?? null) as StripeRole;
};
