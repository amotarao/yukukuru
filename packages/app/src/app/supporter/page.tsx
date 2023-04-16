import { Metadata } from 'next';
import { SupporterPage } from '../my/supporter/SupporterPage';

export const metadata: Metadata = {
  title: 'ゆくくるサポーター - ゆくくる',
  alternates: { canonical: process.env.NEXT_PUBLIC_PUBLIC_URL + '/supporter' },
};

const Page: React.FC = () => {
  return <SupporterPage withAuth={false} />;
};

export default Page;
