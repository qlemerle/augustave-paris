// Éléments fixes : écran d'introduction, rideau de transition, fil d'or (créé par lib/fx.mjs).
export function Chrome() {
  return (
    <>
      <div className="preloader" aria-hidden>
        <div className="preloader__inner">
          <img className="preloader__mono" src="/brand/monogramme-or.png" alt="" />
          <div className="preloader__word">
            {"AUGUSTAVE".split("").map((l, i) => (
              <span key={i} style={{ ["--i" as string]: i }}>
                {l}
              </span>
            ))}
          </div>
          <div className="preloader__line" />
        </div>
      </div>
      <div className="curtain" aria-hidden>
        <div className="curtain__inner">
          <img src="/brand/monogramme-or.png" alt="" />
          <span className="curtain__label" />
        </div>
      </div>
    </>
  );
}
