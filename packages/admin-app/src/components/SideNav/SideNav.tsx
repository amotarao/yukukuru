import classNames from 'classnames';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export type SideNavProps = {
  className?: string;
};

export const SideNav: React.FC<SideNavProps> = ({ className }) => {
  const router = useRouter();
  const menuItems = [
    { href: '/users', name: 'Users' },
    { href: '/twUsers', name: 'Tw Users' },
  ];

  return (
    <aside className={classNames('px-8 py-10', className)}>
      <nav>
        <ul>
          {menuItems.map((item, i) => (
            <li key={i} className="mb-1">
              <Link href={item.href}>
                <a
                  className={classNames('block w-full text-sm px-3 py-1 rounded-full', {
                    'bg-slate-700 text-slate-50': item.href === router.pathname,
                  })}
                >
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};
