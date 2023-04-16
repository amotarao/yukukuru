'use client';

import { useStripe } from '@stripe/react-stripe-js';
import classNames from 'classnames';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { AccountSelector } from '../../components/organisms/AccountSelector';
import { Icon } from '../../components/shared/Icon';
import { useMultiAccounts } from '../../hooks/useMultiAccounts';
import { usePlanPrice } from '../../hooks/usePlanPrice';
import { useSubscription } from '../../hooks/useSubscription';
import { pagesPath } from '../../lib/$path';
import { useAuth } from '../../lib/auth/hooks';
import { addCheckoutSession } from '../../modules/firestore/stripe';
import { getPortalLink } from '../../modules/functions/stripe';

export const SupporterPage: React.FC = () => {
  const { isLoading: isLoadingAuth, signedIn, uid } = useAuth();
  const { isLoading: isLoadingSubscription, stripeRole } = useSubscription();
  const { currentAccount } = useMultiAccounts(uid, null);

  return (
    <div>
      <header className="mb-8 bg-top-bg px-4">
        <div className="mx-auto max-w-xl py-8 text-center">
          <h1 className="mb-4 text-xl font-bold tracking-tight sm:text-3xl">ゆくくるサポーター</h1>
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
      <div className="mx-auto max-w-[480px] px-8 pb-40 sm:max-w-[800px]">
        <section className="flex items-center justify-center gap-4">
          {!currentAccount ? (
            <div className="h-[32px] sm:h-[40px]"></div>
          ) : (
            <AccountSelector inactive currentAccount={currentAccount} multiAccounts={[]} />
          )}
          {isLoadingAuth || isLoadingSubscription || !signedIn ? null : !stripeRole ? (
            <p>フリー利用</p>
          ) : (
            <p className="flex items-center gap-2 text-primary">
              <Icon type="membership" />
              サポーター
            </p>
          )}
        </section>
        <section className="mt-8">
          <dl className="grid grid-cols-[1fr] gap-8 sm:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border-2 border-current px-4 text-primary">
              <dt className="flex flex-col gap-1 border-b border-current pt-6 pb-4 text-center">
                <p className="text-2xl font-bold tracking-wide text-main">サポーター</p>
                <p className="font-bold tracking-wide text-main">月額 99円</p>
              </dt>
              <dd className="px-4 py-8">
                <ul className="grid gap-8">
                  <li className="">
                    <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                      <span className="text-main">最短3分おきに更新</span>
                      <Icon type="check_circle" />
                    </p>
                    <ul className="mt-2 grid gap-1 pl-7 text-xs text-sub">
                      <li>フォロワー1万人ごとに +3分</li>
                      <li>非公開アカウントでは15分おき</li>
                      <li>※Twitterの仕様変更のため調整中</li>
                    </ul>
                  </li>
                  <li className="">
                    <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                      <span className="text-main">複数アカウント切り替え</span>
                      <Icon type="check_circle" aria-label="可能" />
                    </p>
                    <ul className="mt-2 grid gap-1 pl-7 text-xs text-sub">
                      <li>
                        <Link className="underline" href={pagesPath.my.settings.link_accounts.$url()}>
                          「設定 &gt; アカウント連携」から設定
                        </Link>
                      </li>
                    </ul>
                  </li>
                </ul>
                <div className="mt-8">
                  {isLoadingAuth || isLoadingSubscription ? (
                    <p className="text-center text-lg sm:px-4 sm:py-2">読み込み中</p>
                  ) : !signedIn ? (
                    <Link
                      className="block rounded-md border border-current px-4 py-2 text-center text-lg"
                      href={pagesPath.my.$url()}
                    >
                      ログイン
                    </Link>
                  ) : !stripeRole ? (
                    <CheckoutButton>登録</CheckoutButton>
                  ) : (
                    <ConfirmButton>登録内容 確認・変更・解約</ConfirmButton>
                  )}
                </div>
              </dd>
            </div>
            <div className="rounded-lg border border-current px-4 text-sub">
              <dt className="flex flex-col gap-1 border-b border-current pt-6 pb-4 text-center">
                <p className="text-2xl font-bold tracking-wide text-main">フリー</p>
                <p className="font-bold tracking-wide text-main">月額 0円</p>
              </dt>
              <dd className="px-4 py-8">
                <ul className="grid gap-8">
                  <li className="">
                    <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                      <span className="text-main">6〜72時間おきに更新</span>
                      <Icon type="check_circle" />
                    </p>
                    <ul className="mt-2 grid gap-1 pl-7 text-xs text-sub">
                      <li>フォロワー1万人ごとに +3分</li>
                      <li>非公開アカウントでは15分おき</li>
                      <li>※Twitterの仕様変更のため調整中</li>
                    </ul>
                  </li>
                  <li className="">
                    <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                      <span className="text-main">複数アカウント切り替え</span>
                      <Icon type="cross" aria-label="不可" />
                    </p>
                    <ul className="mt-2 grid gap-1 pl-7 text-xs text-sub">
                      <li className="hidden sm:block">&nbsp;</li>
                    </ul>
                  </li>
                </ul>
                <div className="mt-8">
                  {isLoadingAuth || isLoadingSubscription ? (
                    <p className="text-center text-lg sm:px-4 sm:py-2">読み込み中</p>
                  ) : !signedIn ? (
                    <Link
                      className="block rounded-md border border-current px-4 py-2 text-center text-lg"
                      href={pagesPath.my.$url()}
                    >
                      ログイン
                    </Link>
                  ) : !stripeRole ? (
                    <p className="text-center text-lg sm:px-4 sm:py-2">フリー利用中</p>
                  ) : (
                    <p className="text-center text-lg sm:px-4 sm:py-2">サポーター登録済み</p>
                  )}
                </div>
              </dd>
            </div>
          </dl>
        </section>
        <section className="mt-8 flex flex-col gap-8 text-center text-sm leading-6">
          <p>
            保守コスト削減とサービス維持のため、
            <br className="sm:hidden" />
            フリー利用での更新頻度を落としました
            <br />
            ご理解のほどよろしくお願いいたします
          </p>
          <p>
            <Link className="underline" href={pagesPath.sct.$url()}>
              特定商取引法に基づく表記
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

const CheckoutButton: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  const [loading, setLoading] = useState(false);

  const stripe = useStripe();
  const { uid } = useAuth();
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
      taxRates.map(({ id }) => id),
      window.location.href,
      window.location.href
    ).catch(alert);
    if (sessionId) {
      await stripe.redirectToCheckout({
        sessionId,
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

  const portal = useCallback(() => {
    if (loading) {
      return;
    }

    setLoading(true);
    getPortalLink(window.location.href)
      .then((url) => {
        window.location.assign(url);
      })
      .catch(() => {
        setLoading(false);
      });
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
