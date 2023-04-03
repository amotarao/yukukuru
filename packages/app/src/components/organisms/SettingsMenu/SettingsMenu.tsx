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
        <ul className="grid gap-4">
          <li>
            <p className="mb-1 text-xs font-bold">運営からのお知らせ</p>
            <p>
              <a
                className="text-primary no-underline"
                href="https://twitter.com/yukukuruapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                公式Twitter @yukukuruapp
              </a>
            </p>
          </li>
          <li>
            <p className="mb-1 text-xs font-bold">不具合報告・お問い合わせ</p>
            <p>
              <a
                className="text-primary no-underline"
                href="https://twitter.com/yukukuruapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                公式Twitter にリプライまたはDM
              </a>
            </p>
          </li>
          <li>
            <p className="mb-1 text-xs font-bold">ご意見</p>
            <p>
              <a
                className="text-primary no-underline"
                href="https://odaibako.net/u/yukukuruapp"
                target="_blank"
                rel="noopener noreferrer"
              >
                お題箱
              </a>
            </p>
            <ul className="mt-1 grid gap-1 text-xs">
              <p>※お題箱への書き込みは公開されます</p>
              <p>※投稿者が分からないため、不具合の調査はできません</p>
            </ul>
          </li>
        </ul>
        <TweetButton className="mt-4" size="large" />
      </section>
    </>
  );
};
