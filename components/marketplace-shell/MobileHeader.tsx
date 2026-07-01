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
          <span>Bidra</span>
        </Link>
        <span className="mk-mobile-title">{title}</span>
      </div>
      <SearchBar compact />
    </header>
  );
}
