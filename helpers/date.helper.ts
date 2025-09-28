// set = 7
// output: 2024-02-07T00:00:00.000Z (+7 days)
export const getDatetimeNowWithSetDays = (set: number) => {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + set);

  return currentDate;
};

export function orderFormatDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds(),
  )}`;
}

export function getMonth() {
  return [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
}

export function getDay() {
  return [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
}
