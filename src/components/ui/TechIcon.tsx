import { Box, Brain, Glasses, Palette, Server } from "lucide-react";
import type { ComponentType, SVGProps } from "react";
import {
  SiCss,
  SiFigma,
  SiFilament,
  SiGit,
  SiHtml5,
  SiJavascript,
  SiLaravel,
  SiLinux,
  SiMediapipe,
  SiMysql,
  SiNextdotjs,
  SiNginx,
  SiOllama,
  SiOpencv,
  SiPhp,
  SiPython,
  SiTailwindcss,
  SiTelegram,
  SiUnity,
} from "react-icons/si";

type Icon = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>;

/** Kunci ikon → komponen. Tambah di sini jika butuh ikon baru. */
const ICONS: Record<string, Icon> = {
  laravel: SiLaravel,
  filament: SiFilament,
  tailwind: SiTailwindcss,
  tailwindcss: SiTailwindcss,
  php: SiPhp,
  mysql: SiMysql,
  python: SiPython,
  opencv: SiOpencv,
  mediapipe: SiMediapipe,
  nextjs: SiNextdotjs,
  nextjsreact: SiNextdotjs,
  javascript: SiJavascript,
  html: SiHtml5,
  htmlcss: SiHtml5,
  css: SiCss,
  linux: SiLinux,
  nginx: SiNginx,
  git: SiGit,
  figma: SiFigma,
  unity: SiUnity,
  unityvr: SiUnity,
  ollama: SiOllama,
  ollamallm: SiOllama,
  qwen25: SiOllama,
  telegrambotapi: SiTelegram,
  telegram: SiTelegram,
  server: Server as Icon,
  vpshardening: Server as Icon,
  palette: Palette as Icon,
  uiux: Palette as Icon,
  machinelearning: Brain as Icon,
  vr: Glasses as Icon,
};

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export function TechIcon({
  name,
  className,
  size = 18,
}: {
  name: string;
  className?: string;
  size?: number;
}) {
  const Cmp = ICONS[normalize(name)] ?? (Box as Icon);
  return <Cmp aria-hidden className={className} width={size} height={size} />;
}
