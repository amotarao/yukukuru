import {
  Chart,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
} from 'chart.js';
import { QuerySnapshot } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';

Chart.register(LineController, BarElement, LineElement, PointElement, LinearScale, CategoryScale, Title);

export type RecordsBarGraphProps = {
  className?: string;
  snapshot?: QuerySnapshot;
};

export const RecordsBarGraph: React.FC<RecordsBarGraphProps> = ({ className, snapshot }) => {
  const dates = [];
  const barData = snapshot
    ? snapshot.docs.reduce<{ x: string; y: number }[]>((prev, doc) => {
        const data = doc.data();
        const date = data.durationEnd.toDate().toISOString().slice(0, 7);
        const exists = prev.find((item) => item.x === date);
        if (exists) {
          exists.y++;
        } else {
          dates.push(date);
          prev.push({ x: date, y: 1 });
        }
        return prev;
      }, [])
    : [];

  return (
    <div className={className}>
      <Bar
        options={{
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        }}
        data={{ datasets: [{ data: barData }] }}
      />
    </div>
  );
};
