import { getFirestore, collection, query, orderBy, limit, Timestamp, OrderByDirection } from 'firebase/firestore';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCollectionOnce } from 'react-firebase-hooks/firestore';
import { firebaseApp } from '../../modules/firebase';
import { TwitterUserIcon } from '../../components/TwitterUserIcon';
import { SortButton } from '../../components/SortButton';
import { dateOptions } from '../../modules/date';

const firestore = getFirestore(firebaseApp);

const Page: NextPage = () => {
  const router = useRouter();

  let q = query(collection(firestore, 'twUsers'));

  const orderByValue =
    'orderBy' in router.query && router.query.orderBy
      ? Array.isArray(router.query.orderBy)
        ? router.query.orderBy[0]
        : router.query.orderBy
      : '__name__';
  const direction = (
    'orderByDirection' in router.query && router.query.orderByDirection
      ? Array.isArray(router.query.orderByDirection)
        ? router.query.orderByDirection[0]
        : router.query.orderByDirection
      : 'asc'
  ) as OrderByDirection;
  q = query(q, orderBy(orderByValue, direction));

  const limitValue =
    'limit' in router.query && router.query.limit
      ? parseInt(Array.isArray(router.query.limit) ? router.query.limit[0] : router.query.limit)
      : 100;
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
                      query: { ...router.query, orderBy: 'screenName', orderByDirection: 'asc' },
                    });
                  }}
                />
                <SortButton
                  className="mr-1"
                  direction="desc"
                  onClick={() => {
                    router.replace({
                      query: { ...router.query, orderBy: 'screenName', orderByDirection: 'desc' },
                    });
                  }}
                />
              </th>
              <th className="p-2 px-3 text-right">
                <span className="mr-2">lastUpdated</span>
                <SortButton
                  className="mr-1"
                  direction="asc"
                  onClick={() => {
                    router.replace({
                      query: { ...router.query, orderBy: 'lastUpdated', orderByDirection: 'asc' },
                    });
                  }}
                />
                <SortButton
                  className="mr-1"
                  direction="desc"
                  onClick={() => {
                    router.replace({
                      query: { ...router.query, orderBy: 'lastUpdated', orderByDirection: 'desc' },
                    });
                  }}
                />
              </th>
            </tr>
          </thead>
          <tbody>
            {snapshot.docs.map((doc) => {
              return (
                <tr key={doc.id} className="border-b">
                  <td className="p-2 px-3 text-sm whitespace-nowrap font-mono">{doc.id}</td>
                  <td className="p-2 px-3 text-sm whitespace-nowrap font-mono">
                    <div className="flex items-center">
                      <TwitterUserIcon className="w-6 h-6 mr-2" src={doc.get('photoUrl')} />
                      <p>@{doc.get('screenName')}</p>
                    </div>
                  </td>
                  <td className="p-2 px-3 text-sm text-right whitespace-nowrap font-mono">
                    {(doc.get('lastUpdated') as Timestamp | undefined)?.toDate().toLocaleString('ja-JP', dateOptions) ??
                      ''}
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
