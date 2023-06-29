import classNames from 'classnames';
import { createClient } from 'microcms-js-sdk';
import { useEffect, useState } from 'react';

const client = createClient({
  serviceDomain: process.env.NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN || '',
  apiKey: process.env.NEXT_PUBLIC_MICROCMS_API_KEY || '',
});

type Notice = {
  id: string;
  html: string;
};

type Props = {
  className?: string;
};

export function Notice({ className }: Props) {
  const defaultItems: Notice[] = [
    {
      id: '1',
      html: '<p>残念ながら再開の兆しがないため、ゆくくるは無期限休止とします<br><a href="https://twitter.com/yukukuruapp/status/1674011622279622657" target="_blank" rel="noopener noreferrer nofollow">詳細、サポータープラン課金・返金の案内はこちら</a></p>',
    },
  ];
  const [items, setItems] = useState<Notice[]>([]);

  useEffect(() => {
    client
      .getList<Notice>({ endpoint: 'notice' })
      .then((res) => {
        setItems(res.contents.map(({ id, html }) => ({ id, html })));
      })
      .catch(() => null);
  }, []);

  if (items.length === 0) return null;

  return (
    <section className={classNames('rounded-lg border p-2', className)}>
      <ul className="grid gap-2">
        {[...defaultItems, ...items].map((item) => (
          <li key={item.id}>
            <div
              className="text-center text-xs leading-5 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: item.html }}
            ></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
