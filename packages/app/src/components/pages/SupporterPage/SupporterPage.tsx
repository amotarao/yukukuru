import { useStripe } from '@stripe/react-stripe-js';
import classNames from 'classnames';
import Link from 'next/link';
import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/auth';
import { useMultiAccounts } from '../../../hooks/multiAccounts';
import { usePlanPrice } from '../../../hooks/usePlanPrice';
import { useSubscription } from '../../../hooks/useSubscription';
import { addCheckoutSession } from '../../../modules/firestore/stripe';
import { getPortalLink } from '../../../modules/functions/stripe';
import { AccountSelector } from '../../organisms/AccountSelector';
import { BottomNav } from '../../organisms/BottomNav/BottomNav';
import { Icon } from '../../shared/Icon';

export const SupporterPage: React.FC = () => {
  const [{ isLoading: isLoadingAuth, signedIn, uid }] = useAuth();
  const { isLoading: isLoadingSubscription, isSupporter } = useSubscription();
  const [{ accounts }] = useMultiAccounts(uid);
  const currentAccount = useMemo(() => {
    return accounts.find((account) => account.id === uid) || null;
  }, [uid, accounts]);

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
          {isLoadingAuth || isLoadingSubscription || isSupporter === null ? null : !signedIn ? null : !isSupporter ? (
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
                <ul className="flex flex-col gap-4">
                  <li className="">
                    <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                      <span className="text-main">最短5分おき*に更新</span>
                      <Icon type="check_circle" />
                    </p>
                    <p className="pl-7 text-sm text-sub">* フォロワー1.5万人超ごとに +5分</p>
                    <p className="hidden pl-7 text-sm text-sub sm:block">&nbsp;</p>
                  </li>
                  <li className="">
                    <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                      <span className="text-main">複数アカウント切り替え</span>
                      <Icon type="check_circle" aria-label="可能" />
                    </p>
                    <p className="pl-7 text-sm text-sub">
                      *{' '}
                      <a
                        className="underline"
                        href={`https://www.twitter.com/messages/compose?recipient_id=1150435427108585473&text=${encodeURIComponent(
                          '◆ゆくくるサポーター 複数アカウント連携依頼\n\n◆注意事項\n・連携したいすべてのアカウントからDMを送信してください。\n・サポーターへの登録は1アカウントで構いません。\n・設定まで2〜3日お待ちいただく場合があります。\n\n◇サポーター登録したアカウント: \n◇連携したいアカウント(複数可): '
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        DMでアカウントをお知らせください
                      </a>
                    </p>
                  </li>
                </ul>
                <div className="mt-8">
                  {isLoadingAuth || isLoadingSubscription || isSupporter === null ? (
                    <p className="text-center text-lg sm:px-4 sm:py-2">読み込み中</p>
                  ) : !signedIn ? (
                    <Link className="block rounded-md border border-current px-4 py-2 text-center text-lg" href="/my">
                      ログイン
                    </Link>
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
              <dd className="px-4 py-8">
                <ul className="flex flex-col gap-4">
                  <li className="">
                    <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                      <span className="text-main">6〜72時間おき*に更新</span>
                      <Icon type="check_circle" />
                    </p>
                    <p className="pl-7 text-sm text-sub">* ランダムに実行</p>
                    <p className="pl-7 text-sm text-sub">* フォロワー1.5万人超ごとに +5分</p>
                  </li>
                  <li className="">
                    <p className="flex flex-row-reverse items-center justify-end gap-2 text-lg">
                      <span className="text-main">複数アカウント切り替え</span>
                      <Icon type="cross" aria-label="不可" />
                    </p>
                    <p className="hidden pl-7 text-sm text-sub sm:block">&nbsp;</p>
                  </li>
                </ul>
                <div className="mt-8">
                  {isLoadingAuth || isLoadingSubscription || isSupporter === null ? (
                    <p className="text-center text-lg sm:px-4 sm:py-2">読み込み中</p>
                  ) : !signedIn ? (
                    <Link className="block rounded-md border border-current px-4 py-2 text-center text-lg" href="/my">
                      ログイン
                    </Link>
                  ) : !isSupporter ? (
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
            <Link className="underline" href="/sct">
              特定商取引法に基づく表記
            </Link>
          </p>
        </section>
      </div>
      {signedIn && <BottomNav active="supporter" />}
    </div>
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
