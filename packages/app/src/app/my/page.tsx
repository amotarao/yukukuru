import { Metadata } from 'next';
import { BottomNav } from '../../components/organisms/BottomNav';
import { MyPage } from './MyPage';

export const metadata: Metadata = {
  title: 'マイページ - ゆくくる',
};

export default function Page() {
  return (
    <>
      <MyPage />
      <BottomNav active="my" scrollToTopOnActive />
    </>
  );
}
