// 관상·손 모양 — 온디바이스 분석 (기획서 4.3)
//
// 원칙(타협 없음):
//  - 사진은 브라우저 밖으로 절대 나가지 않는다. MediaPipe가 기기 안에서만 처리.
//  - 외모 평가가 아니다. 점수·등급 없음. 부정적 단정 없음. 항상 따뜻하고 "재미" 라벨.
//  - 손금(손바닥 주름)은 랜드마크로 정확히 읽을 수 없으므로 "손 모양" 기반 재미 해석으로 정직하게 표기.
//
// 구현: @mediapipe/tasks-vision (Face/Hand Landmarker). WASM·모델은 CDN에서 받지만
//       입력 이미지는 전송되지 않는다(클라이언트 detect).

export interface LM { x: number; y: number; z?: number }

const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
const HAND_MODEL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

// 모듈 로딩은 무겁고 한 번이면 충분하므로 캐시.
let _vision: any;
let _face: any;
let _hand: any;

async function fileset() {
  const mod = await import("@mediapipe/tasks-vision");
  if (!_vision) _vision = await mod.FilesetResolver.forVisionTasks(WASM_BASE);
  return { mod, vision: _vision };
}

export async function getFaceLandmarker() {
  if (_face) return _face;
  const { mod, vision } = await fileset();
  _face = await mod.FaceLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: FACE_MODEL, delegate: "GPU" },
    runningMode: "IMAGE",
    numFaces: 1,
  });
  return _face;
}

export async function getHandLandmarker() {
  if (_hand) return _hand;
  const { mod, vision } = await fileset();
  _hand = await mod.HandLandmarker.createFromOptions(vision, {
    baseOptions: { modelAssetPath: HAND_MODEL, delegate: "GPU" },
    runningMode: "IMAGE",
    numHands: 1,
  });
  return _hand;
}

// ── 기하 유틸 (정규화 좌표를 픽셀로 환산해 등방성 확보) ──────────────────
function dist(a: LM, b: LM, w: number, h: number) {
  const dx = (a.x - b.x) * w;
  const dy = (a.y - b.y) * h;
  return Math.hypot(dx, dy);
}

// ── 관상 해석 ────────────────────────────────────────────────────────
export interface ReadingResult {
  keyword: string; // 인상 키워드
  traits: string[]; // 따뜻한 강점 3가지
  line: string; // 다정한 한 줄
}

// 얼굴 468 랜드마크 → 비율 → 따뜻한 인상 해석. 점수/등급 없음.
export function readFace(lm: LM[], w: number, h: number): ReadingResult {
  const faceW = dist(lm[234], lm[454], w, h); // 광대~광대
  const faceH = dist(lm[10], lm[152], w, h); // 이마 위~턱
  const eyeGap = dist(lm[133], lm[362], w, h); // 양 눈 안쪽 간격
  const mouthW = dist(lm[61], lm[291], w, h); // 입 너비
  const ratio = faceH / Math.max(faceW, 1); // 세로/가로
  const eyeRel = eyeGap / Math.max(faceW, 1); // 눈 사이 / 얼굴폭
  const mouthRel = mouthW / Math.max(faceW, 1); // 입 / 얼굴폭

  let keyword: string;
  const traits: string[] = [];

  if (ratio >= 1.42) {
    keyword = "사려 깊은 인상";
    traits.push("생각을 한 박자 묵혔다가 꺼내는 신중함");
    traits.push("길게 보는 눈 — 당장보다 멀리를 본다");
  } else if (ratio <= 1.18) {
    keyword = "포근한 인상";
    traits.push("사람을 편하게 만드는 친화력");
    traits.push("주변을 잘 챙기는 따뜻함");
  } else {
    keyword = "균형 잡힌 인상";
    traits.push("감정과 이성의 가운데를 잘 잡는 편");
    traits.push("어디서든 무난하게 섞이는 적응력");
  }

  if (eyeRel >= 0.46) traits.push("시야가 넓어 큰 그림을 잘 보는 사람");
  else if (eyeRel <= 0.40) traits.push("한곳에 집중하면 끝을 보는 몰입력");
  else traits.push("디테일과 전체를 번갈아 보는 균형감");

  if (mouthRel >= 0.50) traits.push("말과 표현으로 사람을 끌어당기는 힘");

  const line =
    "관상은 외모 평가가 아니라, 인상에 묻어나는 결을 읽는 옛 놀이예요. 오늘의 당신 표정엔 위의 결이 비쳤어요 — 물론, 재미로요.";

  return { keyword, traits: traits.slice(0, 3), line };
}

// 손 21 랜드마크 → 손 모양 비율 → 따뜻한 해석 (손금 아님, 정직 표기)
export function readHand(lm: LM[], w: number, h: number): ReadingResult {
  const palmLen = dist(lm[0], lm[9], w, h); // 손목~중지 밑동
  const palmW = dist(lm[5], lm[17], w, h); // 검지~새끼 밑동
  const indexLen = dist(lm[5], lm[8], w, h); // 검지 길이
  const ringLen = dist(lm[13], lm[16], w, h); // 약지 길이
  const shape = palmLen / Math.max(palmW, 1); // 손바닥 세로/가로
  const idRing = indexLen / Math.max(ringLen, 1); // 검지/약지

  let keyword: string;
  const traits: string[] = [];

  if (shape >= 1.25) {
    keyword = "섬세한 손";
    traits.push("작은 결을 알아채는 감수성");
    traits.push("정성 들여 다듬는 걸 좋아하는 손끝");
  } else if (shape <= 1.05) {
    keyword = "단단한 손";
    traits.push("생각보다 실행이 빠른 추진력");
    traits.push("필요할 때 든든하게 받쳐주는 힘");
  } else {
    keyword = "고른 손";
    traits.push("머리와 손이 같이 움직이는 실용 감각");
    traits.push("벌이는 것과 마무리의 균형");
  }

  if (idRing >= 1.0) traits.push("앞에 나서 이끄는 걸 마다하지 않는 기질");
  else traits.push("뒤에서 판을 단단히 받치는 기질");

  const line =
    "이건 손금(손바닥 주름)이 아니라 손 모양의 비율로 보는 재미 해석이에요. 손금은 사진만으로 정확히 못 읽어서, 정직하게 ‘손 모양’으로만 봤어요.";

  return { keyword, traits: traits.slice(0, 3), line };
}

// 카메라 거부 시 대체용 자가 문답 (사진 없이도 재미를 잇는다)
export interface SelfQItem { q: string; a: { label: string; key: string }[] }
export const SELF_Q: SelfQItem[] = [
  {
    q: "처음 보는 자리에서 나는?",
    a: [
      { label: "먼저 말을 건다", key: "warm" },
      { label: "분위기를 먼저 살핀다", key: "deep" },
      { label: "상황에 맞춰 간다", key: "balance" },
    ],
  },
  {
    q: "일이 주어지면?",
    a: [
      { label: "일단 시작하고 본다", key: "solid" },
      { label: "계획을 먼저 세운다", key: "deep" },
      { label: "사람부터 챙긴다", key: "warm" },
    ],
  },
  {
    q: "쉴 때 더 끌리는 쪽은?",
    a: [
      { label: "사람들과 어울리기", key: "warm" },
      { label: "혼자 몰입하기", key: "deep" },
      { label: "그날그날 다르게", key: "balance" },
    ],
  },
];

export function readSelfQ(keys: string[]): ReadingResult {
  const count: Record<string, number> = {};
  keys.forEach((k) => (count[k] = (count[k] || 0) + 1));
  const top = Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "balance";
  const map: Record<string, ReadingResult> = {
    warm: {
      keyword: "포근한 사람",
      traits: ["사람을 편하게 만드는 친화력", "주변을 먼저 챙기는 따뜻함", "분위기를 데우는 힘"],
      line: "사진 없이 문답으로 본 결이에요. 재미로 봐주세요.",
    },
    deep: {
      keyword: "사려 깊은 사람",
      traits: ["멀리 보고 신중하게 정하는 편", "한번 빠지면 끝을 보는 몰입", "조용한 책임감"],
      line: "사진 없이 문답으로 본 결이에요. 재미로 봐주세요.",
    },
    solid: {
      keyword: "단단한 사람",
      traits: ["생각보다 실행이 빠른 추진력", "든든하게 받쳐주는 힘", "맺고 끊음이 분명함"],
      line: "사진 없이 문답으로 본 결이에요. 재미로 봐주세요.",
    },
    balance: {
      keyword: "균형 잡힌 사람",
      traits: ["상황에 잘 맞추는 적응력", "감정과 이성의 가운데", "어디서든 무난히 섞임"],
      line: "사진 없이 문답으로 본 결이에요. 재미로 봐주세요.",
    },
  };
  return map[top] ?? map.balance;
}
