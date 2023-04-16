'use client';

import Link from 'next/link';
import { pagesPath } from '../../lib/$path';
import { useAuth } from '../../lib/auth/hooks';

const isTouchDevice = () => {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();

  return (
    <div className="px-[calc(50%-240px)] pt-10 text-center sm:px-[calc(50%-480px)]">
      <h1 className="mb-4">
        <span className="mb-2 block text-3xl">ゆくくる</span>
        <span className="block">マイページログイン</span>
      </h1>
      <div className="mb-4">
        <button
          className="inline-block rounded border border-primary px-4 py-1 text-primary"
          onClick={() => {
            signIn();
          }}
        >
          {isTouchDevice() && <span>タップして</span>}ログイン
        </button>
      </div>
      <div className="mb-4">
        <Link className="inline-block rounded border border-sub px-4 py-1 text-sub" href={pagesPath.$url()}>
          トップページ
        </Link>
      </div>
    </div>
  );
};
