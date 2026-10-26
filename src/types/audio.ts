export interface SoundOptions {
  masterVolume?: number; // 0.0 ~ 1.0 (기본값: 0.8)
  enabled?: boolean; // 사운드 활성화 여부 (기본값: true)
}

export interface HandwritingSoundController {
  /** 포인터가 움직일 때마다 호출한다. 내부에서 40ms로 호출을 제한하고, 움직임이 멈추면 스스로 페이드아웃한다 */
  playBrushStroke: () => void;
  /** 포인터를 뗐을 때 호출: 마찰음을 즉시 페이드아웃한다 */
  stopBrushStroke: () => void;
  playSuccess: () => void;
  playFailure: () => void;
  /** 사용자 제스처(pointerdown 등) 안에서 호출해 AudioContext를 만들고 resume 한다 */
  unlockAudioContext: () => Promise<void>;
}
