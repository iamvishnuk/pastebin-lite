export const TTL = [
  { label: 'No expiry', value: null },
  { label: '5 min', value: 5 * 60 },
  { label: '10 min', value: 10 * 60 },
  { label: '30 min', value: 30 * 60 },
  { label: '1 hour', value: 60 * 60 },
  { label: '6 hours', value: 6 * 60 * 60 },
  { label: '12 hours', value: 12 * 60 * 60 },
  { label: '1 day', value: 24 * 60 * 60 },
  { label: '7 day', value: 7 * 24 * 60 * 60 }
] as const;

export type TtlOption = (typeof TTL)[number];
