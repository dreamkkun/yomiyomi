export type VoiceStatus = 'checking' | 'ready' | 'missing' | 'unsupported';

export const isSpeechSupported = (): boolean =>
  typeof window !== 'undefined' && 'speechSynthesis' in window;

// 일부 환경(Android 등)은 언어 코드를 'ja_JP' 처럼 밑줄로 돌려준다
const normalizeLang = (lang: string) => lang.replace('_', '-').toLowerCase();

let voicesLoaded = false;
let japaneseVoice: SpeechSynthesisVoice | null = null;

/** 일본어 음성 중 가장 자연스러운 것을 고른다 (온라인/Natural > Google > 로컬 > 그 외) */
export function pickJapaneseVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const score = (v: SpeechSynthesisVoice) =>
    (/natural|online/i.test(v.name) ? 3 : 0) + (/google/i.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0);
  const ja = voices.filter((v) => normalizeLang(v.lang).startsWith('ja'));
  return ja.sort((a, b) => score(b) - score(a))[0] ?? null;
}

/** 현재 보이는 음성 목록으로 캐시를 갱신한다 (목록은 비동기로 채워지므로 비어 있으면 아직 로딩 전으로 본다) */
export function refreshVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    voicesLoaded = true;
    japaneseVoice = pickJapaneseVoice(voices);
  }
  return voices;
}

/** 음성 목록이 채워질 때까지 기다린다 (voiceschanged 이벤트 또는 타임아웃). 로딩 여부를 돌려준다 */
export function loadVoices(timeoutMs = 1500): Promise<boolean> {
  if (!isSpeechSupported()) return Promise.resolve(false);
  refreshVoices();
  if (voicesLoaded) return Promise.resolve(true);

  return new Promise((resolve) => {
    const synth = window.speechSynthesis;
    const done = () => {
      synth.removeEventListener('voiceschanged', onChange);
      clearTimeout(timer);
      refreshVoices();
      resolve(voicesLoaded);
    };
    const onChange = () => {
      if (synth.getVoices().length > 0) done();
    };
    const timer = setTimeout(done, timeoutMs);
    synth.addEventListener('voiceschanged', onChange);
  });
}

export function getVoiceStatus(): VoiceStatus {
  if (!isSpeechSupported()) return 'unsupported';
  refreshVoices();
  if (!voicesLoaded) return 'checking';
  return japaneseVoice ? 'ready' : 'missing';
}

export const hasJapaneseVoice = (): boolean => getVoiceStatus() === 'ready';

// ---- 인터넷 음성(대체 수단) ------------------------------------------------------------
// 일본어 음성이 없는 기기에서는 같은 출처의 /api/tts 가 중계하는 Google 번역 TTS 로 대신 읽는다.
const REMOTE_KEY = 'yomi-remote-tts';
export const REMOTE_TTS_MAX_CHARS = 100;

let remoteEnabled: boolean | null = null;
const remoteListeners = new Set<() => void>();

/** 인터넷 음성 사용 여부 (기본 꺼짐: 읽을 문장이 외부(구글)로 전송되므로 사용자가 직접 켠 경우에만 쓴다) */
export function isRemoteTtsEnabled(): boolean {
  if (remoteEnabled === null) {
    try {
      remoteEnabled = typeof window === 'undefined' ? false : localStorage.getItem(REMOTE_KEY) === 'on';
    } catch {
      remoteEnabled = false;
    }
  }
  return remoteEnabled;
}

export function setRemoteTtsEnabled(enabled: boolean) {
  remoteEnabled = enabled;
  try {
    localStorage.setItem(REMOTE_KEY, enabled ? 'on' : 'off');
  } catch {
    // 저장할 수 없으면 이번 방문에서만 적용
  }
  remoteListeners.forEach((l) => l());
}

export function subscribeRemoteTts(listener: () => void) {
  remoteListeners.add(listener);
  return () => {
    remoteListeners.delete(listener);
  };
}

export const canUseRemoteTts = (text: string) => isRemoteTtsEnabled() && text.length <= REMOTE_TTS_MAX_CHARS;

let remoteAudio: HTMLAudioElement | null = null;

function stopRemoteAudio() {
  if (!remoteAudio) return;
  remoteAudio.onended = null;
  remoteAudio.onerror = null;
  remoteAudio.pause();
  remoteAudio.removeAttribute('src');
  remoteAudio = null;
}

/** 서버 프록시를 통해 받은 일본어 음성을 재생한다. 끝나면 onEnd, 불러오지 못하면 onFail(그 뒤 onEnd 도 호출) */
export function playRemoteTTS(text: string, onEnd?: () => void, onFail?: () => void) {
  if (typeof window === 'undefined') return;
  stopRemoteAudio();
  if (isSpeechSupported()) window.speechSynthesis.cancel();
  const token = ++currentToken;

  const audio = new Audio(`/api/tts?text=${encodeURIComponent(text)}`);
  audio.playbackRate = 0.9; // 입문자용 약간 느린 속도
  remoteAudio = audio;

  let settled = false;
  const finish = (failed: boolean) => {
    if (settled) return;
    settled = true;
    if (remoteAudio === audio) remoteAudio = null;
    if (token !== currentToken) return; // 다른 발화로 대체된 경우
    if (failed) onFail?.();
    onEnd?.();
  };
  audio.onended = () => finish(false);
  audio.onerror = () => finish(true);
  audio.play().catch(() => finish(true));
}

// cancel()이 이전 발화의 end/error 콜백을 비동기로 호출하므로, 최신 발화의 콜백만 실행되도록 토큰으로 구분한다
let currentToken = 0;

export const cancelSpeech = () => {
  currentToken++;
  stopRemoteAudio();
  if (isSpeechSupported()) window.speechSynthesis.cancel();
};

// Chrome 은 발화 객체가 가비지 컬렉션되면 재생이 끊기거나 onend 가 오지 않으므로, 재생이 끝날 때까지 참조를 붙들어 둔다
let activeUtterance: SpeechSynthesisUtterance | null = null;

export const playJapaneseTTS = (text: string, onEnd?: () => void) => {
  if (!isSpeechSupported()) return;
  const synth = window.speechSynthesis;
  stopRemoteAudio();

  // 재생 중이던 음성이 있으면 끊고, Chrome 이 cancel 직후의 speak 를 무시하는 문제를 피하려고 잠깐 뒤에 재생한다
  const wasBusy = synth.speaking || synth.pending;
  synth.cancel();
  const token = ++currentToken;
  const utterance = new SpeechSynthesisUtterance(text);
  activeUtterance = utterance;
  utterance.lang = 'ja-JP';
  // lang 만 지정하면 브라우저가 엉뚱한 기본 음성을 고를 수 있어, 찾아 둔 일본어 음성을 직접 지정한다
  if (japaneseVoice) {
    try {
      utterance.voice = japaneseVoice;
    } catch {
      // 목록이 바뀌어 더 이상 유효하지 않은 음성이면 lang(ja-JP)만으로 재생한다
    }
  }
  utterance.rate = 0.9; // 입문자용 약간 느린 속도
  const done = () => {
    if (activeUtterance === utterance) activeUtterance = null;
    if (token === currentToken) onEnd?.();
  };
  utterance.onend = done;
  utterance.onerror = done;

  const start = () => {
    if (token !== currentToken) return; // 그 사이 다른 발화가 요청되었으면 건너뛴다
    synth.resume(); // 일시정지 상태로 멈춰 있는 엔진 깨우기
    synth.speak(utterance);
  };
  if (wasBusy) setTimeout(start, 60);
  else start();
};
