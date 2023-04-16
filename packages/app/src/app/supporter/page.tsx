import { redirect } from 'next/navigation';
import { pagesPath } from '../../lib/$path';

export default function Page() {
  redirect(pagesPath.my.supporter.$url().pathname);
}
