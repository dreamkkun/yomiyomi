// 일본어 음성이 없는 브라우저를 위한 대체 음성 프록시.
// Google 번역의 비공식 TTS 엔드포인트를 서버에서 대신 호출해 같은 출처(/api/tts)의 오디오로 내려준다.
// - 브라우저가 외부 사이트에 직접 접속하지 않아도 되고(CORS/차단 회피), 응답을 캐시해 같은 문장은 한 번만 요청한다
// - 아무 텍스트나 중계해 주는 열린 프록시가 되지 않도록 길이·문자·요청 횟수를 제한한다
export const dynamic = 'force-dynamic';

const MAX_CHARS = 100;
const RATE_LIMIT_PER_MINUTE = 60;
const CACHE_LIMIT = 300;
const UPSTREAM_TIMEOUT_MS = 6000;
const JAPANESE_RE = /[぀-ヿ㐀-鿿]/;

const cache = new Map<string, ArrayBuffer>();
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || entry.resetAt < now) {
    hits.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_PER_MINUTE;
}

const audioResponse = (buf: ArrayBuffer, hit: boolean) =>
  new Response(buf, {
    headers: {
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-TTS-Cache': hit ? 'HIT' : 'MISS',
    },
  });

const fail = (status: number, message: string) => Response.json({ error: message }, { status });

export async function GET(request: Request) {
  const text = (new URL(request.url).searchParams.get('text') ?? '').trim();
  if (!text || text.length > MAX_CHARS || !JAPANESE_RE.test(text)) {
    return fail(400, `일본어 텍스트(최대 ${MAX_CHARS}자)만 지원해요`);
  }

  const cached = cache.get(text);
  if (cached) return audioResponse(cached, true);

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'local';
  if (rateLimited(ip)) return fail(429, '요청이 너무 많아요. 잠시 후 다시 시도해 주세요');

  const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=ja&q=${encodeURIComponent(text)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);
  try {
    const upstream = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Yomi-Yomi/0.1)' },
    });
    const type = upstream.headers.get('content-type') ?? '';
    if (!upstream.ok || !type.startsWith('audio')) return fail(502, '음성 서비스가 응답하지 않아요');

    const buf = await upstream.arrayBuffer();
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value as string); // 가장 오래된 항목부터 제거
    cache.set(text, buf);
    return audioResponse(buf, false);
  } catch {
    return fail(502, '음성 서비스에 연결하지 못했어요');
  } finally {
    clearTimeout(timer);
  }
}
