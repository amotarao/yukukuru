import { collection, DocumentData, getCountFromServer, QueryDocumentSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { firestore } from '../modules/firebase';
import { TwitterUserIcon } from './TwitterUserIcon';

export type UserRowProps = {
  className?: string;
  doc: QueryDocumentSnapshot<DocumentData>;
};

export const UserRow: React.FC<UserRowProps> = ({ className, doc }) => {
  const ref = useRef<HTMLTableRowElement>(null);
  const entry = useIntersectionObserver(ref, {
    freezeOnceVisible: true,
  });
  const [watchesCount, setWatchesCount] = useState(-1);
  const [recordsCount, setRecordsCount] = useState(-1);

  useEffect(() => {
    if (!entry?.isIntersecting) return;
    (async () => {
      const q = collection(firestore, 'users', doc.id, 'watches');
      const count = await getCountFromServer(q);
      setWatchesCount(count.data().count);
    })();
  }, [doc.id, entry]);

  useEffect(() => {
    if (!entry?.isIntersecting) return;
    (async () => {
      const q = collection(firestore, 'users', doc.id, 'records');
      const count = await getCountFromServer(q);
      setRecordsCount(count.data().count);
    })();
  }, [doc.id, entry]);

  return (
    <tr ref={ref} key={doc.id} className={className}>
      <td className="whitespace-nowrap p-2 px-3 text-sm">
        {doc.get('active') && !doc.get('deletedAuth') ? 'YES' : 'NO'}
      </td>
      <td className="whitespace-nowrap p-2 px-3 font-mono text-sm">{doc.id}</td>
      <td className="whitespace-nowrap p-2 px-3 font-mono text-sm">
        <div className="flex items-center">
          <TwitterUserIcon className="mr-2 h-6 w-6" src={doc.get('twitter.photoUrl')} />
          <p>@{doc.get('twitter.screenName')}</p>
        </div>
      </td>
      <td className="whitespace-nowrap p-2 px-3 text-right text-sm">
        {(doc.get('twitter.followersCount') as number).toLocaleString()}
      </td>
      <td className="px-3 text-right text-sm">{watchesCount}</td>
      <td className="px-3 text-right text-sm">{recordsCount}</td>
      <td className="px-3">
        <Link className={'inline-block rounded bg-slate-700 px-3 py-1 text-sm text-slate-50'} href={`/users/${doc.id}`}>
          More
        </Link>
      </td>
    </tr>
  );
};
