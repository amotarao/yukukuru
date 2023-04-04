import * as dayjs from 'dayjs';

const truncateDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
};

export const getDiffMinutes = (to: Date, from: Date): number => {
  const truncatedto = truncateDate(to);
  const truncatedFrom = truncateDate(from);
  return dayjs(truncatedto).diff(dayjs(truncatedFrom), 'minutes');
};
