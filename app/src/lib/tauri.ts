/**
 * Couche d'appel vers le backend Rust.
 *
 * En mode dev Tauri, `invoke` parle directement à Rust.
 * Si l'app tourne hors Tauri (impossible aujourd'hui, mais défensif),
 * chaque appel échoue avec un message clair — jamais de faux état.
 */
import { invoke } from "@tauri-apps/api/core";

import type {
  AdbStatus,
  Device,
  DiagCheck,
  QrSession,
} from "./types";

export async function getAdbStatus(): Promise<AdbStatus> {
  return invoke<AdbStatus>("get_adb_status");
}

export async function refreshDevices(): Promise<Device[]> {
  return invoke<Device[]>("refresh_devices");
}

export async function connectDevice(opts: {
  serial: string;
  mode: "usb" | "wireless" | "qr";
  ip?: string;
  port?: number;
  pairCode?: string;
}): Promise<Device> {
  return invoke<Device>("connect_device", {
    serial: opts.serial,
    mode: opts.mode,
    ip: opts.ip ?? null,
    port: opts.port ?? null,
    pairCode: opts.pairCode ?? null,
  });
}

export async function startMirror(opts: {
  serial: string;
  maxSize: number;
  bitRate: string;
  maxFps: number;
  record?: string;
  audio: boolean;
}): Promise<string> {
  return invoke<string>("start_mirror", {
    serial: opts.serial,
    maxSize: opts.maxSize,
    bitRate: opts.bitRate,
    maxFps: opts.maxFps,
    record: opts.record ?? null,
    audio: opts.audio,
  });
}

export async function stopMirror(): Promise<string> {
  return invoke<string>("stop_mirror");
}

export async function sendText(serial: string, text: string): Promise<string> {
  return invoke<string>("send_text", { serial, text });
}

export async function sendKey(serial: string, key: string): Promise<string> {
  return invoke<string>("send_key", { serial, key });
}

export async function newQrSession(): Promise<QrSession> {
  const raw = await invoke<Omit<QrSession, "payload">>("new_qr_session");
  const session: QrSession = {
    ...raw,
    payload: `simulo://pair?sid=${raw.sessionId}&tok=${raw.token}&exp=${raw.expiresAt}`,
  };
  return session;
}

export async function runDiagnostics(): Promise<DiagCheck[]> {
  return invoke<DiagCheck[]>("run_diagnostics");
}

export async function getLogs(): Promise<string[]> {
  return invoke<string[]>("get_logs");
}

/** Formatte un horodatage UNIX secondes en date lisible. */
export function fmtUnix(ts: number | null): string {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleString();
}

/** "il y a X min" pour les APPAREILS RÉCENTS. */
export function relTime(ts: number | null): string {
  if (!ts) return "jamais";
  const mins = Math.max(0, Math.round((Date.now() / 1000 - ts) / 60));
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `il y a ${h} h`;
  return `il y a ${Math.round(h / 24)} j`;
}
