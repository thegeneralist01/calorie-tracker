export function getUserDayWindow(now: Date, dayCutoffMinutes: number): { dayStart: Date; dayEnd: Date } {
  const shifted = new Date(now.getTime() - dayCutoffMinutes * 60_000);
  const start = new Date(shifted);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  const dayStart = new Date(start.getTime() + dayCutoffMinutes * 60_000);
  const dayEnd = new Date(end.getTime() + dayCutoffMinutes * 60_000);

  return { dayStart, dayEnd };
}
