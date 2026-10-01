/**
 * Mockups réalistes en pur CSS (pas d'image générique) :
 *  - Phone : vrai téléphone (coque, bezel, dynamic island, boutons,
 *           réflexion, ombre) affichant l'image fournie comme écran.
 *  - Laptop : notebook moderne posé sur un bureau (lid, écran, charnière,
 *           clavier, socle) ; l'écran affiche le contenu Simulo (ReactNode).
 *
 *  Le ratio du téléphone suit l'image fournie (736/1636 ≈ 0.45) :
 *  aucune distorsion.
 */

const PHONE_IMG = "url('/phone.jpg')";

/** Téléphone réaliste. `className` ajuste la largeur via le wrapper. */
export function Phone({ className = "" }: { className?: string }) {
  return (
    <div className={`pf ${className}`} aria-hidden="true">
      <div className="pf-body">
        <div className="pf-screen" style={{ backgroundImage: PHONE_IMG }}>
          <div className="pf-island" />
          <div className="pf-reflection" />
        </div>
        <div className="pf-btn" />
        <div className="pf-btn pf-btn--v" />
      </div>
      <div className="pf-shadow" />
    </div>
  );
}

/** Clavier : 3 rangées × 14 touches (rendu discret, crédible). */
function Keys() {
  const keys = Array.from({ length: 42 });
  return (
    <div className="lb-keys" aria-hidden="true">
      {keys.map((_, i) => (
        <i key={i} />
      ))}
    </div>
  );
}

/**
 * Notebook réaliste. `screen` = contenu de l'écran (UI Simulo).
 * `className` ajuste la largeur.
 */
export function Laptop({
  screen,
  className = "",
}: {
  screen: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`lb ${className}`} aria-hidden="true">
      <div className="lb-lid">
        <div className="lb-screen">{screen}</div>
        <div className="lb-reflection" />
      </div>
      <div className="lb-hinge" />
      <div className="lb-base">
        <Keys />
      </div>
    </div>
  );
}
