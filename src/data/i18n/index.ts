import type { Locale } from "../types";
import { en } from "./en";
import { id, type Dictionary } from "./id";

export const dictionaries: Record<Locale, Dictionary> = { id, en };
export const defaultLocale: Locale = "id";
export type { Dictionary };
