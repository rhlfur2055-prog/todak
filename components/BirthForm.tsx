"use client";

import { useState } from "react";
import type { BirthInput, Gender } from "@/lib/saju/engine";

export interface BirthFormValue extends BirthInput {
  calendar: "solar" | "lunar";
  isLeapMonth?: boolean;
  name?: string;
}

export function BirthForm({
  initial,
  onSubmit,
}: {
  initial?: Partial<BirthFormValue>;
  onSubmit: (v: BirthFormValue) => void;
}) {
  const now = new Date();
  const [name, setName] = useState(initial?.name ?? "");
  const [year, setYear] = useState(initial?.year ?? 1995);
  const [month, setMonth] = useState(initial?.month ?? 1);
  const [day, setDay] = useState(initial?.day ?? 1);
  const [hour, setHour] = useState(initial?.hour ?? 12);
  const [minute, setMinute] = useState(initial?.minute ?? 0);
  const [hourUnknown, setHourUnknown] = useState(initial?.hourUnknown ?? false);
  const [gender, setGender] = useState<Gender>(initial?.gender ?? "여");
  const [calendar, setCalendar] = useState<"solar" | "lunar">(initial?.calendar ?? "solar");
  const [isLeapMonth, setIsLeapMonth] = useState(initial?.isLeapMonth ?? false);
  const [error, setError] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (year < 1900 || year > now.getFullYear()) {
      setError("연도를 1900년 이후로 확인해 주세요.");
      return;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) {
      setError("월/일을 확인해 주세요.");
      return;
    }
    setError("");
    onSubmit({
      name: name.trim() || undefined,
      year,
      month,
      day,
      hour: hourUnknown ? undefined : hour,
      minute: hourUnknown ? undefined : minute,
      hourUnknown,
      gender,
      calendar,
      isLeapMonth: calendar === "lunar" ? isLeapMonth : undefined,
    });
  }

  const numField = (
    v: number,
    set: (n: number) => void,
    min: number,
    max: number,
    label: string,
    suffix: string,
  ) => (
    <label className="block">
      <span className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <div className="flex items-center gap-1.5">
        <input
          type="number"
          className="field"
          value={v}
          min={min}
          max={max}
          onChange={(e) => set(Number(e.target.value))}
        />
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {suffix}
        </span>
      </div>
    </label>
  );

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>
          이름 (선택 · 저장용)
        </span>
        <input
          className="field"
          placeholder="나, 또는 가족·친구 이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setCalendar("solar")}
          className={`flex-1 rounded-xl border px-3 py-2 text-sm ${calendar === "solar" ? "font-medium" : ""}`}
          style={calendar === "solar" ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)" } : {}}
        >
          양력
        </button>
        <button
          type="button"
          onClick={() => setCalendar("lunar")}
          className={`flex-1 rounded-xl border px-3 py-2 text-sm ${calendar === "lunar" ? "font-medium" : ""}`}
          style={calendar === "lunar" ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)" } : {}}
        >
          음력
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {numField(year, setYear, 1900, now.getFullYear(), "연", "년")}
        {numField(month, setMonth, 1, 12, "월", "월")}
        {numField(day, setDay, 1, 31, "일", "일")}
      </div>

      {calendar === "lunar" && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isLeapMonth}
            onChange={(e) => setIsLeapMonth(e.target.checked)}
          />
          윤달이에요
        </label>
      )}

      <div>
        <label className="mb-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={hourUnknown}
            onChange={(e) => setHourUnknown(e.target.checked)}
          />
          태어난 시를 몰라요 (시주 없이 계산)
        </label>
        {!hourUnknown && (
          <div className="grid grid-cols-2 gap-2">
            {numField(hour, setHour, 0, 23, "시 (0~23)", "시")}
            {numField(minute, setMinute, 0, 59, "분", "분")}
          </div>
        )}
      </div>

      <div>
        <span className="mb-1 block text-xs" style={{ color: "var(--muted)" }}>
          성별 (대운 방향 계산에 사용)
        </span>
        <div className="flex gap-2">
          {(["여", "남"] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 rounded-xl border px-3 py-2 text-sm ${gender === g ? "font-medium" : ""}`}
              style={gender === g ? { borderColor: "#7c9a6e", backgroundColor: "var(--line)" } : {}}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button type="submit" className="btn-primary w-full">
        내 운세 곡선 보기
      </button>
      <p className="text-center text-xs" style={{ color: "var(--muted)" }}>
        입력값은 이 브라우저에만 저장돼요. 외부로 보내지 않아요.
      </p>
    </form>
  );
}
