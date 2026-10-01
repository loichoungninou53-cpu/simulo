import { useState } from "react";
import QRCode from "qrcode";
import {
  Cable,
  History,
  Loader2,
  Play,
  QrCode,
  RefreshCw,
  Smartphone,
  Usb,
  Wifi,
} from "lucide-react";
import DeviceRow from "./DeviceRow";
import type { ConnectRequest, Device, QrSession, RecentDevice } from "../lib/types";
import { newQrSession, relTime } from "../lib/tauri";

type Tab = "usb" | "wireless" | "qr";

type Props = {
  adbFound: boolean;
  devices: Device[];
  scanning: boolean;
  onScan: () => void;
  busy: string | null;
  recent: RecentDevice[];
  initialMode: Tab;
  onConnectDevice: (req: ConnectRequest) => Promise<void>;
};

/**
 * Connexion — onglets USB / Sans fil / QR.
 * La connexion proprement dite est CENTRALISÉE dans App (onConnectDevice) ;
 * ici on gère les entrées + la validation (erreurs affichées en clair).
 */
export default function ConnectScreen({
  adbFound,
  devices,
  scanning,
  onScan,
  busy,
  recent,
  initialMode,
  onConnectDevice,
}: Props) {
  const [tab, setTab] = useState<Tab>(initialMode);
  const [error, setError] = useState<string | null>(null);

  const [ip, setIp] = useState("");
  const [port, setPort] = useState("5555");

  const [qr, setQr] = useState<QrSession | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [pairIp, setPairIp] = useState("");
  const [pairPort, setPairPort] = useState("");
  const [pairCode, setPairCode] = useState("");

  const switchTab = (id: Tab) => {
    setTab(id);
    setError(null);
  };

  const makeQr = async () => {
    setError(null);
    try {
      const s = await newQrSession();
      setQr(s);
      setQrDataUrl(
        await QRCode.toDataURL(s.payload, {
          width: 220,
          margin: 2,
          color: { dark: "#020617", light: "#eaf3ff" },
        })
      );
    } catch (e) {
      setError(String(e));
    }
  };

  const doWireless = async () => {
    setError(null);
    const p = Number(port);
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip) || !p) {
      setError("Saisis l'IP affichée sur le téléphone (ex. 192.168.1.12) et le port (5555 par défaut).");
      return;
    }
    try {
      await onConnectDevice({
        kind: "address",
        serial: `${ip}:${p}`,
        mode: "wireless",
        ip,
        port: p,
      });
    } catch {
      /* l'erreur est remontée par App (bandeau rouge) */
    }
  };

  const doQrPair = async () => {
    setError(null);
    const p = Number(pairPort) || 5555;
    if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(pairIp)) {
      setError("Saisis l'IP affichée à côté du QR sur ton téléphone.");
      return;
    }
    if (!/^\d{4,8}$/.test(pairCode)) {
      setError("Saisis le code d'appairage affiché sur le téléphone (il change à chaque affichage du QR).");
      return;
    }
    try {
      await onConnectDevice({
        kind: "address",
        serial: `${pairIp}:${p}`,
        mode: "qr",
        ip: pairIp,
        port: p,
        pairCode,
      });
    } catch {
      /* erreur remontée par App */
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <h1 className="text-3xl font-bold text-white">Connexion</h1>
      <p className="mt-2 text-sm text-slate-400">
        {adbFound
          ? "ADB est prêt. Simulo surveille ton téléphone."
          : "ADB n'est pas encore installé — ouvre Diagnostics et suis le guide de 2 minutes."}
      </p>

      {/* Onglets */}
      <div className="mt-6 flex gap-2">
        {(
          [
            ["usb", "USB", Usb],
            ["wireless", "Sans fil", Wifi],
            ["qr", "QR Code", QrCode],
          ] as [Tab, string, typeof Usb][]
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => switchTab(id)}
            className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors ${
              tab === id
                ? "bg-sky-400/20 text-sky-200 ring-1 ring-sky-400/50"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-5 rounded-xl border border-red-400/40 bg-red-950/40 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* ---------------- USB ---------------- */}
      {tab === "usb" && (
        <div className="card mt-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 font-semibold text-white">
                <Cable size={18} className="text-sky-300" /> Connexion par USB
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Branche ton téléphone. Si une fenêtre apparaît, appuie sur{" "}
                <b className="text-slate-200">Autoriser le débogage USB</b>.
              </p>
            </div>
            <button className="btn-ghost" onClick={onScan} disabled={scanning}>
              {scanning ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              Scanner
            </button>
          </div>

          {devices.length === 0 ? (
            <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
                <Smartphone size={26} />
              </span>
              <p className="text-sm text-slate-400">
                {adbFound
                  ? "Aucun téléphone pour l'instant. Branche-le (câble de données) — Simulo le détecte automatiquement."
                  : "Installe d'abord ADB (Diagnostics, barre latérale) — puis branche ton téléphone."}
              </p>
            </div>
          ) : (
            <ul className="mt-5 space-y-3">
              {devices.map((d) => (
                <DeviceRow
                  key={d.serial}
                  device={d}
                  busy={busy !== null}
                  onConnect={() => onConnectDevice({ kind: "device", d }).catch(() => {})}
                />
              ))}
            </ul>
          )}

          {devices.some((d) => d.connectionStatus === "unauthorized") && (
            <div className="mt-4 rounded-xl border border-amber-400/30 bg-amber-950/30 p-4 text-sm text-amber-200">
              Sur ton téléphone : <b>Autoriser le débogage USB</b> (coche « Toujours
              autoriser » pour ne plus jamais voir ça). Simulo reprendra automatiquement.
            </div>
          )}
        </div>
      )}

      {/* ---------------- Sans fil ---------------- */}
      {tab === "wireless" && (
        <div className="card mt-6 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <Wifi size={18} className="text-sky-300" /> Connexion sans fil
          </h2>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-400">
            <li>Téléphone et PC sur le même Wi-Fi.</li>
            <li>Téléphone : Options développeur → Débogage sans fil → activer.</li>
            <li>Copie l'IP + le port affichés (ou utilise l'appairage QR).</li>
          </ol>
          <div className="mt-5 grid max-w-md grid-cols-[1fr_110px_auto] gap-3">
            <input className="input" placeholder="192.168.1.12" value={ip} onChange={(e) => setIp(e.target.value)} />
            <input className="input" placeholder="5555" value={port} onChange={(e) => setPort(e.target.value)} />
            <button className="btn-primary" onClick={() => void doWireless()} disabled={busy !== null}>
              {busy !== null ? <Loader2 size={15} className="animate-spin" /> : <Wifi size={15} />}
              Connecter
            </button>
          </div>
        </div>
      )}

      {/* ---------------- QR ---------------- */}
      {tab === "qr" && (
        <div className="card mt-6 p-6">
          <h2 className="flex items-center gap-2 font-semibold text-white">
            <QrCode size={18} className="text-sky-300" /> Appairage QR
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            La plus rapide sur Android 11+. Ton téléphone affiche un QR avec un code
            d'appairage — Simulo fait le reste automatiquement.
          </p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-400">
            <li>Téléphone : Options développeur → Débogage sans fil.</li>
            <li>Appuie sur <b className="text-slate-200">Appairer l'appareil via code QR</b>.</li>
            <li>Note l'IP + le code d'appairage affichés (le QR change toutes les 60 s).</li>
          </ol>
          <div className="mt-5 grid max-w-xl grid-cols-2 gap-3">
            <input className="input" placeholder="IP du téléphone (ex. 192.168.1.12)" value={pairIp} onChange={(e) => setPairIp(e.target.value)} />
            <input className="input" placeholder="Port (souvent 37xxx ou 5555)" value={pairPort} onChange={(e) => setPairPort(e.target.value)} />
          </div>
          <div className="mt-3 flex max-w-xl gap-3">
            <input className="input flex-1" placeholder="Code d'appairage (6–8 chiffres sous le QR)" value={pairCode} onChange={(e) => setPairCode(e.target.value)} />
            <button className="btn-primary" onClick={() => void doQrPair()} disabled={busy !== null}>
              {busy !== null ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
              Appairer &amp; Connecter
            </button>
          </div>

          <div className="mt-6 rounded-xl border border-sky-400/15 bg-slate-950/40 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">QR de session Simulo</div>
                <p className="mt-1 max-w-sm text-xs text-slate-400">
                  Code temporaire (5 min, un usage), utilisé par l'app compagnon Simulo
                  (bientôt). Pas encore d'app Simulo sur ton téléphone ? Utilise les champs
                  ci-dessus — 15 secondes suffisent.
                </p>
              </div>
              <div className="flex items-center gap-3">
                {qrDataUrl && qr ? (
                  <img src={qrDataUrl} alt="Code QR d'appairage Simulo" className="h-[120px] w-[120px] rounded-lg border border-sky-400/30 bg-white p-1" />
                ) : (
                  <span className="grid h-[120px] w-[120px] place-items-center rounded-lg border border-dashed border-sky-400/30 text-xs text-slate-500">
                    aucun QR
                  </span>
                )}
                <button className="btn-ghost" onClick={() => void makeQr()}>
                  <RefreshCw size={14} />
                  {qr ? "Nouveau code" : "Générer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Appareils récents ---------------- */}
      {recent.length > 0 && (
        <div className="mt-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-400">
            <History size={14} /> Appareils récents
          </h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {recent.map((r) => {
              const d = devices.find((x) => x.serial === r.serial);
              const ready = !!d && d.connectionStatus === "connected";
              return (
                <li key={r.serial} className="card flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="text-sm font-semibold text-white">{r.name}</div>
                    <div className="text-xs text-slate-400">
                      {r.os ?? "Android"} · Connecté {relTime(r.lastSeen)}
                    </div>
                  </div>
                  <button
                    className="btn-ghost"
                    disabled={!ready || busy !== null}
                    title={ready ? "Reconnecter" : "Appareil non visible pour l'instant"}
                    onClick={() => d && onConnectDevice({ kind: "device", d }).catch(() => {})}
                  >
                    <Play size={14} />
                    Connecter
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
