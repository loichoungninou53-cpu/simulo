import { ArrowRight, QrCode, Usb, Wifi } from "lucide-react";

type Mode = "usb" | "wireless" | "qr";
type Props = {
  adbFound: boolean;
  onConnect: (m: Mode) => void;
};

/**
 * Accueil — l'essentiel : "Connecter un appareil" + 3 méthodes.
 * Pas de stats inutiles, juste l'action.
 */
export default function HomeView({ adbFound, onConnect }: Props) {
  const modes: { id: Mode; icon: typeof Usb; title: string; desc: string }[] = [
    { id: "usb", icon: Usb, title: "USB", desc: "Branche ton câble. Simulo le détecte tout seul." },
    { id: "wireless", icon: Wifi, title: "Sans fil", desc: "Même réseau Wi-Fi. Copie l'IP et le port." },
    { id: "qr", icon: QrCode, title: "Scanner QR", desc: "Android 11+ : appairage en un scan." },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold text-white">Connecter un appareil</h1>
      <p className="mt-2 text-sm text-slate-400">
        {adbFound
          ? "ADB est prêt. Choisis une méthode de connexion."
          : "ADB n'est pas encore prêt — ouvre Diagnostics (barre latérale) pour le guide."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {modes.map((m) => (
          <button
            key={m.id}
            onClick={() => onConnect(m.id)}
            className="card group flex flex-col items-start gap-3 p-5 text-left transition-colors hover:border-sky-400/40"
          >
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-sky-400/15 text-sky-300">
              <m.icon size={20} />
            </span>
            <span className="text-base font-bold text-white">{m.title}</span>
            <span className="text-xs leading-relaxed text-slate-400">{m.desc}</span>
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-sky-300">
              Commencer <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-sky-400/15 bg-slate-950/40 p-4 text-sm text-slate-400">
        Après la première connexion, ton appareil reste mémorisé : il suffira de
        appuyer sur <b className="text-slate-200">Connecter</b> pour le retrouver
        instantanément.
      </div>
    </div>
  );
}
