import classNames from 'classnames';
import { getAuth, signInWithPopup, signOut, TwitterAuthProvider } from 'firebase/auth';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { firebaseApp } from '../../modules/firebase';

const auth = getAuth(firebaseApp);
const provider = new TwitterAuthProvider();

const login = () => {
  signInWithPopup(auth, provider);
};
const logout = () => {
  signOut(auth);
};

export type TopNavProps = {
  className?: string;
};

export const TopNav: React.FC<TopNavProps> = ({ className }) => {
  const [user, loading] = useAuthState(auth);

  return (
    <nav
      className={classNames(
        'col-span-2 flex items-center justify-between border-b border-b-blue-100 bg-white px-8',
        className
      )}
    >
      <h1 className="text-xl">
        <Link href="/">Yukukuru Admin</Link>
      </h1>
      {loading ? null : user ? (
        <button className="rounded bg-blue-700 px-3 py-1 text-base text-white" onClick={logout}>
          ログアウト
        </button>
      ) : (
        <button className="rounded bg-blue-700 px-3 py-1 text-base text-white" onClick={login}>
          ログイン
        </button>
      )}
    </nav>
  );
};
