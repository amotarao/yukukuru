import dayjs from 'dayjs';
import LocalizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/ja';

dayjs.locale('ja');
dayjs.extend(LocalizedFormat);

export { dayjs };
