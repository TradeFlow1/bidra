import Link from "next/link";
import SearchBar from "./SearchBar";

type MobileHeaderProps = {
  title: string;
};

export default function MobileHeader({ title }: MobileHeaderProps) {
  return (
    <header aria-label="Mobile header">
      <div>
        <div>
          <Link href="/" aria-label="Bidra home">Bidra</Link>
          <p>Australia marketplace</p>
        </div>
        <div>
          <span>{title}</span>
          <Link href="/sell/new">Sell</Link>
        </div>
      </div>
      <SearchBar compact placeholder="Search listings" locationPlaceholder="Nearby" showButton={false} />
    </header>
  );
}
