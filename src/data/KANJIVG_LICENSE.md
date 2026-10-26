# 획순 데이터 출처

`kanaStrokesMaster.json`의 `strokes[].d` / `label` 값은
[KanjiVG](https://kanjivg.tagaini.net)(Copyright © 2009–2011 Ulrich Apel)의 히라가나·가타카나 SVG에서 추출·가공한 것입니다.

- 라이선스: [Creative Commons Attribution-ShareAlike 3.0](https://creativecommons.org/licenses/by-sa/3.0/)
- 변경 사항: path를 절대좌표(M/L/C)로 변환해 viewBox 0 0 100 100 에 정규화(전 글자 공통 배율, 중앙 정렬)하고, 요음(きゃ 등)은 기본 글자와 작은 ゃゅょ를 한 칸에 맞게 축소·배치한 좌표를 path에 직접 반영했습니다.
- 이 데이터를 변경해 배포하는 경우 같은 라이선스(CC BY-SA 3.0)로 공개해야 합니다.
- 앱 화면(`/kana`) 하단에도 출처를 표기하고 있습니다.
