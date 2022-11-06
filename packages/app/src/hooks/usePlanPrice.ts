import { useEffect, useState } from 'react';
import { getActivePlanPrices, getActivePlans, getActiveTaxRates } from '../modules/firestore/stripe';

type PlanPrice = {
  id: string;
  role: string;
};

type TaxRates = {
  id: string;
};

export const usePlanPrice = () => {
  const [planPrices, setPlanPrices] = useState<PlanPrice[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRates[]>([]);

  // プランを取得
  useEffect(() => {
    getActivePlans().then((querySnapshot) => {
      querySnapshot.docs.forEach((doc) => {
        const role = doc.get('role');
        getActivePlanPrices(doc.ref).then((priceQuerySnapshot) => {
          priceQuerySnapshot.docs.forEach((doc) => {
            const planPrice: PlanPrice = { id: doc.id, role };
            setPlanPrices((planPrices) => {
              return [...planPrices, planPrice];
            });
          });
        });
      });
    });
  }, []);

  // 税率を取得
  useEffect(() => {
    getActiveTaxRates().then((querySnapshot) => {
      const taxRates: TaxRates[] = querySnapshot.docs.map((doc) => ({ id: doc.id }));
      setTaxRates(taxRates);
    });
  }, []);

  return {
    planPrices,
    taxRates,
  };
};
