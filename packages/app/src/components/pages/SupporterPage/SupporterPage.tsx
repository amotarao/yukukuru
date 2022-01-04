import { useStripe } from '@stripe/react-stripe-js';
import React, { useEffect, useState } from 'react';
import {
  addCheckoutSession,
  getActivePlanPrices,
  getActivePlans,
  getActiveTaxRates,
  getOwnActiveSubscriptions,
} from '../../../modules/firestore/stripe';
import { getPortalLink } from '../../../modules/functions/stripe';

export type SupporterPageProps = {
  uid: string | null;
};

export const SupporterPage: React.FC<SupporterPageProps> = ({ uid }) => {
  const stripe = useStripe();
  const [subscriptions, setSubscriptions] = useState<{ status: string; role: string }[]>([]);
  const [prices, setPrices] = useState<{ id: string; role: string }[]>([]);
  const [taxRates, setTaxRates] = useState<string[]>([]);

  const supporterPriceId = prices.find((price) => price.role === 'supporter')?.id ?? null;
  const isSupporter =
    (subscriptions.find((subscription) => subscription.role === 'supporter')?.status ?? '') === 'active';

  // 自身の subscription を取得
  useEffect(() => {
    if (!uid) return;
    getOwnActiveSubscriptions(uid).then((querySnapshot) => {
      setSubscriptions(querySnapshot.docs.map((doc) => doc.data() as { status: string; role: string }));
    });
  }, [uid]);

  // プランを取得
  useEffect(() => {
    getActivePlans().then((querySnapshot) => {
      querySnapshot.docs.forEach((doc) => {
        const role = doc.get('role');
        getActivePlanPrices(doc.ref).then((priceQuerySnapshot) => {
          priceQuerySnapshot.docs.forEach((doc) => {
            setPrices((prices) => {
              return [...prices, { id: doc.id, role }];
            });
          });
        });
      });
    });
  }, []);

  // 税率を取得
  useEffect(() => {
    getActiveTaxRates().then((querySnapshot) => {
      setTaxRates(querySnapshot.docs.map((doc) => doc.id));
    });
  }, []);

  const checkoutSupporter = async () => {
    if (!stripe || !uid || !supporterPriceId) {
      return;
    }
    const sessionId = await addCheckoutSession(uid, supporterPriceId, taxRates).catch(alert);
    if (sessionId) {
      stripe.redirectToCheckout({ sessionId });
    }
  };

  const portal = async () => {
    const url = await getPortalLink();
    window.location.assign(url);
  };

  return (
    <main>
      <header className="mb-8 px-4 bg-top-bg">
        <div className="max-w-xl mx-auto py-8">
          <h1 className="text-4xl mt-4 mb-8 tracking-tight">ゆくくるサポーター</h1>
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-6">
              ゆくくるの開発・運営を支援できる「ゆくくるサポーター」制度をご用意しました
            </p>
            <p className="text-sm leading-6">月額○円で登録でき、お礼にいくつかの機能をご提供します</p>
          </div>
        </div>
      </header>
      <section>
        <dl>
          <div className="flex">
            <dt>取得頻度</dt>
            <dd>15分おき</dd>
          </div>
          <div className="flex">
            <dt>アカウント切り替え</dt>
            <dd>○</dd>
          </div>
        </dl>
      </section>
      <div>
        {isSupporter ? <p>登録済み</p> : <p>未登録</p>}
        <button
          className="flex px-4 py-1 rounded border"
          onClick={() => {
            checkoutSupporter();
          }}
        >
          登録
        </button>
        <button
          className="flex px-4 py-1 rounded border"
          onClick={() => {
            portal();
          }}
        >
          登録情報確認・解約など
        </button>
      </div>
    </main>
  );
};
