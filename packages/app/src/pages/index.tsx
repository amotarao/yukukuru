import Head from 'next/head';
import { TopPage } from '../components/pages/TopPage';

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <title>ゆくくる alpha</title>
      </Head>
      <TopPage />
    </>
  );
};

export default Page;
