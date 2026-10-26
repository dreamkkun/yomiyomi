import { Fragment } from 'react';

interface RubyTextProps {
  htmlContent: string; // 예: "<ruby>一人<rt>ひとり</rt></ruby>です"
  /** 지정하면 false일 때 이 컴포넌트의 rt만 숨긴다. 부모에 .hide-furigana를 쓰는 경우 생략 */
  showFurigana?: boolean;
  /** 빈칸으로 가릴 단어 (본문 기준). 후리가나 토글과 무관하게 슬롯으로 표시된다 */
  blank?: string;
  className?: string;
}

interface Unit {
  base: string;
  reading?: string;
}

const RUBY_RE = /<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g;

// furigana 문자열을 [루비 단위 | 일반 한 글자] 목록으로 분해한다
function parseUnits(html: string): Unit[] {
  const units: Unit[] = [];
  const pushPlain = (s: string) => {
    for (const ch of s) units.push({ base: ch });
  };
  let last = 0;
  for (const m of html.matchAll(RUBY_RE)) {
    const idx = m.index ?? 0;
    pushPlain(html.slice(last, idx));
    units.push({ base: m[1], reading: m[2] });
    last = idx + m[0].length;
  }
  pushPlain(html.slice(last));
  return units;
}

// blank가 루비 경계에 걸쳐 있어도(예: <ruby>教</ruby>えて) 겹치는 단위를 모두 하나의 슬롯으로 치환한다
function maskUnits(units: Unit[], blank: string): (Unit | 'slot')[] {
  const text = units.map((u) => u.base).join('');
  const start = text.indexOf(blank);
  if (start < 0) return units;
  const end = start + blank.length;

  const out: (Unit | 'slot')[] = [];
  let pos = 0;
  let slotAdded = false;
  for (const u of units) {
    const uEnd = pos + u.base.length;
    if (uEnd > start && pos < end) {
      if (!slotAdded) {
        out.push('slot');
        slotAdded = true;
      }
    } else {
      out.push(u);
    }
    pos = uEnd;
  }
  return out;
}

// <ruby> 태그만 React 요소로 변환한다. 그 외 문자열은 텍스트로만 렌더링되므로
// dangerouslySetInnerHTML 없이도 XSS 위험이 없다.
export function RubyText({ htmlContent, showFurigana = true, blank, className = '' }: RubyTextProps) {
  const parsed = parseUnits(htmlContent);
  const items = blank ? maskUnits(parsed, blank) : parsed;

  return (
    <span className={`${showFurigana ? '' : 'hide-furigana'} ${className}`.trim()}>
      {items.map((item, i) => {
        if (item === 'slot') {
          return (
            <span
              key={i}
              className="mx-1 inline-block rounded-md border border-amber-300 bg-amber-50 px-3 py-0.5 font-bold tracking-wider text-amber-500"
            >
              [ ? ]
            </span>
          );
        }
        if (item.reading === undefined) return <Fragment key={i}>{item.base}</Fragment>;
        return (
          <ruby key={i}>
            {item.base}
            <rp>(</rp>
            <rt>{item.reading}</rt>
            <rp>)</rp>
          </ruby>
        );
      })}
    </span>
  );
}

export default RubyText;
