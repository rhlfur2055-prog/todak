"use client";

import { useRef, useState } from "react";
import {
  getFaceLandmarker,
  getHandLandmarker,
  readFace,
  readHand,
  readSelfQ,
  SELF_Q,
  type ReadingResult,
} from "@/lib/face/vision";
import { saveFace, saveHand } from "@/lib/store/results";
import { FunLabel } from "./Disclaimer";

type Mode = "face" | "hand";
type Status = "idle" | "loading" | "done" | "error" | "qa";

export function FaceReading() {
  const [mode, setMode] = useState<Mode>("face");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function pick(capture: boolean) {
    const el = fileRef.current;
    if (!el) return;
    if (capture) el.setAttribute("capture", mode === "face" ? "user" : "environment");
    else el.removeAttribute("capture");
    el.click();
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setStatus("loading");
    setErrMsg("");
    setResult(null);
    try {
      const img = await loadImage(url);
      if (mode === "face") {
        const lm = await getFaceLandmarker();
        const res = lm.detect(img);
        const pts = res.faceLandmarks?.[0];
        if (!pts || pts.length < 400) throw new Error("얼굴을 또렷이 못 찾았어요. 정면·밝은 곳에서 다시 해볼까요?");
        const r = readFace(pts, img.naturalWidth, img.naturalHeight);
        setResult(r);
        saveFace(r);
      } else {
        const lm = await getHandLandmarker();
        const res = lm.detect(img);
        const pts = res.landmarks?.[0];
        if (!pts || pts.length < 21) throw new Error("손을 또렷이 못 찾았어요. 손바닥을 펴서 화면에 가득 담아볼까요?");
        const r = readHand(pts, img.naturalWidth, img.naturalHeight);
        setResult(r);
        saveHand(r);
      }
      setStatus("done");
    } catch (err: any) {
      setErrMsg(err?.message || "분석 중 문제가 생겼어요. 잠시 후 다시 시도하거나, 문답으로 봐주세요.");
      setStatus("error");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function reset() {
    setStatus("idle");
    setResult(null);
    setPreview(null);
    setErrMsg("");
  }

  return (
    <div className="space-y-4">
      {/* 모드 탭 */}
      <div className="flex gap-2">
        {(["face", "hand"] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => { setMode(m); reset(); }}
            className={`flex-1 rounded-xl border px-3 py-2 text-sm ${mode === m ? "font-medium" : ""}`}
            style={mode === m ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)" } : {}}
          >
            {m === "face" ? "관상 (얼굴)" : "손 모양"}
          </button>
        ))}
      </div>

      {/* 프라이버시 배지 */}
      <div className="flex items-center justify-between gap-2 rounded-xl border p-3" style={{ borderColor: "#A9BE9E" }}>
        <p className="text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
          🔒 사진은 <b style={{ color: "var(--fg)" }}>이 기기 안에서만</b> 분석돼요. 서버로 업로드하지 않고, 저장도 안 해요.
        </p>
        <FunLabel text="재미로" />
      </div>

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />

      {status === "idle" && (
        <div className="space-y-2">
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {mode === "face"
              ? "정면 셀카를 찍거나 사진을 올리면, 인상의 결을 따뜻하게 읽어드려요. 외모 평가가 아니에요."
              : "손바닥을 펴서 찍거나 올리면, 손 모양의 비율로 재미 해석을 해드려요. (손금이 아니라 손 모양 기반)"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => pick(true)} className="btn-primary">
              {mode === "face" ? "셀카 찍기" : "손 찍기"}
            </button>
            <button onClick={() => pick(false)} className="btn-ghost">
              사진 올리기
            </button>
          </div>
          <button onClick={() => setStatus("qa")} className="w-full text-center text-xs underline" style={{ color: "var(--muted)" }}>
            카메라 없이 · 문답으로 보기
          </button>
        </div>
      )}

      {status === "loading" && (
        <div className="flex items-center gap-3 rounded-xl border p-4 text-sm" style={{ borderColor: "var(--line)" }}>
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          기기 안에서 분석하는 중… (처음 한 번은 모델을 받느라 잠깐 걸려요)
        </div>
      )}

      {status === "error" && (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: "#C07F55" }}>{errMsg}</p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={reset} className="btn-ghost">다시 찍기</button>
            <button onClick={() => setStatus("qa")} className="btn-ghost">문답으로 보기</button>
          </div>
        </div>
      )}

      {status === "qa" && <SelfQA mode={mode} onReset={reset} />}

      {status === "done" && result && (
        <div className="space-y-4 fade-up">
          {preview && (
            <img
              src={preview}
              alt="분석한 사진 (기기 안에서만)"
              className="mx-auto max-h-48 rounded-xl object-cover"
            />
          )}
          <ReadingView r={result} />
          <button onClick={reset} className="btn-ghost">다른 사진으로 다시</button>
        </div>
      )}
    </div>
  );
}

function ReadingView({ r }: { r: ReadingResult }) {
  return (
    <div className="rounded-xl border p-4" style={{ borderColor: "var(--line)" }}>
      <p className="text-lg font-semibold">{r.keyword}</p>
      <ul className="mt-2 space-y-1.5 text-sm">
        {r.traits.map((t, i) => (
          <li key={i} className="flex gap-2">
            <span style={{ color: "#7c9a6e" }}>·</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--muted)" }}>
        {r.line}
      </p>
    </div>
  );
}

// 카메라 없이 자가 문답
function SelfQA({ mode, onReset }: { mode: Mode; onReset: () => void }) {
  const [keys, setKeys] = useState<string[]>([]);
  const [done, setDone] = useState<ReadingResult | null>(null);
  const i = keys.length;

  function choose(key: string) {
    const next = [...keys, key];
    if (next.length === SELF_Q.length) {
      const r = readSelfQ(next);
      setDone(r);
      if (mode === "face") saveFace(r);
      else saveHand(r);
    }
    setKeys(next);
  }

  if (done) {
    return (
      <div className="space-y-4 fade-up">
        <ReadingView r={done} />
        <button onClick={onReset} className="btn-ghost">처음으로</button>
      </div>
    );
  }

  const cur = SELF_Q[i];
  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "var(--muted)" }}>{i + 1} / {SELF_Q.length}</p>
      <p className="text-base font-medium">{cur.q}</p>
      <div className="space-y-2">
        {cur.a.map((opt) => (
          <button key={opt.label} onClick={() => choose(opt.key)} className="btn-ghost w-full text-left">
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("사진을 불러오지 못했어요."));
    img.src = src;
  });
}
