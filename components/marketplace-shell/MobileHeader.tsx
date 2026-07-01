import Link from "next/link";
import SearchBar from "./SearchBar";

type MobileHeaderProps = {
  title: string;
};

export default function MobileHeader({ title }: MobileHeaderProps) {
  return (
    <header className="mk-mobile-header" aria-label="Mobile header">
      <div className="mk-mobile-header-row">
        <Link href="/" className="mk-brand" aria-label="Bidra home">
          <span className="mk-brand-dot" />
          <span className="mk-brand-wordmark">Bidra</span>
        </Link>
        <div className="mk-mobile-actions">
          <span className="mk-mobile-title">{title}</span>
          <Link href="/sell/new" className="mk-mobile-sell">Sell</Link>
        </div>
      </div>
      <SearchBar compact placeholder="Search listings" locationPlaceholder="Nearby" showButton={false} />
    </header>
  );
}
