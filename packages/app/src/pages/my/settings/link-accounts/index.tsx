import { UserTwitter } from '@yukukuru/types';
import Head from 'next/head';
import { useState } from 'react';
import { PageHeader } from '../../../../components/PageHeader';
import { LoadingCircle } from '../../../../components/atoms/LoadingCircle';
import { AccountSelector } from '../../../../components/organisms/AccountSelector';
import { BottomNav } from '../../../../components/organisms/BottomNav';
import { LoginPage } from '../../../../components/pages/LoginPage';
import { Icon } from '../../../../components/shared/Icon';
import { useAuth } from '../../../../hooks/auth';
import { useMultiAccounts } from '../../../../hooks/useMultiAccounts';
import { pagesPath } from '../../../../lib/$path';

const Page: React.FC = () => {
  const [{ isLoading, signedIn, signingIn }, { signIn }] = useAuth();

  return (
    <>
      <Head>
        <title>アカウント連携 - ゆくくる beta</title>
      </Head>
      {isLoading || signingIn ? <LoadingCircle /> : !signedIn ? <LoginPage signIn={signIn} /> : <Main />}
    </>
  );
};

export default Page;

const Main: React.FC = () => {
  const [{ isLoading: isLoadingAuth, uid }] = useAuth();
  const {
    isLoading: isLoadingMultiAccounts,
    accounts,
    currentAccount,
    linkAccountRequests,
    addLinkAccountRequest,
  } = useMultiAccounts(uid, null);

  if (isLoadingAuth || isLoadingMultiAccounts) {
    return <LoadingCircle />;
  }

  return (
    <>
      <div className="mx-auto max-w-md pb-40 sm:max-w-xl">
        <PageHeader backTo={pagesPath.my.settings.$url()}>アカウント連携</PageHeader>
        <div className="mt-2 mb-6 flex items-center justify-center gap-2">
          <AccountSelector inactive currentAccount={currentAccount} multiAccounts={[]} />
          <p className="text-sm">でログイン中</p>
        </div>
        <div className="grid gap-8">
          {linkAccountRequests.length > 0 && (
            <Section head="リクエスト">
              <ul>
                {linkAccountRequests.map((request) => (
                  <li key={request.id} className="border-t border-back-2">
                    <div className="px-4 py-2 tracking-wide">@{request.data.from.screenName}</div>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          <Section head="連携済みアカウント">
            <ul>
              {accounts
                .filter((account) => account.id !== uid)
                .map((account) => (
                  <li key={account.id} className="border-t border-back-2">
                    <div className="px-4 py-2 tracking-wide">@{account.twitter.screenName}</div>
                  </li>
                ))}
            </ul>
          </Section>
          <AddRequestSection
            accounts={accounts}
            currentAccount={currentAccount}
            addLinkAccountRequest={addLinkAccountRequest}
          />
          {/* ToDo: サポーターの場合、登録不可 */}
          <Section head="連携手順">
            <ol className="mx-4 grid list-decimal gap-1 pl-4 text-sm">
              <li>サポーター登録したアカウントで、連携するアカウントを登録</li>
              <li>Twitterでアカウントを切り替え、ゆくくるにログイン</li>
              <li>「設定 &gt; アカウント連携」から承認</li>
            </ol>
          </Section>
        </div>
      </div>
      <BottomNav active="settings" />
    </>
  );
};

const AddRequestSection: React.FC<{
  accounts: {
    id: string;
    twitter: UserTwitter;
  }[];
  currentAccount: {
    id: string;
    twitter: UserTwitter;
  } | null;
  addLinkAccountRequest: (screenName: string) => void;
}> = ({ accounts, currentAccount, addLinkAccountRequest }) => {
  const [screenName, setScreenName] = useState('');

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    if (currentAccount?.twitter.screenName === screenName) {
      alert('ログイン中以外のユーザー名を入力してください');
      setScreenName('');
      return;
    }
    if (accounts.some((account) => account.twitter.screenName === screenName)) {
      alert('既に連携済みです');
      setScreenName('');
      return;
    }

    addLinkAccountRequest(screenName);
    setScreenName('');
  };

  return (
    <Section head="新しいアカウントを連携">
      <form className="grid h-10 grid-cols-[1fr_40px] px-4" onSubmit={handleSubmit}>
        <div className="flex items-stretch">
          <p className="grid place-items-center rounded-l bg-back-2 px-2">@</p>
          <input
            className="w-full border border-back-2 bg-back px-2 py-[7px]"
            placeholder="ユーザー名"
            value={screenName}
            required
            pattern="^[a-zA-Z0-9_]+$"
            maxLength={15}
            onChange={(e) => {
              setScreenName(e.target.value.trim());
            }}
          />
        </div>
        <button type="submit" className="grid place-items-center rounded-r bg-primary">
          <Icon className="h-6 w-6 text-back" type="add" />
        </button>
      </form>
    </Section>
  );
};

const Section: React.FC<{ head: string; children: React.ReactNode }> = ({ head, children }) => {
  return (
    <section>
      <h2 className="mb-3 px-4 text-xs font-bold">{head}</h2>
      {children}
    </section>
  );
};
