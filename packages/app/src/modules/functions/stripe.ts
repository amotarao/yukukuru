import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';

export const getPortalLink = async (): Promise<string> => {
  const functionRef = httpsCallable(functions, 'ext-firestore-stripe-subscriptions-createPortalLink');
  const { data } = await functionRef({ returnUrl: window.location.origin });
  return data.url;
};
