import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
  DocumentReference,
  QuerySnapshot,
} from 'firebase/firestore';
import { firestore } from '../firebase';

const customersCollection = collection(firestore, 'stripeCustomers');
const plansCollection = collection(firestore, 'stripePlans');

export const getOwnActiveSubscriptions = (uid: string): Promise<QuerySnapshot> => {
  const c = collection(customersCollection, uid, 'subscriptions');
  const q = query(c, where('status', 'in', ['trialing', 'active']));
  return getDocs(q);
};

export const addCheckoutSession = async (uid: string, price: string, taxRates: string[]): Promise<string> => {
  const c = collection(customersCollection, uid, 'checkout_sessions');
  const ref = await addDoc(c, {
    price: price,
    tax_rates: taxRates,
    success_url: window.location.origin,
    cancel_url: window.location.origin,
    billing_address_collection: 'auto',
  });

  return new Promise((resolve, reject) => {
    const unsubscribe = onSnapshot(ref, (snap) => {
      const { error, sessionId } = snap.data();

      if (error) {
        unsubscribe();
        return reject(new Error(`An error occured: ${error.message}`));
      }

      if (sessionId) {
        unsubscribe();
        return resolve(sessionId);
      }
    });
  });
};

export const getActivePlans = (): Promise<QuerySnapshot> => {
  const q = query(plansCollection, where('active', '==', true));
  return getDocs(q);
};

export const getActivePlanPrices = (ref: DocumentReference): Promise<QuerySnapshot> => {
  const q = query(collection(ref, 'prices'), where('active', '==', true));
  return getDocs(q);
};

export const getActiveTaxRates = (): Promise<QuerySnapshot> => {
  const q = query(collection(plansCollection, 'tax_rates', 'tax_rates'), where('active', '==', true));
  return getDocs(q);
};
