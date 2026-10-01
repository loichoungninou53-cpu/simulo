import { Loader2, Play, Smartphone } from "lucide-react";
import type { Device } from "../lib/types";

/**
 * Ligne d'appareil (réelle) + bouton Connecter.
 * Partagée par la vue Appareils et l'onglet USB de la Connexion
 * (zéro duplication).
 */
export default function DeviceRow({
  device,
  busy,
  onConnect,
}: {
  device: Device;
  busy: boolean;
  onConnect: () => void;
}) {
  const name =
    [device.manufacturer, device.model].filter(Boolean).join(" ") ||
    `Appareil ${device.serial.slice(0, 6)}`;
  const authorized = device.connectionStatus === "connected";

  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-sky-400/15 bg-slate-950/40 p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
          <Smartphone size={18} />
        </span>
        <div>
          <div className="font-semibold text-white">{name}</div>
          <div className="text-xs text-slate-400">
            {device.osVersion ?? "Android"} · {device.connectionType.toUpperCase()} ·{" "}
            {device.connectionStatus === "unauthorized"
              ? "autorisation requise sur le téléphone"
              : device.connectionStatus}
          </div>
        </div>
      </div>
      <button className="btn-primary" disabled={!authorized || busy} onClick={onConnect}>
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Play size={15} />}
        Connecter
      </button>
    </li>
  );
}
