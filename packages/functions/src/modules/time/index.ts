import * as dayjs from 'dayjs';

const truncateDateByMinutes = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
};

export const getDiffMinutes = (to: Date, from: Date): number => {
  const truncatedTo = truncateDateByMinutes(to);
  const truncatedFrom = truncateDateByMinutes(from);
  return dayjs(truncatedTo).diff(dayjs(truncatedFrom), 'minutes');
};

const truncateDateByDays = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const getDiffDays = (to: Date, from: Date): number => {
  const truncatedTo = truncateDateByDays(to);
  const truncatedFrom = truncateDateByDays(from);
  return dayjs(truncatedTo).diff(dayjs(truncatedFrom), 'days');
};
