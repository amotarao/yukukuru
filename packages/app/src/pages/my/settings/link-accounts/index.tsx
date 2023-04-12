import Head from 'next/head';
import { PageHeader } from '../../../../components/PageHeader';
import { LoadingCircle } from '../../../../components/atoms/LoadingCircle';
import { AccountSelector } from '../../../../components/organisms/AccountSelector';
import { BottomNav } from '../../../../components/organisms/BottomNav';
import { LoginPage } from '../../../../components/pages/LoginPage';
import { Icon } from '../../../../components/shared/Icon';
import { useAuth } from '../../../../hooks/auth';
import { useMultiAccounts } from '../../../../hooks/useMultiAccounts';
import { useSubscription } from '../../../../hooks/useSubscription';
import { pagesPath } from '../../../../lib/$path';

const Page: React.FC = () => {
  const [{ isLoading: isLoadingAuth, signedIn, signingIn, uid }, { signIn }] = useAuth();
  const { isLoading: isLoadingSubscription, isSupporter } = useSubscription();
  const [{ isLoading: isLoadingMultiAccounts, accounts, currentAccount }] = useMultiAccounts(uid);

  const isLoading = isLoadingAuth || isLoadingSubscription || isLoadingMultiAccounts;

  return (
    <>
      <Head>
        <title>アカウント連携 - ゆくくる beta</title>
      </Head>
      {isLoading || signingIn ? (
        <LoadingCircle />
      ) : !signedIn ? (
        <LoginPage signIn={signIn} />
      ) : (
        <>
          <div className="mx-auto max-w-md pb-40 sm:max-w-xl">
            <PageHeader backTo={pagesPath.my.settings.$url()}>アカウント連携</PageHeader>
            <div className="mt-2 mb-6 flex items-center justify-center gap-2">
              <AccountSelector inactive currentAccount={currentAccount} multiAccounts={[]} />
              <p className="text-sm">でログイン中</p>
            </div>
            <div className="grid gap-8">
              <section>
                <h2 className="mb-3 px-4 text-xs font-bold">連携済みアカウント</h2>
                <ul>
                  {accounts
                    .filter((account) => account.id !== uid)
                    .map((account) => (
                      <li key={account.id} className="border-t border-back-2">
                        <div className="px-4 py-2 tracking-wide">@{account.twitter.screenName}</div>
                      </li>
                    ))}
                </ul>
              </section>
              {/* ToDo: 保留リストを表示 */}
              <section>
                <h2 className="mb-3 px-4 text-xs font-bold">保留中</h2>
                <ul>
                  {accounts
                    .filter((account) => account.id !== uid)
                    .map((account) => (
                      <li key={account.id} className="border-t border-back-2">
                        <div className="px-4 py-2 tracking-wide">@{account.twitter.screenName}</div>
                      </li>
                    ))}
                </ul>
              </section>
              {/* ToDo: 保留に追加するロジック */}
              <section>
                <h2 className="mb-3 px-4 text-xs font-bold">新しいアカウントを連携</h2>
                <div className="grid h-10 grid-cols-[1fr_40px] px-4">
                  <div className="flex items-stretch">
                    <p className="grid place-items-center rounded-l bg-back-2 px-2">@</p>
                    <input
                      className="w-full border border-back-2 bg-back px-2 py-[7px]"
                      placeholder="Twitter ID"
                      required
                      pattern="^[a-zA-Z0-9_]+$"
                      maxLength={15}
                    />
                  </div>
                  <button type="submit" className="grid place-items-center rounded-r bg-primary">
                    <Icon className="h-6 w-6 text-back" type="add" />
                  </button>
                </div>
              </section>
              {/* ToDo: サポーターの場合、登録不可 */}
              <section>
                <h2 className="mb-3 px-4 text-xs font-bold">連携手順</h2>
                <ol className="mx-4 grid list-decimal gap-1 pl-4 text-sm">
                  <li>サポーター登録したアカウントで、連携するアカウントを登録</li>
                  <li>Twitterでアカウントを切り替え、ゆくくるにログイン</li>
                  <li>「設定 &gt; アカウント連携」から承認</li>
                </ol>
              </section>
            </div>
          </div>
          <BottomNav active="settings" />
        </>
      )}
    </>
  );
};

export default Page;
