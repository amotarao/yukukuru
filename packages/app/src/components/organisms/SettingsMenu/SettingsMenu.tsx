import Link from 'next/link';
import { useRouter } from 'next/router';
import Switch from 'react-switch';
import { ThemeContainer } from '../../../store/theme';
import { TweetButton } from '../TweetButton';

type SettingsMenuProps = {
  signIn: () => void;
  signOut: () => void | Promise<void>;
};

export const SettingsMenu: React.FC<SettingsMenuProps> = ({ signIn, signOut }) => {
  const router = useRouter();
  const { theme, setTheme } = ThemeContainer.useContainer();

  return (
    <>
      <ul>
        <li className="border-b border-b-back-2">
          <div className="flex items-center">
            <p className="block w-full grow px-4 py-3 text-left">ダークテーマ</p>
            <Switch
              className="mr-4"
              checked={theme === 'dark'}
              onChange={() => {
                setTheme(theme === 'dark' ? 'default' : 'dark');
              }}
              onColor="#65b2ff"
              onHandleColor="#2196f3"
              handleDiameter={24}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={16}
              width={40}
              aria-label="ダークテーマにする"
            />
          </div>
        </li>
        <li className="border-b border-b-back-2">
          <Link
            className="block w-full grow px-4 py-3 text-left"
            href="/"
            onClick={async (e) => {
              e.preventDefault();
              await signOut();
              router.push('/');
            }}
          >
            <p>ログアウト</p>
          </Link>
        </li>
        <li className="border-b border-b-back-2">
          <Link
            className="block w-full grow px-4 py-3 text-left"
            href="/my"
            onClick={async (e) => {
              e.preventDefault();
              await signIn();
              router.push('/my');
            }}
          >
            <p>
              別のアカウントでログイン
              <span className="mt-1 block text-xs">Twitterでアカウントを切り替えたあとに実行</span>
            </p>
          </Link>
        </li>
      </ul>
      <section className="mt-4 p-4">
        <p className="mb-4">
          <a
            className="text-primary no-underline"
            href="https://twitter.com/intent/follow?screen_name=yukukuruapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            公式Twitterをフォローする @yukukuruapp
          </a>
        </p>
        <p className="mb-4">
          <a
            className="text-primary no-underline"
            href="https://twitter.com/yukukuruapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            不具合はリプライかDMでお問い合わせください
          </a>
        </p>
        <p className="mb-4">
          <a
            className="text-primary no-underline"
            href="https://odaibako.net/u/yukukuruapp"
            target="_blank"
            rel="noopener noreferrer"
          >
            お題箱でもご意見受付中！
          </a>
          (お題箱への書き込みは公開されます)
        </p>
        <TweetButton size="large" />
      </section>
    </>
  );
};
