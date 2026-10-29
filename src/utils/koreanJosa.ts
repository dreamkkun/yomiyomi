/** 마지막 글자가 받침으로 끝나는 한글인지 */
export const hasBatchim = (word: string): boolean => {
  const last = word.trim().slice(-1);
  const code = last.charCodeAt(0);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 !== 0;
};

/**
 * 번역 틀을 단어로 채운다.
 *  - {N}        -> 단어 그대로
 *  - {N:은/는}   -> 받침에 맞는 조사를 붙인 단어 (은/는, 을/를, 이/가 등)
 */
export function formatKorean(template: string, noun: string): string {
  return template
    .replace(/\{N:([^/}]+)\/([^}]+)\}/g, (_, withBatchim: string, without: string) =>
      noun + (hasBatchim(noun) ? withBatchim : without),
    )
    .replace(/\{N\}/g, noun);
}
