import { useStripe } from '@stripe/react-stripe-js';
import classNames from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { usePlanPrice } from '../../../hooks/usePlanPrice';
import { useSubscription } from '../../../hooks/useSubscription';
import { addCheckoutSession } from '../../../modules/firestore/stripe';
import { getPortalLink } from '../../../modules/functions/stripe';

export type SupporterPageProps = {
  uid: string | null;
};

export const SupporterPage: React.FC<SupporterPageProps> = ({ uid }) => {
  const { isSupporter } = useSubscription(uid);
  const { planPrices, taxRates } = usePlanPrice();
  const supporterPriceId = useMemo(
    () => planPrices.find((price) => price.role === 'supporter')?.id ?? null,
    [planPrices]
  );

  return (
    <main>
      <header className="mb-8 bg-top-bg px-4">
        <div className="mx-auto max-w-xl py-8">
          <h1 className="mt-4 mb-8 text-4xl tracking-tight">ゆくくるサポーター</h1>
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
            <dd>可能</dd>
          </div>
        </dl>
        <dl>
          <div className="flex">
            <dt>取得頻度</dt>
            <dd>6時間おき</dd>
          </div>
          <div className="flex">
            <dt>アカウント切り替え</dt>
            <dd>不可能</dd>
          </div>
        </dl>
      </section>
      <div>
        {isSupporter ? <p>登録済み</p> : <p>未登録</p>}
        <CheckoutButton uid={uid} priceId={supporterPriceId} taxRates={taxRates.map(({ id }) => id)}>
          登録
        </CheckoutButton>
        <ConfirmButton>登録情報確認・解約など</ConfirmButton>
      </div>
    </main>
  );
};

const CheckoutButton: React.FC<{
  className?: string;
  children: React.ReactNode;
  uid: string | null;
  priceId: string | null;
  taxRates: string[];
}> = ({ className, children, uid, priceId, taxRates }) => {
  const stripe = useStripe();

  const checkoutSupporter = useCallback(async () => {
    if (!stripe || !uid || !priceId) {
      return;
    }
    const sessionId = await addCheckoutSession(uid, priceId, taxRates).catch(alert);
    if (sessionId) {
      stripe.redirectToCheckout({ sessionId });
    }
  }, [stripe, uid, priceId, taxRates]);

  return (
    <button
      className={classNames('flex rounded border px-4 py-1', className)}
      onClick={() => {
        checkoutSupporter();
      }}
    >
      {children}
    </button>
  );
};

const ConfirmButton: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const portal = useCallback(async () => {
    const url = await getPortalLink();
    window.location.assign(url);
  }, []);

  return (
    <button
      className={classNames('flex rounded border px-4 py-1', className)}
      onClick={() => {
        portal();
      }}
    >
      {children}
    </button>
  );
};
