import { Metadata } from 'next';
import { SupporterPage } from '../my/supporter/SupporterPage';

export const metadata: Metadata = {
  title: 'ゆくくるサポーター - ゆくくる',
};

const Page: React.FC = () => {
  return <SupporterPage withAuth={false} />;
};

export default Page;
