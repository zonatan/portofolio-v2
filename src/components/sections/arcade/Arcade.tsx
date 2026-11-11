"use client";

import { Gamepad2, Pause, Play, RotateCcw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/components/providers/LanguageProvider";
import { Button } from "@/components/ui/Button";
import { CornerBrackets } from "@/components/ui/CornerBrackets";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { EASE } from "@/lib/motion";
import { cn, pad2 } from "@/lib/utils";
import { createGame, type Game } from "./engine";

const HI_KEY = "zs-arcade-hi";
type Status = "ready" | "playing" | "paused" | "over";

function readHi() {
  try {
    return Number(localStorage.getItem(HI_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function Arcade() {
  const { t } = useI18n();
  const a = t.arcade;
  const reduced = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const scoreRef = useRef<HTMLSpanElement>(null);
  const waveRef = useRef<HTMLSpanElement>(null);
  const livesRef = useRef<HTMLSpanElement>(null);
  const [status, setStatusState] = useState<Status>("ready");
  const [final, setFinal] = useState({ score: 0, best: 0, record: false });
  const statusRef = useRef<Status>("ready");
  const setStatus = useCallback((s: Status) => {
    statusRef.current = s;
    setStatusState(s);
  }, []);
  const togglePause = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    if (statusRef.current === "playing") {
      g.pause();
      setStatus("paused");
    } else if (statusRef.current === "paused") {
      g.resume();
      setStatus("playing");
    }
  }, [setStatus]);

  // Buat engine sekali
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = createGame(
      canvas,
      {
        // HUD diperbarui langsung lewat ref (tanpa re-render tiap frame)
        onHud: (score, wave, lives) => {
          if (scoreRef.current) scoreRef.current.textContent = String(score).padStart(5, "0");
          if (waveRef.current) waveRef.current.textContent = pad2(wave);
          if (livesRef.current)
            livesRef.current.textContent =
              "■".repeat(Math.max(0, lives)) + "□".repeat(Math.max(0, 3 - lives));
        },
        onOver: (score) => {
          const prev = readHi();
          const record = score > prev;
          if (record) {
            try {
              localStorage.setItem(HI_KEY, String(score));
            } catch {
              /* abaikan */
            }
          }
          setFinal({ score, best: Math.max(prev, score), record });
          setStatus("over");
        },
      },
      { reduced },
    );
    gameRef.current = game;
    const ro = new ResizeObserver(() => game.resize());
    ro.observe(canvas);
    return () => {
      ro.disconnect();
      game.destroy();
      gameRef.current = null;
    };
  }, [reduced, setStatus]);

  // Jeda otomatis saat game keluar layar atau tab disembunyikan
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const pause = () => {
      if (statusRef.current === "playing") {
        gameRef.current?.pause();
        setStatus("paused");
      }
    };
    const io = new IntersectionObserver(([e]) => !e.isIntersecting && pause(), { threshold: 0.25 });
    io.observe(el);
    const onVis = () => document.hidden && pause();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [setStatus]);

  // Keyboard (hanya aktif saat bermain)
  useEffect(() => {
    if (status !== "playing" && status !== "paused") return;
    const map: Record<string, "left" | "right"> = {
      ArrowLeft: "left",
      a: "left",
      A: "left",
      ArrowRight: "right",
      d: "right",
      D: "right",
    };
    const down = (e: KeyboardEvent) => {
      if (map[e.key]) {
        e.preventDefault();
        gameRef.current?.setKey(map[e.key], true);
      } else if (e.key === "p" || e.key === "P" || e.key === "Escape") {
        e.preventDefault();
        togglePause();
      } else if (e.key === " " && statusRef.current === "paused") {
        e.preventDefault();
        togglePause();
      }
    };
    const up = (e: KeyboardEvent) => map[e.key] && gameRef.current?.setKey(map[e.key], false);
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [status, togglePause]);

  const start = () => {
    gameRef.current?.start();
    setStatus("playing");
    wrapRef.current?.focus({ preventScroll: true });
  };

  const onPointer = (e: React.PointerEvent) => {
    if (statusRef.current === "playing") gameRef.current?.setTargetFromClient(e.clientX);
  };

  const best = status === "over" ? final.best : 0;

  return (
    <Section id="arcade" bgWord={a.bg} className="pb-28 md:pb-32">
      <SectionHeading id="arcade" label={a.label} lines={a.title} intro={a.intro} />

      <Reveal>
        <div className="hud-panel clip-corner relative p-2 sm:p-3">
          {/* HUD atas */}
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-3 py-2.5 font-mono text-xs tracking-[0.18em] uppercase sm:px-4">
            <span className="text-lime flex items-center gap-2 font-semibold">
              <Gamepad2 size={15} aria-hidden /> {a.game}
            </span>
            <div className="text-ink-2 flex flex-wrap items-center gap-x-5 gap-y-1" aria-live="off">
              <span>
                {a.score}{" "}
                <span ref={scoreRef} className="text-ink tabular-nums">
                  00000
                </span>
              </span>
              <span>
                {a.wave}{" "}
                <span ref={waveRef} className="text-ink tabular-nums">
                  01
                </span>
              </span>
              <span>
                {a.lives}{" "}
                <span ref={livesRef} className="text-lime tracking-normal">
                  ■■■
                </span>
              </span>
              {(status === "playing" || status === "paused") && (
                <button
                  type="button"
                  onClick={togglePause}
                  className="text-ink-2 hover:text-lime flex items-center gap-1.5 transition-colors"
                >
                  {status === "playing" ? (
                    <Pause size={13} aria-hidden />
                  ) : (
                    <Play size={13} aria-hidden />
                  )}
                  {status === "playing" ? a.paused : a.resume}
                </button>
              )}
            </div>
          </div>

          {/* Area game */}
          <div
            ref={wrapRef}
            tabIndex={-1}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            data-lenis-prevent-touch
            className={cn(
              "clip-corner relative aspect-[3/4] max-h-[78svh] w-full overflow-hidden outline-none sm:aspect-[16/9] sm:max-h-[70svh]",
              status === "playing" && "cursor-crosshair touch-none",
            )}
          >
            <canvas
              ref={canvasRef}
              role="img"
              aria-label={a.canvasLabel}
              className="block h-full w-full"
            />
            <CornerBrackets size="h-6 w-6" color="border-lime/70" className="m-2" />

            <AnimatePresence>
              {status !== "playing" && (
                <motion.div
                  key={status}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="bg-abyss/70 absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center backdrop-blur-[2px]"
                >
                  {status === "ready" && (
                    <>
                      <p className="hud-label text-lime mb-3">
                        {a.label} {"//"} 06
                      </p>
                      <p className="font-display text-6xl leading-none font-bold uppercase sm:text-8xl">
                        BUG <span className="text-violet-soft">HUNTER</span>
                      </p>
                      <ul className="text-ink-2 mt-5 space-y-1 text-sm">
                        {a.help.map((h) => (
                          <li key={h}>{h}</li>
                        ))}
                      </ul>
                      <div className="mt-7">
                        <Button onClick={start}>
                          <Play size={15} aria-hidden />
                          {a.start}
                        </Button>
                      </div>
                    </>
                  )}

                  {status === "paused" && (
                    <>
                      <p className="font-display text-6xl font-bold uppercase">{a.paused}</p>
                      <div className="mt-6">
                        <Button onClick={togglePause}>
                          <Play size={15} aria-hidden />
                          {a.resume}
                        </Button>
                      </div>
                    </>
                  )}

                  {status === "over" && (
                    <div role="status">
                      <p className="hud-label text-magenta mb-2">GAME OVER</p>
                      <p className="font-display text-6xl leading-none font-bold uppercase sm:text-7xl">
                        {a.over}
                      </p>
                      <div className="mt-6 flex items-center justify-center gap-8 font-mono uppercase">
                        <div>
                          <p className="hud-label text-ink-3">{a.score}</p>
                          <p className="text-lime mt-1 text-3xl font-bold tabular-nums">
                            {String(final.score).padStart(5, "0")}
                          </p>
                        </div>
                        <div>
                          <p className="hud-label text-ink-3">{a.best}</p>
                          <p className="text-ink mt-1 text-3xl font-bold tabular-nums">
                            {String(best).padStart(5, "0")}
                          </p>
                        </div>
                      </div>
                      {final.record && (
                        <p className="hud-label text-lime mt-4 animate-pulse">{a.newBest}</p>
                      )}
                      <div className="mt-7">
                        <Button onClick={start}>
                          <RotateCcw size={15} aria-hidden />
                          {a.again}
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
