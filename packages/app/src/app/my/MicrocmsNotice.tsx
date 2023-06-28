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

export function MicrocmsNotice({ className }: Props) {
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
    <section className={classNames('rounded-lg border border-sub p-2', className)}>
      <ul className="grid gap-2">
        {items.map((item) => (
          <li key={item.id}>
            <div
              className="text-center text-xs leading-5 text-sub [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: item.html }}
            ></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
