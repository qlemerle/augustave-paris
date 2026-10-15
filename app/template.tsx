// Rejoué à chaque navigation : fondu d'entrée de page.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
