/**
 * Types partagés — miroir exact des structures Rust (simulo-core + lib.rs).
 * Tout est `camelCase` côté JSON (serde `rename_all = "camelCase"`).
 */

export type Platform = "android" | "ios" | "unknown";
export type ConnectionType = "usb" | "wireless" | "qr";

export type ConnectionStatus =
  | "disconnected"
  | "detecting"
  | "authorization-pending"
  | "connected"
  | "unauthorized"
  | "offline"
  | "error";

export type Capability =
  | "screen_mirroring"
  | "mouse_keyboard"
  | "clipboard"
  | "audio"
  | "recording"
  | "wireless_debug"
  | "qr_pairing"
  | "diagnostics";

export interface Device {
  id: string;
  platform: Platform;
  manufacturer: string | null;
  model: string | null;
  osVersion: string | null;
  serial: string;
  connectionType: ConnectionType;
  connectionStatus: ConnectionStatus;
  battery: number | null;
  resolution: [number, number] | null;
  refreshRate: number | null;
  capabilities: Capability[];
  lastSeen: number | null;
  paired: boolean;
  trusted: boolean;
}

export interface AdbStatus {
  found: boolean;
  path: string | null;
  version: string | null;
}

export interface QrSession {
  sessionId: string;
  token: string;
  createdAt: number;
  expiresAt: number;
  /** Charge utile encodée dans le QR (générée par Rust). */
  payload: string;
}

export interface DiagCheck {
  name: string;
  ok: boolean;
  advice: string;
}

/** Appareil mémorisé (RECENT), stocké en localStorage. */
export type RecentDevice = {
  serial: string;
  name: string;
  os: string | null;
  lastSeen: number;
};

/**
 * Requête de connexion centralisée (App) :
 *  - "device"  : appareil déjà détecté dans la liste ADB,
 *  - "address" : on s'appareille par IP:port (sans fil) / code (QR).
 */
export type ConnectRequest =
  | { kind: "device"; d: Device }
  | {
      kind: "address";
      serial: string;
      mode: ConnectionType;
      ip?: string;
      port?: number;
      pairCode?: string;
    };
