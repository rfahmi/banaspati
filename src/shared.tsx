import { useEffect, useState, useRef } from "react";

/** The nine available mood expressions. Controls eye shape. */
export type AvatarMood =
  | "idle"
  | "happy"
  | "surprised"
  | "sleepy"
  | "excited"
  | "suspicious"
  | "angry"
  | "sad"
  | "thinking";

const GLITCH_CHARS = "!<>-_\\\\/[]{}—=+*^?#_";

export function useTypewriter(text: string, speed: number = 50, triggerKey?: string | number) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    if (!text) return;

    let i = 0;
    const interval = setInterval(() => {
      // Pre-increment so we don't wait an extra tick for the first character
      i++;
      setDisplayed(text.substring(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, triggerKey]);

  return { displayed, done };
}

export function GlitchText({ text, done }: { text: string; done: boolean }) {
  const [, setGlitchTrigger] = useState(0);
  const textRef = useRef(text);

  useEffect(() => {
    textRef.current = text;
  }, [text]);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setGlitchTrigger((t) => t + 1);
    }, 60);
    return () => clearInterval(interval);
  }, [done]);

  if (done) return <>{text}</>;

  // Compute the glitched text during render so it always matches current text length!
  const glitched = text.split("").map((ch) => {
    if (ch === " " || ch === "\n") return ch;
    return Math.random() < 0.12 ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)] : ch;
  }).join("");

  return <>{glitched}</>;
}

export interface FloatingTextProps {
  message?: string;
  speechKey?: string | number;
  scaleFactor: number;
  fontSize: number;
  disappearDelay: number;
  containerHeight: number;
}

export function FloatingText({ message, speechKey, scaleFactor, fontSize, disappearDelay, containerHeight }: FloatingTextProps) {
  const { displayed, done } = useTypewriter(message || "", 40, speechKey);
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  const scaledFontSize = Math.max(10, fontSize * scaleFactor);
  const scaledCursorWidth = Math.max(6, (fontSize * 0.6) * scaleFactor);
  const scaledCursorHeight = Math.max(10, fontSize * scaleFactor);

  const lineHeight = 1.65;
  const lineHeightPx = scaledFontSize * lineHeight;
  const maxHeightThreshold = lineHeightPx * 3;

  useEffect(() => {
    setVisible(true);
    setFading(false);
    if (!message) return;
    const hold = message.length * 40 + disappearDelay;
    const t1 = setTimeout(() => setFading(true), hold);
    const t2 = setTimeout(() => setVisible(false), hold + 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [message, speechKey, disappearDelay]);

  if (!visible || !message) return null;

  return (
    <div
      style={{
        width: "100%",
        maxHeight: `${maxHeightThreshold}px`,
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        marginBottom: `${-48 * scaleFactor}px`,
        whiteSpace: "pre-wrap",
        wordBreak: "break-word",
        maxWidth: `${containerHeight * 1.5}px`,
        textAlign: "center",
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: `${scaledFontSize}px`,
        letterSpacing: "0.08em",
        lineHeight: "1.65",
        color: "#7effd4",
        textShadow: "0 0 8px #3fffc0, 0 0 22px #00ffaa55",
        pointerEvents: "none",
        userSelect: "none",
        opacity: fading ? 0 : 1,
        transition: "opacity 0.7s ease",
        zIndex: 20,
      }}
    >
      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <GlitchText text={displayed} done={done} />
        {!done && (
          <span style={{
            display: "inline-block",
            width: `${scaledCursorWidth}px`,
            height: `${scaledCursorHeight}px`,
            background: "#7effd4",
            boxShadow: "0 0 6px #3fffc0",
            animation: "ba-blink 0.7s step-end infinite",
            marginLeft: `${2 * scaleFactor}px`,
            verticalAlign: "middle",
          }} />
        )}

        <div style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,170,0.03) 2px, rgba(0,255,170,0.03) 4px)",
          pointerEvents: "none",
        }} />
      </div>
    </div>
  );
}
