/** 로컬 시간 기준 YYYY-MM-DD (UTC 기준 toISOString 은 한국 시간 오전 9시에 날짜가 바뀌어 쓰지 않는다) */
export const toDateString = (d: Date) => {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
};

export const todayString = (now: Date = new Date()) => toDateString(now);

/** now 로부터 days 일 뒤의 로컬 날짜 (DST 와 무관하게 달력 기준으로 계산) */
export const addDays = (now: Date, days: number) =>
  toDateString(new Date(now.getFullYear(), now.getMonth(), now.getDate() + days));
