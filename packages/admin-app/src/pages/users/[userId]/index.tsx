import classNames from 'classnames';
import { collection, query, orderBy, limitToLast, Timestamp, CollectionReference } from 'firebase/firestore';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCollectionOnce } from 'react-firebase-hooks/firestore';
import { TwitterUserIcon } from '../../../components/TwitterUserIcon';
import { CsvExporter } from '../../../components/CsvExporter';
// import { RecordsBarGraph } from '../../../components/RecordsBarGraph';
import { firestore } from '../../../modules/firebase';
import { dateOptions } from '../../../modules/date';

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
    collection(firestore, 'users', userId, 'records') as CollectionReference<RecordData>,
    orderBy('durationEnd'),
    limitToLast(100)
  );
  const [snapshot, loading, error] = useCollectionOnce(q);

  return (
    <section className={classNames(className)}>
      {error ? (
        <pre>{error.message}</pre>
      ) : loading ? (
        <p>読み込み中</p>
      ) : snapshot ? (
        <div>
          <h2 className="text-lg mb-4">Records</h2>
          <CsvExporter className="mb-6" userId={userId} />
          {/* <RecordsBarGraph className="mb-6" snapshot={snapshot} /> */}
          <div className="border rounded pb-6">
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
                      <td className="p-2 px-3 text-sm whitespace-nowrap">{doc.get('type')}</td>
                      <td className="p-2 px-3 text-sm whitespace-nowrap">
                        {(doc.get('durationStart') as Timestamp).toDate().toLocaleString('ja-JP', dateOptions)}
                      </td>
                      <td className="p-2 px-3 text-sm whitespace-nowrap">
                        {(doc.get('durationEnd') as Timestamp).toDate().toLocaleString('ja-JP', dateOptions)}
                      </td>
                      <td className="p-2 px-3 text-sm whitespace-nowrap">
                        <div className="flex items-center">
                          <TwitterUserIcon className="w-6 h-6 mr-2" src={doc.get('user.photoUrl')} />
                          <p>@{doc.get('user.screenName')}</p>
                        </div>
                      </td>
                      <td className="p-2 px-3 text-sm whitespace-nowrap">
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
  const q = query(collection(firestore, 'users', userId, 'watches'), orderBy('getStartDate'), limitToLast(30));
  const [snapshot, loading, error] = useCollectionOnce(q);

  return (
    <section className={className}>
      {error ? (
        <pre>{error.message}</pre>
      ) : loading ? (
        <p>読み込み中</p>
      ) : snapshot ? (
        <div>
          <h2 className="text-lg mb-4">Watches</h2>
          <div className="border rounded pb-6">
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
                      <td className="p-2 px-3 text-sm whitespace-nowrap">{doc.get('ended') ? 'YES' : 'NO'}</td>
                      <td className="p-2 px-3 text-sm whitespace-nowrap">
                        {(doc.get('getStartDate') as Timestamp).toDate().toLocaleString('ja-JP', dateOptions)}
                      </td>
                      <td className="p-2 px-3 text-sm whitespace-nowrap">
                        {(doc.get('getEndDate') as Timestamp).toDate().toLocaleString('ja-JP', dateOptions)}
                      </td>
                      <td className="p-2 px-3 text-sm whitespace-nowrap">
                        {(doc.get('followers') as any[]).length.toLocaleString()}
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
