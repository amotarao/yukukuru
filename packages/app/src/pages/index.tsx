import Head from 'next/head';
import { TopPage } from '../components/pages/TopPage';

const Page: React.FC = () => {
  return (
    <>
      <Head>
        <title>ゆくくる beta</title>
      </Head>
      <TopPage />
    </>
  );
};

export default Page;
