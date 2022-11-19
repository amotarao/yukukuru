import { DocumentData, QueryDocumentSnapshot } from 'firebase/firestore';
import Link from 'next/link';
import { TwitterUserIcon } from './TwitterUserIcon';

export type UserRowProps = {
  className?: string;
  doc: QueryDocumentSnapshot<DocumentData>;
};

export const UserRow: React.FC<UserRowProps> = ({ className, doc }) => {
  return (
    <tr key={doc.id} className={className}>
      <td className="whitespace-nowrap p-2 px-3 text-sm">{doc.get('active') ? 'YES' : 'NO'}</td>
      <td className="whitespace-nowrap p-2 px-3 font-mono text-sm">{doc.id}</td>
      <td className="whitespace-nowrap p-2 px-3 font-mono text-sm">
        <div className="flex items-center">
          <TwitterUserIcon className="mr-2 h-6 w-6" src={doc.get('twitter.photoUrl')} />
          <p>@{doc.get('twitter.screenName')}</p>
        </div>
      </td>
      <td className="whitespace-nowrap p-2 px-3 text-right font-mono text-sm">
        {(doc.get('twitter.followersCount') as number).toLocaleString()}
      </td>
      <td className="px-3">
        <Link className={'inline-block rounded bg-slate-700 px-3 py-1 text-sm text-slate-50'} href={`/users/${doc.id}`}>
          More
        </Link>
      </td>
    </tr>
  );
};
