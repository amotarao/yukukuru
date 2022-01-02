import classNames from 'classnames';
import { getFirestore, collection, query, orderBy, limit } from 'firebase/firestore';
import type { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useCollectionOnce } from 'react-firebase-hooks/firestore';
import { firebaseApp } from '../../modules/firebase';
import { TwitterUserIcon } from '../../components/TwitterUserIcon';
import { SortButton } from '../../components/SortButton';

const firestore = getFirestore(firebaseApp);

const Page: NextPage = () => {
  const router = useRouter();

  let q = query(collection(firestore, 'users'));

  const orderByValue = 'orderBy' in router.query ? router.query.orderBy : '__name__';
  const direction = 'orderByDirection' in router.query ? router.query.orderByDirection : 'asc';
  q = query(q, orderBy(orderByValue, direction));

  const limitValue = 'limit' in router.query ? parseInt(router.query.limit) : 100;
  q = query(q, limit(limitValue));

  const [snapshot, loading, error] = useCollectionOnce(q);

  return error ? (
    <pre>{error.message}</pre>
  ) : loading ? (
    <p>読み込み中</p>
  ) : snapshot ? (
    <div>
      <div className="border rounded pb-6">
        <table className="table w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 px-3 text-left">active</th>
              <th className="p-2 px-3 text-left">
                <span className="mr-2">id</span>
                <SortButton
                  className="mr-1"
                  direction="asc"
                  onClick={() => {
                    router.replace({
                      query: { ...router.query, orderBy: '__name__', orderByDirection: 'asc' },
                    });
                  }}
                />
              </th>
              <th className="p-2 px-3 text-left">
                <span className="mr-2">screenName</span>
                <SortButton
                  className="mr-1"
                  direction="asc"
                  onClick={() => {
                    router.replace({
                      query: { ...router.query, orderBy: 'twitter.screenName', orderByDirection: 'asc' },
                    });
                  }}
                />
                <SortButton
                  className="mr-1"
                  direction="desc"
                  onClick={() => {
                    router.replace({
                      query: { ...router.query, orderBy: 'twitter.screenName', orderByDirection: 'desc' },
                    });
                  }}
                />
              </th>
              <th className="p-2 px-3 text-right">
                <span className="mr-2">followersCount</span>
                <SortButton
                  className="mr-1"
                  direction="asc"
                  onClick={() => {
                    router.replace({
                      query: { ...router.query, orderBy: 'twitter.followersCount', orderByDirection: 'asc' },
                    });
                  }}
                />
                <SortButton
                  className="mr-1"
                  direction="desc"
                  onClick={() => {
                    router.replace({
                      query: { ...router.query, orderBy: 'twitter.followersCount', orderByDirection: 'desc' },
                    });
                  }}
                />
              </th>
              <th className="p-2 px-3 text-left">more</th>
            </tr>
          </thead>
          <tbody>
            {snapshot.docs.map((doc) => {
              return (
                <tr key={doc.id} className="border-b">
                  <td className="p-2 px-3 text-sm whitespace-nowrap">{doc.get('active') ? 'YES' : 'NO'}</td>
                  <td className="p-2 px-3 text-sm whitespace-nowrap font-mono">{doc.id}</td>
                  <td className="p-2 px-3 text-sm whitespace-nowrap font-mono">
                    <div className="flex items-center">
                      <TwitterUserIcon className="w-6 h-6 mr-2" src={doc.get('twitter.photoUrl')} />
                      <p>@{doc.get('twitter.screenName')}</p>
                    </div>
                  </td>
                  <td className="p-2 px-3 text-sm text-right whitespace-nowrap font-mono">
                    {(doc.get('twitter.followersCount') as number).toLocaleString()}
                  </td>
                  <td className="px-3">
                    <Link href={`/users/${doc.id}`} passHref>
                      <a className={classNames('inline-block text-sm px-3 py-1 rounded bg-slate-700 text-slate-50')}>
                        More
                      </a>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;
};

export default Page;
