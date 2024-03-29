import { collection, doc, addDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { useEffect, useState } from 'react';
import { useDocument } from 'react-firebase-hooks/firestore';
import { firestore, storage } from '../../modules/firebase';

type ExporterProps = {
  userId: string;
};

const Exporter: React.FC<ExporterProps> = ({ userId }) => {
  const [docId, setDocId] = useState('__');
  const [downloadUrl, setDownloadUrl] = useState('');

  useEffect(() => {
    addDoc(collection(firestore, 'csvExportRequests'), {
      type: 'records',
      userId,
    }).then((ref) => {
      setDocId(ref.id);
    });
  }, [userId]);

  const [snapshot, loading, error] = useDocument(doc(firestore, 'csvExportRequests', docId));
  const storageRef = (snapshot?.get('storageRef') as string | undefined) ?? undefined;

  useEffect(() => {
    if (!storageRef) {
      return;
    }
    const sRef = ref(storage, storageRef);
    getDownloadURL(sRef).then((url) => {
      setDownloadUrl(url);
    });
  }, [storageRef]);

  return error ? (
    <p className="inline-block rounded bg-gray-500 px-4 py-1 text-sm text-white">{error.message}</p>
  ) : loading ? (
    <p className="inline-block rounded bg-gray-500 px-4 py-1 text-sm text-white">読み込み中</p>
  ) : !snapshot || !downloadUrl ? (
    <p className="inline-block rounded bg-gray-500 px-4 py-1 text-sm text-white">準備中</p>
  ) : (
    <a className="inline-block rounded bg-blue-500 px-4 py-1 text-sm text-white" href={downloadUrl}>
      CSV ダウンロード
    </a>
  );
};

export type CsvExporterProps = {
  className?: string;
  userId: string;
};

export const CsvExporter: React.FC<CsvExporterProps> = ({ className, userId }) => {
  const [shownExporter, setShownExporter] = useState(false);

  return (
    <div className={className}>
      {shownExporter ? (
        <Exporter userId={userId} />
      ) : (
        <button
          className="inline-block rounded bg-blue-500 px-4 py-1 text-sm text-white"
          onClick={() => {
            setShownExporter(true);
          }}
        >
          CSV エクスポート
        </button>
      )}
    </div>
  );
};
