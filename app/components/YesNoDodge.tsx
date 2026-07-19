// app/components/YesNoDodgeMobile.tsx
"use client";

import { useRef, useState, useCallback } from "react";
import confetti from "canvas-confetti";

export default function YesNoDodgeMobile() {
  const stageRef = useRef<HTMLDivElement>(null);
  const noBtnRef = useRef<HTMLButtonElement>(null);
  const [noPos, setNoPos] = useState<{ x: number; y: number } | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);

  const isDodging = useRef(false); // защита от повторных вызовов на каждый touchmove

  const dodge = useCallback((pointerX: number, pointerY: number) => {
    const stage = stageRef.current;
    const btn = noBtnRef.current;
    if (!stage || !btn) return;

    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const bw = btn.offsetWidth;
    const bh = btn.offsetHeight;
    const pad = 10;
    const minDist = 120;

    let x = 0;
    let y = 0;
    let tries = 0;

    do {
      x = pad + Math.random() * (sw - bw - pad * 2);
      y = pad + Math.random() * (sh - bh - pad * 2);
      tries++;
    } while (
      Math.hypot(x + bw / 2 - pointerX, y + bh / 2 - pointerY) < minDist &&
      tries < 10
    );

    setNoPos({ x, y });
  }, []);

  // главное изменение: слушаем движение пальца по ВСЕЙ области,
  // а не касание конкретно кнопки
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
    const triggerRadius = 70; // палец активирует убегание, не долетая до кнопки

    if (distance < triggerRadius && !isDodging.current) {
      isDodging.current = true;
      dodge(px, py);
      setTimeout(() => {
        isDodging.current = false;
      }, 150); // короткий кулдаун, чтобы не дёргалась на каждый touchmove-тик
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
        Go data?
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
          touchAction: "none", // блокирует скролл страницы во время слежения за пальцем
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
          }}
        >
          Yes
        </button>

        <button
          ref={noBtnRef}
          // клик всё равно заблокирован на случай если палец каким-то образом попадёт
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
            pointerEvents: "none", // палец физически не может "нажать" на неё
          }}
        >
          No
        </button>
      </div>

      {answer && (
        <p style={{ marginTop: 14, fontSize: 14, color: "#666" }}>
          Выбрано: {answer}
        </p>
      )}
    </div>
  );
}
