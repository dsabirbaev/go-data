// app/components/YesNoDodgeMobile.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import confetti from "canvas-confetti";

export default function YesNoDodgeMobile() {
  const stageRef = useRef<HTMLDivElement>(null);
  const yesBtnRef = useRef<HTMLButtonElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  const isDodging = useRef(false);

  const dodge = useCallback((pointerX: number, pointerY: number) => {
    const stage = stageRef.current;
    const btn = noBtnRef.current;
    const yesBtn = yesBtnRef.current;
    if (!stage || !btn || !yesBtn) return;

    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;
    const pad = 10;
    const minDistFromPointer = 120;

    // зона Yes-кнопки для исключения коллизий
    const yesRect = yesBtn.getBoundingClientRect();
    const stageRect = stage.getBoundingClientRect();
    const yesLeft = yesRect.left - stageRect.left;
    const yesTop = yesRect.top - stageRect.top;
    const yesRight = yesLeft + yesRect.width;
    const yesBottom = yesTop + yesRect.height;
    const safetyMargin = 16; // дополнительный буфер вокруг Yes

    let x = 0;
    let y = 0;
    let tries = 0;
    let valid = false;

    while (!valid && tries < 30) {
      x = pad + Math.random() * (sw - bw - pad * 2);
      y = pad + Math.random() * (sh - bh - pad * 2);
      tries++;

      const noRight = x + bw;
      const noBottom = y + bh;

      // проверка пересечения прямоугольников No и Yes (с буфером)
      const overlapsYes =
        x < yesRight + safetyMargin &&
        noRight > yesLeft - safetyMargin &&
        y < yesBottom + safetyMargin &&
        noBottom > yesTop - safetyMargin;

      const tooCloseToPointer =
        Math.hypot(x + bw / 2 - pointerX, y + bh / 2 - pointerY) <
        minDistFromPointer;

      if (!overlapsYes && !tooCloseToPointer) {
        valid = true;
      }
    }

    setNoPos({ x, y });
  }, []);

  const handleAreaTouchMove = (e: React.TouchEvent) => {
    const stage = stageRef.current;
    const btn = noBtnRef.current;
    if (!stage || !btn) return;

    const rect = stage.getBoundingClientRect();
    const t = e.touches[0];
    const px = t.clientX - rect.left;
    const py = t.clientY - rect.top;

    const btnRect = btn.getBoundingClientRect();
    const bx = btnRect.left - rect.left + btnRect.width / 2;
    const by = btnRect.top - rect.top + btnRect.height / 2;

    const distance = Math.hypot(px - bx, py - by);
    const triggerRadius = 70;

    if (distance < triggerRadius && !isDodging.current) {
      isDodging.current = true;
      dodge(px, py);
      setTimeout(() => {
        isDodging.current = false;
      }, 150);
    }
  };

  const handleAreaMouseMove = (e: React.MouseEvent) => {
    const stage = stageRef.current;
    const btn = noBtnRef.current;
    if (!stage || !btn) return;

    const rect = stage.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const btnRect = btn.getBoundingClientRect();
    const bx = btnRect.left - rect.left + btnRect.width / 2;
    const by = btnRect.top - rect.top + btnRect.height / 2;

    const distance = Math.hypot(px - bx, py - by);
    const triggerRadius = 70;

    if (distance < triggerRadius && !isDodging.current) {
      isDodging.current = true;
      dodge(px, py);
      setTimeout(() => {
        isDodging.current = false;
      }, 150);
    }
  };

  const handleYes = () => {
    setAnswer("yes");
    confetti({
      particleCount: 150,
      spread: 90,
      origin: { y: 0.6 },
    });
  };

  return (
    <div
      style={{
        maxWidth: 360,
        margin: "0 auto",
        padding: "0 16px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          fontSize: 17,
          fontWeight: 500,
          marginBottom: 20,
          lineHeight: 1.4,
        }}
      >
        Can we talk?
      </p>

      <div
        ref={stageRef}
        onTouchMove={handleAreaTouchMove}
        onMouseMove={handleAreaMouseMove}
        style={{
          position: "relative",
          height: 220,
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          overflow: "hidden",
          touchAction: "none",
        }}
      >
        <button
          ref={yesBtnRef}
          onClick={handleYes}
          style={{
            position: "absolute",
            left: "30%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            padding: "14px 26px",
            borderRadius: 10,
            border: "none",
            background: "#2563eb",
            color: "#fff",
            fontSize: 16,
            fontWeight: 500,
            minWidth: 88,
            cursor: "pointer",
          }}
        >
          Yes
        </button>

        <button
          ref={noBtnRef}
          onClick={(e) => e.preventDefault()}
          style={{
            position: "absolute",
            left: noPos ? noPos.x : "70%",
            top: noPos ? noPos.y : "50%",
            transform: noPos ? "none" : "translate(-50%, -50%)",
            padding: "14px 26px",
            borderRadius: 10,
            border: "1px solid #d4d4d4",
            background: "transparent",
            fontSize: 16,
            fontWeight: 500,
            minWidth: 88,
            pointerEvents: "none",
          }}
        >
          No
        </button>
      </div>

      {answer && (
        <p style={{ marginTop: 14, fontSize: 24, color: "#666" }}>
          You said: {answer}
        </p>
      )}
    </div>
  );
}
