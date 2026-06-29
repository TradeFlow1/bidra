import { Fragment } from "react";

export type SpecificationRow = {
  key: string;
  label: string;
  value: string;
};

export function SpecificationTable({
  condition,
  category,
  fulfillmentLabel,
  listingType,
  status,
  views,
  rows,
}: {
  condition: string;
  category: string;
  fulfillmentLabel: string;
  listingType: string;
  status: string;
  views: string;
  rows: SpecificationRow[];
}) {
  return (
    <div className="mt-8 rounded-[24px] border border-[#EDE9FE] bg-white p-5 shadow-[0_14px_40px_rgba(43,16,85,0.06)]">
      <div className="mb-5">
        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#7C3AED]">Listing details</div>
        <h2 className="mt-2 text-lg font-black text-[#120724]">Specifications</h2>
      </div>

      <dl className="grid grid-cols-[130px_1fr] gap-x-6 gap-y-4 text-sm">
        <dt className="font-bold text-[#62516F]">Condition</dt>
        <dd className="font-extrabold text-[#120724]">{condition}</dd>

        <dt className="font-bold text-[#62516F]">Category</dt>
        <dd className="font-extrabold text-[#120724]">{category}</dd>

        <dt className="font-bold text-[#62516F]">Handover</dt>
        <dd className="font-extrabold text-[#120724]">{fulfillmentLabel}</dd>

        {rows.map((row) => (
          <Fragment key={row.key}>
            <dt className="font-bold text-[#62516F]">{row.label}</dt>
            <dd className="font-extrabold text-[#120724]">{row.value}</dd>
          </Fragment>
        ))}

        <dt className="font-bold text-[#62516F]">Listing type</dt>
        <dd className="font-extrabold text-[#120724]">{listingType}</dd>

        <dt className="font-bold text-[#62516F]">Status</dt>
        <dd className="font-extrabold text-[#120724]">{status}</dd>

        <dt className="font-bold text-[#62516F]">Views</dt>
        <dd className="font-extrabold text-[#120724]">{views}</dd>
      </dl>
    </div>
  );
}