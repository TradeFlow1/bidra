import { MobileCard, MobileListRow, MobileMarketplacePage } from "@/components/mobile-marketplace-page";

const categories = [
  { title: "Electronics", subtitle: "Phones, laptops and gadgets", icon: "▯", href: "/listings/c/electronics" },
  { title: "Home & Living", subtitle: "Furniture, decor and homewares", icon: "⌂", href: "/listings/c/home-living" },
  { title: "Vehicles", subtitle: "Cars, bikes and parts", icon: "▱", href: "/listings/c/vehicles" },
  { title: "Sports & Outdoors", subtitle: "Fitness, camping and bikes", icon: "◎", href: "/listings/c/sports-outdoors" },
  { title: "Fashion", subtitle: "Clothing, shoes and accessories", icon: "♢", href: "/listings/c/fashion" },
  { title: "Kids & Baby", subtitle: "Prams, toys and essentials", icon: "☼", href: "/listings/c/kids-baby" },
  { title: "Business & Industrial", subtitle: "Tools, equipment and supplies", icon: "▤", href: "/listings/c/business-industrial" },
  { title: "More categories", subtitle: "View all", icon: "▦", href: "/categories" },
];

export default function BrowsePage() {
  return (
    <MobileMarketplacePage title="Categories">
      <MobileCard className="p-0">
        <div className="divide-y divide-[#F1F5F9] px-4">
          {categories.map((category) => (
            <MobileListRow
              key={category.title}
              href={category.href}
              title={category.title}
              subtitle={category.subtitle}
              icon={category.icon}
            />
          ))}
        </div>
      </MobileCard>
    </MobileMarketplacePage>
  );
}
