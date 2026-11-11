"use client";

import { Check, Gamepad2, Pause, Play, RotateCcw } from "lucide-react";
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
import { sectionNumber } from "@/data/sections";
import { BUFFS, createGame, type BuffKind, type Game } from "./engine";
import { Leaderboard, qualifies, type ScoreEntry } from "./Leaderboard";

const HI_KEY = "zs-arcade-hi";
const NAME_KEY = "zs-arcade-name";
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
  const [final, setFinal] = useState({ score: 0, wave: 1, best: 0, record: false });
  const [entries, setEntries] = useState<ScoreEntry[] | null>(null);
  const [lbState, setLbState] = useState<"loading" | "ready" | "offline">("loading");
  const [name, setName] = useState("");
  const [submit, setSubmit] = useState<"idle" | "sending" | "saved" | "name" | "rate" | "fail">(
    "idle",
  );
  const [highlight, setHighlight] = useState<string>();
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
        onOver: (score, wave) => {
          const prev = readHi();
          const record = score > prev;
          if (record) {
            try {
              localStorage.setItem(HI_KEY, String(score));
            } catch {
              /* abaikan */
            }
          }
          setFinal({ score, wave, best: Math.max(prev, score), record });
          setSubmit("idle");
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

  // Ambil leaderboard sekali saat area game mendekati layar
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        try {
          setName(localStorage.getItem(NAME_KEY) ?? "");
        } catch {
          /* abaikan */
        }
        fetch("/api/leaderboard/", { cache: "no-store" })
          .then((r) => (r.ok ? r.json() : Promise.reject()))
          .then((d: { entries: ScoreEntry[] }) => {
            setEntries(d.entries);
            setLbState("ready");
          })
          .catch(() => setLbState("offline"));
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const saveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const n = name.trim().toUpperCase();
    if (!/^[A-Z0-9_]{3,12}$/.test(n)) {
      setSubmit("name");
      return;
    }
    setSubmit("sending");
    try {
      const res = await fetch("/api/leaderboard/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: n, score: final.score, wave: final.wave }),
      });
      if (!res.ok) {
        setSubmit(res.status === 429 ? "rate" : res.status === 400 ? "name" : "fail");
        return;
      }
      const d = (await res.json()) as { entries: ScoreEntry[] };
      setEntries(d.entries);
      setLbState("ready");
      setHighlight(n);
      setSubmit("saved");
      try {
        localStorage.setItem(NAME_KEY, n);
      } catch {
        /* abaikan */
      }
    } catch {
      setSubmit("fail");
    }
  };

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

  // Selama bermain, ikuti posisi kursor di SELURUH jendela: kursor boleh keluar frame game,
  // pesawat tetap mengikuti posisi horizontalnya (dibatasi di tepi arena).
  useEffect(() => {
    if (status !== "playing") return;
    const onMove = (e: PointerEvent) => gameRef.current?.setTargetFromClient(e.clientX);
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [status]);

  const best = status === "over" ? final.best : 0;
  const canSubmit = status === "over" && qualifies(entries, final.score);
  const lb = a.lb;

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
            onPointerDown={onPointer}
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
                        {a.label} {"//"} {sectionNumber("arcade")}
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
                        <p className="hud-label text-lime mt-3 animate-pulse">{a.newBest}</p>
                      )}
                      {(canSubmit || submit === "saved") && (
                        <div className="mx-auto mt-5 w-full max-w-sm">
                          {submit === "saved" ? (
                            <p className="hud-label text-lime flex items-center justify-center gap-2">
                              <Check size={14} aria-hidden /> {lb.saved}
                            </p>
                          ) : (
                            <form onSubmit={saveScore} noValidate>
                              <label htmlFor="lb-name" className="text-ink-2 mb-2 block text-sm">
                                {lb.enter}
                              </label>
                              <div className="flex gap-2">
                                <input
                                  id="lb-name"
                                  value={name}
                                  onChange={(e) =>
                                    setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ""))
                                  }
                                  maxLength={12}
                                  autoComplete="nickname"
                                  placeholder={lb.namePh}
                                  aria-invalid={submit === "name"}
                                  className="clip-corner-sm border-violet-dim/60 bg-abyss/80 text-ink placeholder:text-ink-3 focus:border-lime min-w-0 flex-1 border px-3 py-2 font-mono text-sm tracking-widest uppercase outline-none"
                                />
                                <Button
                                  type="submit"
                                  size="sm"
                                  magnetic={false}
                                  disabled={submit === "sending"}
                                >
                                  {lb.save}
                                </Button>
                              </div>
                              {(submit === "name" || submit === "rate" || submit === "fail") && (
                                <p role="alert" className="text-magenta mt-2 text-xs">
                                  {submit === "name"
                                    ? lb.errName
                                    : submit === "rate"
                                      ? lb.errRate
                                      : lb.errFail}
                                </p>
                              )}
                            </form>
                          )}
                        </div>
                      )}
                      <div className="mt-6">
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
        <BuffLegend />
        <Leaderboard entries={entries} state={lbState} highlight={highlight} />
      </Reveal>
    </Section>
  );
}

/** Legenda buff (kapsul yang dijatuhkan bug) + ringkasan fitur v2. */
function BuffLegend() {
  const { t } = useI18n();
  const a = t.arcade;
  return (
    <div className="hud-panel clip-corner-tr mt-4 p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lime font-mono text-xs font-semibold tracking-[0.18em] uppercase">
          {a.buffTitle}
        </p>
        <p className="text-ink-3 text-xs">{a.buffHint}</p>
      </div>
      <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
        {(Object.keys(BUFFS) as BuffKind[]).map((k) => {
          const b = BUFFS[k];
          return (
            <li key={k} className="flex items-center gap-3">
              <span
                className="clip-corner-sm grid h-7 w-10 shrink-0 place-items-center border font-mono text-[0.6875rem] font-bold"
                style={{ color: b.color, borderColor: b.color, background: "#100e1a" }}
              >
                {b.tag}
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block font-mono text-xs tracking-wider" style={{ color: b.color }}>
                  {b.name}
                </span>
                <span className="text-ink-2 block text-xs">{a.buffs[k]}</span>
              </span>
            </li>
          );
        })}
      </ul>
      <ul className="border-violet-dim/25 text-ink-2 mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t pt-3 text-xs">
        {a.extras.map((x) => (
          <li key={x} className="flex items-center gap-2">
            <span aria-hidden className="text-lime">
              ▸
            </span>
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}
