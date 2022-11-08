import { useStripe } from '@stripe/react-stripe-js';
import classNames from 'classnames';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/auth';
import { usePlanPrice } from '../../../hooks/usePlanPrice';
import { useSubscription } from '../../../hooks/useSubscription';
import { addCheckoutSession } from '../../../modules/firestore/stripe';
import { getPortalLink } from '../../../modules/functions/stripe';
import { Icon } from '../../shared/Icon';

export const SupporterPage: React.FC = () => {
  const [{ isLoading: isLoadingAuth, signedIn }] = useAuth();
  const { isLoading: isLoadingSubscription, isSupporter } = useSubscription();

  return (
    <main>
      <header className="mb-12 bg-top-bg px-8">
        <div className="mx-auto max-w-xl py-8 text-center">
          <h1 className="mt-4 mb-8 text-4xl font-bold tracking-tight">ゆくくるサポーター</h1>
          <div className="flex flex-col gap-2">
            <p className="text-sm leading-6">
              ゆくくるの開発・運営を支援できる
              <br className="sm:hidden" />
              「ゆくくるサポーター」制度をご用意しました
            </p>
            <p className="text-sm leading-6">
              月額99円で登録でき、
              <br className="sm:hidden" />
              お礼にいくつかの機能をご提供します
            </p>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-[480px] px-8 pb-16 sm:max-w-[800px]">
        <dl className="grid grid-cols-[1fr] gap-8 sm:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border-2 border-current px-4 text-primary">
            <dt className="flex flex-col gap-1 border-b border-current pt-6 pb-4 text-center">
              <p className="text-2xl font-bold tracking-wide text-main">サポーター</p>
              <p className="font-bold tracking-wide text-main">月額 99円</p>
            </dt>
            <dd className="px-4 pt-8 pb-12">
              <ul className="flex flex-col gap-4">
                <li className="">
                  <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                    <span className="text-main">最短15分おき*に更新</span>
                    <Icon type="check_circle" />
                  </p>
                  <p className="pl-6 text-sm text-sub">* フォロワー3万人ごとに +15分</p>
                </li>
                <li className="">
                  <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                    <span className="text-main">複数アカウント切り替え</span>
                    <Icon type="check_circle" aria-label="可能" />
                  </p>
                </li>
              </ul>
              <div className="mt-8">
                {isLoadingAuth || isLoadingSubscription ? (
                  <p className="px-4 py-2 text-center text-lg">読み込み中</p>
                ) : !signedIn ? (
                  <p className="px-4 py-2 text-center text-lg">ログイン</p>
                ) : !isSupporter ? (
                  <CheckoutButton>登録</CheckoutButton>
                ) : (
                  <ConfirmButton>登録情報確認・解約など</ConfirmButton>
                )}
              </div>
            </dd>
          </div>
          <div className="rounded-lg border border-current px-4 text-sub">
            <dt className="flex flex-col gap-1 border-b border-current pt-6 pb-4 text-center">
              <p className="text-2xl font-bold tracking-wide text-main">フリー</p>
              <p className="font-bold tracking-wide text-main">月額 0円</p>
            </dt>
            <dd className="px-4 pt-8 pb-12">
              <ul className="flex flex-col gap-4">
                <li className="">
                  <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                    <span className="text-main">最短6時間おき*に更新</span>
                    <Icon type="check_circle" />
                  </p>
                  <p className="pl-6 text-sm text-sub">* フォロワー3万人ごとに +15分</p>
                </li>
                <li className="">
                  <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                    <span className="text-main">複数アカウント切り替え</span>
                    <Icon type="cross" aria-label="不可" />
                  </p>
                </li>
              </ul>
              <div className="mt-8">
                {isLoadingAuth || isLoadingSubscription ? (
                  <p className="px-4 py-2 text-center text-lg">読み込み中</p>
                ) : !signedIn ? (
                  <p className="px-4 py-2 text-center text-lg">ログイン</p>
                ) : !isSupporter ? (
                  <p className="px-4 py-2 text-center text-lg">フリープランを利用中</p>
                ) : (
                  <p className="px-4 py-2 text-center text-lg">サポータープランに登録中</p>
                )}
              </div>
            </dd>
          </div>
        </dl>
      </section>
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
      className={classNames('block w-full rounded-md border border-current px-4 py-2 text-center text-lg', className)}
      onClick={() => {
        checkoutSupporter();
      }}
    >
      {loading ? '読み込み中' : children}
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
      className={classNames('block w-full rounded-md border border-current px-4 py-2 text-center text-lg', className)}
      onClick={() => {
        portal();
      }}
    >
      {loading ? '読み込み中' : children}
    </button>
  );
};
