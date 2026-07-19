// app/components/YesNoDodgeMobile.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import confetti from "canvas-confetti";

export default function YesNoDodgeMobile() {
  const stageRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  const pointerPos = useRef({ x: 0, y: 0 });

  const dodge = useCallback(() => {
    const stage = stageRef.current;
    const btn = noBtnRef.current;
    if (!stage || !btn) return;

    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;
    const pad = 10;

    let x = 0;
    let y = 0;
    let tries = 0;
    const minDist = 120;

    do {
      x = pad + Math.random() * (sw - bw - pad * 2);
      y = pad + Math.random() * (sh - bh - pad * 2);
      tries++;
    } while (
      Math.hypot(x - pointerPos.current.x, y - pointerPos.current.y) <
        minDist &&
      tries < 10
    );

    setNoPos({ x, y });
  }, []);

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
        position: "relative",
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
        style={{
          position: "relative",
          height: 220,
          border: "1px solid #e5e5e5",
          borderRadius: 12,
          overflow: "hidden",
          touchAction: "none",
        }}
        onTouchMove={(e) => {
          const rect = stageRef.current!.getBoundingClientRect();
          const t = e.touches[0];
          pointerPos.current = {
            x: t.clientX - rect.left,
            y: t.clientY - rect.top,
          };
        }}
        onMouseMove={(e) => {
          const rect = stageRef.current!.getBoundingClientRect();
          pointerPos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          };
        }}
      >
        <button
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
            touchAction: "manipulation",
          }}
        >
          Yes
        </button>

        <button
          ref={noBtnRef}
          onPointerEnter={dodge}
          onTouchStart={(e) => {
            e.preventDefault();
            dodge();
          }}
          onMouseDown={(e) => e.preventDefault()}
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
            pointerEvents: "auto",
            touchAction: "none",
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
