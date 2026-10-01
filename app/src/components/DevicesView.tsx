import { Cable, Loader2, QrCode, RefreshCw, Smartphone, Wifi } from "lucide-react";
import DeviceRow from "./DeviceRow";
import type { Device } from "../lib/types";

type Mode = "usb" | "wireless" | "qr";
type Props = {
  devices: Device[];
  scanning: boolean;
  onScan: () => void;
  busy: string | null;
  onConnect: (d: Device) => void;
  onGoConnect: (m: Mode) => void;
};

/** Appareils — liste en direct (polling partagé géré par App). */
export default function DevicesView({ devices, scanning, onScan, busy, onConnect, onGoConnect }: Props) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Appareils</h1>
          <p className="mt-1 text-sm text-slate-400">Tous les appareils visibles par ADB, en direct.</p>
        </div>
        <button className="btn-ghost" onClick={onScan} disabled={scanning}>
          {scanning ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Rafraîchir
        </button>
      </div>

      {devices.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-sky-400/10 bg-slate-950/30 py-12 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
            <Smartphone size={26} />
          </span>
          <p className="text-sm text-slate-400">Aucun appareil détecté pour l'instant.</p>
          <p className="text-xs text-slate-500">Branche ton téléphone (USB) ou active le débogage sans fil.</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {devices.map((d) => (
            <DeviceRow key={d.serial} device={d} busy={busy === d.serial} onConnect={() => onConnect(d)} />
          ))}
        </ul>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-slate-300">Autres méthodes</h3>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <button className="btn-ghost" onClick={() => onGoConnect("usb")}>
            <Cable size={15} /> USB
          </button>
          <button className="btn-ghost" onClick={() => onGoConnect("wireless")}>
            <Wifi size={15} /> Sans fil
          </button>
          <button className="btn-ghost" onClick={() => onGoConnect("qr")}>
            <QrCode size={15} /> Scanner QR
          </button>
        </div>
      </div>
    </div>
  );
}
