import { ImageResponse } from 'next/og';
import { getKanaById } from '@/utils/kanaParser';

// 링크 미리보기(카카오톡·슬랙·X·페이스북 등)에 쓰이는 대표 이미지. 빌드할 때 한 번 만들어 정적 파일로 제공한다.
export const alt = 'Yomi-Yomi - 게임처럼 배우는 일본어';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
// Windows 개발 환경에서는 Node 런타임의 이미지 생성기가 기본 글꼴 경로를 읽지 못해(ERR_INVALID_URL) edge 런타임을 쓴다
export const runtime = 'edge';

const KANA_IDS = ['h_a', 'h_i', 'h_u', 'h_e', 'h_o'];
const PILLS = ['Kana', 'Vocab', 'Roleplay', 'SRS Review'];

// 이미지 생성기(satori)의 기본 글꼴에는 일본어가 없어서, 글자를 글꼴 대신 우리 획순 데이터(SVG path)로 직접 그린다
function KanaTile({ id }: { id: string }) {
  const kana = getKanaById(id);
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 150,
        height: 150,
        borderRadius: 36,
        background: '#ffffff',
        boxShadow: '0 8px 0 #a7f3d0',
      }}
    >
      <svg width="112" height="112" viewBox="0 0 100 100">
        {kana?.strokes.map((s) => (
          <path
            key={s.order}
            d={s.d}
            fill="none"
            stroke="#059669"
            strokeWidth={7}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
  );
}

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 90px',
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 55%, #a7f3d0 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 132, fontWeight: 800, letterSpacing: -4 }}>
          <span style={{ color: '#047857' }}>Yomi</span>
          <span style={{ color: '#f59e0b' }}>-Yomi</span>
        </div>

        <div style={{ display: 'flex', fontSize: 44, fontWeight: 600, color: '#065f46', marginTop: 4 }}>
          Learn Japanese like a game
        </div>

        <div style={{ display: 'flex', gap: 22, marginTop: 52 }}>
          {KANA_IDS.map((id) => (
            <KanaTile key={id} id={id} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 14, marginTop: 44 }}>
          {PILLS.map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '10px 24px',
                borderRadius: 999,
                background: '#047857',
                color: '#ecfdf5',
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
