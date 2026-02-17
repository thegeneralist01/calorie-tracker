export function sevenDayMovingAverage(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const window = values.slice(-7);
  const total = window.reduce((sum, value) => sum + value, 0);

  return total / window.length;
}

type MergeEvent<T> = {
  createdAt: Date;
  payload: T;
};

export function replayChronological<T>(events: MergeEvent<T>[]): T[] {
  return [...events]
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((event) => event.payload);
}
