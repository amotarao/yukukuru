import { ConvertRecordsMessage, RecordData, RecordDataOld } from '@yukukuru/types';
import { firestore } from '../modules/firebase';
import { addRecords } from '../utils/firestore/records/addRecords';
import { removeRecord } from '../utils/firestore/records/removeRecord';
import { convertRecords as convert } from '../utils/convert';
import { log } from '../utils/log';
import { PubSubOnPublishHandler } from '../types/functions';

type Props = ConvertRecordsMessage['data'];

export const onPublishConvertRecordsHandler: PubSubOnPublishHandler = async (message) => {
  const { uid } = message.json as Props;

  const rawDocs = await firestore
    .collection('users')
    .doc(uid)
    .collection('records')
    .orderBy('cameUsers')
    .limit(100)
    .get();

  const requests = rawDocs.docs.map(async (doc) => {
    const convertedRecords = convert([
      {
        id: doc.id,
        data: doc.data() as RecordData | RecordDataOld,
      },
    ]);

    await Promise.all([
      removeRecord({ uid, recordId: doc.id }),
      addRecords({ uid, items: convertedRecords.map(({ data }) => data) }),
    ]);
  });
  await Promise.all(requests);

  log('onCreateQueue', 'convertRecords', { uid, type: 'success', ids: rawDocs.docs.map((doc) => doc.id) });
};
