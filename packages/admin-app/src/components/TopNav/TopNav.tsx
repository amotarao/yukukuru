import classNames from 'classnames';
import { getAuth, signInWithPopup, signOut, TwitterAuthProvider } from 'firebase/auth';
import Link from 'next/link';
import React from 'react';
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
        'col-span-2 flex items-center justify-between px-8 bg-white border-b border-b-blue-100',
        className
      )}
    >
      <h1 className="text-xl">
        <Link href="/">
          <a>Yukukuru Admin</a>
        </Link>
      </h1>
      {loading ? null : user ? (
        <button className="px-3 py-1 rounded bg-blue-700 text-white text-base" onClick={logout}>
          ログアウト
        </button>
      ) : (
        <button className="px-3 py-1 rounded bg-blue-700 text-white text-base" onClick={login}>
          ログイン
        </button>
      )}
    </nav>
  );
};
