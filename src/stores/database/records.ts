import { useState, useEffect } from 'react';
import { createContainer } from 'unstated-next';
import { firestore } from '../../modules/firebase';

const usersCollection = firestore.collection('users');

export interface RecordInterface {
  id: string;
  data: RecordDataInterface;
}

export interface RecordDataInterface {
  cameUsers: RecordItemUserInterface[];
  leftUsers: RecordItemUserInterface[];
  durationStart: firebase.firestore.Timestamp;
  durationEnd: firebase.firestore.Timestamp;
}

export interface RecordItemUserInterface {
  id: string;
  name?: string;
  screenName?: string;
  photoUrl?: string;
  detail: boolean;
}

const useRecords = () => {
  const [isLoading, setLoading] = useState<boolean>(true);
  const [items, setItems] = useState<RecordInterface[]>([]);
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    const tmpItems: RecordInterface[] = [];

    if (!uid) {
      return;
    }

    usersCollection
      .doc(uid)
      .collection('records')
      .orderBy('durationEnd', 'desc')
      .onSnapshot((snapshot) => {
        setLoading(false);

        snapshot.docChanges().forEach(({ type, doc }) => {
          const item = {
            id: doc.id,
            data: doc.data() as RecordDataInterface,
          };
          const index = tmpItems.findIndex((e) => e.id === item.id);

          switch (type) {
            case 'added':
              tmpItems.push(item);
              break;
            case 'modified':
              tmpItems.splice(index, 1, item);
              break;
            case 'removed':
              tmpItems.splice(index, 1);
              break;
            default:
              break;
          }
          setItems([...tmpItems]);
        });
      });
  }, [uid]);

  return {
    isLoading,
    items,
    setUid,
  };
};

export const RecordsContainer = createContainer(useRecords);
