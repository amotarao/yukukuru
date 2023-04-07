import { collection, query, orderBy, limitToLast, Timestamp, CollectionReference } from 'firebase/firestore';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCollectionOnce } from 'react-firebase-hooks/firestore';
import { CsvExporter } from '../../../components/CsvExporter';
import { TwitterUserIcon } from '../../../components/TwitterUserIcon';
import { dateOptions } from '../../../modules/date';
import { firestore } from '../../../modules/firebase';

type RecordData = {
  durationStart: Timestamp;
  durationEnd: Timestamp;
  type: 'yuku' | 'kuru';
  user: {
    id: string;
  };
};

type RecordsSectionProps = {
  className?: string;
  userId: string;
};

const RecordsSection: React.FC<RecordsSectionProps> = ({ className, userId }) => {
  const q = query<RecordData>(
    collection(firestore, 'users', userId, 'recordsV2') as CollectionReference<RecordData>,
    orderBy('durationEnd'),
    limitToLast(100)
  );
  const [snapshot, loading, error] = useCollectionOnce(q);

  return (
    <section className={className}>
      {error ? (
        <pre>{error.message}</pre>
      ) : loading ? (
        <p>読み込み中</p>
      ) : snapshot ? (
        <div>
          <h2 className="mb-4 text-lg">Records</h2>
          <CsvExporter className="mb-6" userId={userId} />
          {/* <RecordsBarGraph className="mb-6" snapshot={snapshot} /> */}
          <div className="rounded border pb-6">
            <table className="table w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 px-3 text-left">type</th>
                  <th className="p-2 px-3 text-left">durationStart</th>
                  <th className="p-2 px-3 text-left">durationEnd</th>
                  <th className="p-2 px-3 text-left">user</th>
                  <th className="p-2 px-3 text-left">maybeDeletedOrSuspended</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.docs.slice(-30).map((doc) => {
                  return (
                    <tr key={doc.id} className="border-b">
                      <td className="whitespace-nowrap p-2 px-3 text-sm">{doc.get('type')}</td>
                      <td className="whitespace-nowrap p-2 px-3 text-sm">
                        {(doc.get('durationStart') as Timestamp).toDate().toLocaleString('ja-JP', dateOptions)}
                      </td>
                      <td className="whitespace-nowrap p-2 px-3 text-sm">
                        {(doc.get('durationEnd') as Timestamp).toDate().toLocaleString('ja-JP', dateOptions)}
                      </td>
                      <td className="whitespace-nowrap p-2 px-3 text-sm">
                        <div className="flex items-center">
                          <TwitterUserIcon className="mr-2 h-6 w-6" src={doc.get('user.photoUrl')} />
                          <p>@{doc.get('user.screenName')}</p>
                        </div>
                      </td>
                      <td className="whitespace-nowrap p-2 px-3 text-sm">
                        {doc.get('user.maybeDeletedOrSuspended') ? 'YES' : 'NO'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
};

type WatchesSectionProps = {
  className?: string;
  userId: string;
};

const WatchesSection: React.FC<WatchesSectionProps> = ({ className, userId }) => {
  const q = query(collection(firestore, 'users', userId, 'watchesV2'), orderBy('getStartDate'), limitToLast(30));
  const [snapshot, loading, error] = useCollectionOnce(q);

  return (
    <section className={className}>
      {error ? (
        <pre>{error.message}</pre>
      ) : loading ? (
        <p>読み込み中</p>
      ) : snapshot ? (
        <div>
          <h2 className="mb-4 text-lg">Watches</h2>
          <div className="rounded border pb-6">
            <table className="table w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 px-3 text-left">ended</th>
                  <th className="p-2 px-3 text-left">getStartDate</th>
                  <th className="p-2 px-3 text-left">getEndDate</th>
                  <th className="p-2 px-3 text-left">followers</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.docs.slice(-30).map((doc) => {
                  return (
                    <tr key={doc.id} className="border-b">
                      <td className="whitespace-nowrap p-2 px-3 text-sm">{doc.get('ended') ? 'YES' : 'NO'}</td>
                      <td className="whitespace-nowrap p-2 px-3 text-sm">
                        {(doc.get('getStartDate') as Timestamp).toDate().toLocaleString('ja-JP', dateOptions)}
                      </td>
                      <td className="whitespace-nowrap p-2 px-3 text-sm">
                        {(doc.get('getEndDate') as Timestamp).toDate().toLocaleString('ja-JP', dateOptions)}
                      </td>
                      <td className="whitespace-nowrap p-2 px-3 text-sm">
                        {(doc.get('followers') as string[]).length.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
};

const Page: NextPage = () => {
  const router = useRouter();
  const userId = router.query.userId as string;

  return (
    <div>
      <RecordsSection className="mb-8" userId={userId} />
      <WatchesSection className="mb-8" userId={userId} />
    </div>
  );
};

export default Page;
