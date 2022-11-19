import { getFirestore, collection, query, orderBy, limit, OrderByDirection } from 'firebase/firestore';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCollectionOnce } from 'react-firebase-hooks/firestore';
import { SortButton } from '../../components/SortButton';
import { UserRow } from '../../components/UserRow';
import { firebaseApp } from '../../modules/firebase';

const firestore = getFirestore(firebaseApp);

const Page: NextPage = () => {
  const router = useRouter();

  let q = query(collection(firestore, 'users'));

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
      <div className="rounded border pb-6">
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
            {snapshot.docs.map((doc) => (
              <UserRow key={doc.id} className="border-b" doc={doc} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;
};

export default Page;
