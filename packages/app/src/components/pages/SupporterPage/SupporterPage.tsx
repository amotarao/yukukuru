import { useStripe } from '@stripe/react-stripe-js';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/auth';
import { usePlanPrice } from '../../../hooks/usePlanPrice';
import { useSubscription } from '../../../hooks/useSubscription';
import { addCheckoutSession } from '../../../modules/firestore/stripe';
import { getPortalLink } from '../../../modules/functions/stripe';

export const SupporterPage: React.FC = () => {
  const [{ isLoading: isLoadingAuth, signedIn }] = useAuth();
  const { isLoading: isLoadingSubscription, isSupporter } = useSubscription();

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
        {isLoadingAuth || isLoadingSubscription ? (
          <p>読み込み中</p>
        ) : !signedIn ? (
          <p>ログイン</p>
        ) : !isSupporter ? (
          <CheckoutButton>登録</CheckoutButton>
        ) : (
          <ConfirmButton>登録情報確認・解約など</ConfirmButton>
        )}
      </div>
    </main>
  );
};

const CheckoutButton: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const [loading, setLoading] = useState(false);

  const stripe = useStripe();
  const [{ uid }] = useAuth();
  const { planPrices, taxRates } = usePlanPrice();
  const supporterPriceId = useMemo(
    () => planPrices.find((price) => price.role === 'supporter')?.id ?? null,
    [planPrices]
  );

  const checkoutSupporter = useCallback(async () => {
    if (loading) {
      return;
    }

    if (!stripe || !uid || !supporterPriceId) {
      return;
    }

    setLoading(true);
    const sessionId = await addCheckoutSession(
      uid,
      supporterPriceId,
      taxRates.map(({ id }) => id)
    ).catch(alert);
    if (sessionId) {
      stripe.redirectToCheckout({
        sessionId,
        successUrl: window.location.href,
        cancelUrl: window.location.href,
      });
    }
    setLoading(false);
  }, [loading, stripe, uid, supporterPriceId, taxRates]);

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
  const [loading, setLoading] = useState(false);

  const portal = useCallback(async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    const url = await getPortalLink(window.location.href);
    window.location.assign(url);
    setLoading(false);
  }, [loading]);

  return (
    <button
      className={classNames('flex rounded border px-4 py-1', className)}
      onClick={() => {
        portal();
      }}
    >
      {loading ? '読み込み中' : children}
    </button>
  );
};
