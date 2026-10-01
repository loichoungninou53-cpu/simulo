import { useCallback, useEffect, useState } from "react";
import { MonitorSmartphone, Play } from "lucide-react";
import Sidebar from "./components/Sidebar";
import HomeView from "./components/HomeView";
import DevicesView from "./components/DevicesView";
import ConnectScreen from "./components/ConnectScreen";
import MirrorScreen from "./components/MirrorScreen";
import DiagnosticsView from "./components/DiagnosticsView";
import SettingsView from "./components/SettingsView";
import { connectDevice, getAdbStatus, refreshDevices, startMirror } from "./lib/tauri";
import { getPrefs } from "./lib/prefs";
import type { AdbStatus, ConnectRequest, Device, RecentDevice } from "./lib/types";
import type { View } from "./lib/nav";

type Mode = "usb" | "wireless" | "qr";

const loadRecent = (): RecentDevice[] => {
  try {
    return JSON.parse(localStorage.getItem("simulo.recent") ?? "[]") as RecentDevice[];
  } catch {
    return [];
  }
};

/**
 * SIMULO — racine de l'application desktop.
 *
 * Dashboard à barre latérale : Accueil / Appareils / Connexion / Mirroring /
 * Diagnostics / Paramètres. Toute la connexion est CENTRALISÉE ici (zéro
 * duplication) et n'affiche que de vraies données backend.
 */
export default function App() {
  const [adb, setAdb] = useState<AdbStatus | null>(null);
  const [view, setView] = useState<View>("home");
  const [mode, setMode] = useState<Mode>(() => getPrefs().defaultMode);
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [session, setSession] = useState<Device | null>(null);
  const [recent, setRecent] = useState<RecentDevice[]>(loadRecent);
  const [bootError, setBootError] = useState<string | null>(null);

  useEffect(() => {
    getAdbStatus()
      .then(setAdb)
      .catch((e) => setBootError(String(e)));
  }, []);

  // Polling doux (4 s) partagé par toutes les vues d'appareils.
  const scan = useCallback(async () => {
    setScanning(true);
    try {
      setDevices(await refreshDevices());
    } catch {
      /* on garde la dernière liste connue (ADB indispo) */
    } finally {
      setScanning(false);
    }
  }, []);
  useEffect(() => {
    void scan();
    const t = setInterval(() => void scan(), 4000);
    return () => clearInterval(t);
  }, [scan]);

  const saveRecent = useCallback((d: Device) => {
    setRecent((prev) => {
      const next = [
        {
          serial: d.serial,
          name: [d.manufacturer, d.model].filter(Boolean).join(" ") || d.serial,
          os: d.osVersion,
          lastSeen: Date.now() / 1000,
        },
        ...prev.filter((r) => r.serial !== d.serial),
      ].slice(0, 5);
      localStorage.setItem("simulo.recent", JSON.stringify(next));
      return next;
    });
  }, []);

  /**
   * Parcours de connexion centralisé : appairage + démarrage du mirroring
   * (scrcpy officiel) avec les réglages de session. Erreurs remontées en clair.
   */
  const connect = useCallback(
    async (req: ConnectRequest) => {
      const { serial, mode, ip, port, pairCode } =
        req.kind === "device"
          ? {
              serial: req.d.serial,
              mode: req.d.connectionType,
              ip: undefined,
              port: undefined,
              pairCode: undefined,
            }
          : req;
      setBusy(serial);
      setBootError(null);
      try {
        const dev = await connectDevice({
          serial,
          mode,
          ip,
          port,
          pairCode,
        });
        saveRecent(dev);
        const p = getPrefs();
        const note = await startMirror({
          serial: dev.serial,
          maxSize: Number(p.maxSize),
          bitRate: p.bitRate,
          maxFps: p.maxFps,
          audio: p.audio && dev.capabilities.includes("audio"),
        });
        if (note) {
          setSession(dev);
          setView("mirror");
        }
      } catch (e) {
        setBootError(String(e));
        setTimeout(() => setBootError(null), 9000);
        throw e;
      } finally {
        setBusy(null);
      }
    },
    [saveRecent]
  );

  const goConnect = useCallback((m: Mode) => {
    setMode(m);
    setView("connect");
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-[#020617] text-[#eaf3ff]">
      <Sidebar
        view={view}
        onNavigate={setView}
        adb={adb}
        onDiagnostics={() => setView("diagnostics")}
        mirroring={!!session}
      />

      <main className="flex-1 overflow-y-auto">
        {bootError && (
          <div className="mx-auto mt-4 w-full max-w-3xl px-6">
            <div className="rounded-xl border border-red-400/40 bg-red-950/40 p-4 text-sm text-red-200">
              {bootError}
            </div>
          </div>
        )}

        {view === "home" && (
          <HomeView adbFound={adb?.found ?? false} onConnect={goConnect} />
        )}

        {view === "devices" && (
          <DevicesView
            devices={devices}
            scanning={scanning}
            onScan={() => void scan()}
            busy={busy}
            onConnect={(d) => void connect({ kind: "device", d }).catch(() => {})}
            onGoConnect={goConnect}
          />
        )}

        {view === "connect" && (
          <ConnectScreen
            key={mode}
            adbFound={adb?.found ?? false}
            devices={devices}
            scanning={scanning}
            onScan={() => void scan()}
            busy={busy}
            recent={recent}
            initialMode={mode}
            onConnectDevice={connect}
          />
        )}

        {view === "mirror" &&
          (session ? (
            <MirrorScreen
              device={session}
              onBack={() => setView("home")}
              onDiagnostics={() => setView("diagnostics")}
            />
          ) : (
            <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-4 px-6 py-24 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-sky-400/10 text-sky-300">
                <MonitorSmartphone size={30} />
              </span>
              <h2 className="text-xl font-bold text-white">Aucune session active</h2>
              <p className="max-w-sm text-sm text-slate-400">
                Connecte ton appareil pour démarrer le mirroring.
              </p>
              <button className="btn-primary" onClick={() => goConnect(getPrefs().defaultMode)}>
                <Play size={15} />
                Connecter
              </button>
            </div>
          ))}

        {view === "diagnostics" && <DiagnosticsView />}
        {view === "settings" && <SettingsView />}
      </main>
    </div>
  );
}
