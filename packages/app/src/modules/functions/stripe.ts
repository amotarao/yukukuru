import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export const getPortalLink = async (returnUrl?: string): Promise<string> => {
  const functionRef = httpsCallable(functions, 'ext-firestore-stripe-subscriptions-createPortalLink');
  const { data } = (await functionRef({ returnUrl: returnUrl || window.location.origin })) as { data: { url: string } };
  return data.url;
};
