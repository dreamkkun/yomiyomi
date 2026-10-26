# Yomi-Yomi

히라가나·가타카나부터 기초·여행 회화까지, 게임처럼 배우는 일본어 웹앱 (Next.js 14 · TypeScript · Tailwind · Framer Motion · Zustand).

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드 (타입·린트 검사 포함)
```

진행도(경험치, 스트릭, 뱃지, 오답 노트)는 브라우저 `localStorage`에만 저장되며 서버로 전송되지 않습니다.

## 일본어 음성

발음은 브라우저의 Web Speech API(`ja-JP`)로 재생합니다. 기기에 일본어 음성이 없으면 화면 위 안내 배너가 설치 방법을 알려 주고,
사용자가 스위치를 켠 경우에만 `/api/tts`(Google 번역의 비공식 TTS를 서버에서 중계)로 대신 읽어 줍니다.
이 엔드포인트는 비공식이라 언제든 막힐 수 있고 읽을 문장이 구글로 전송되므로 기본값은 꺼짐입니다.
서비스로 운영한다면 공식 TTS API(Google Cloud TTS, Azure 등)로 `src/app/api/tts/route.ts`의 호출부를 교체하세요.

## 데이터 출처 / 라이선스

- `src/data/kanaStrokesMaster.json`의 획순 좌표는 [KanjiVG](https://kanjivg.tagaini.net)(© Ulrich Apel)에서 가공한 것으로
  [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) 라이선스를 따릅니다. 자세한 내용은 `src/data/KANJIVG_LICENSE.md`.
- 단어·회화 데이터와 한글 독음은 학습용 예시이므로 사용 전에 검수하세요.
