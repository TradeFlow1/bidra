export function DescriptionCard({ description }: { description: string }) {
  return (
    <div className="mt-6 rounded-[24px] border border-[#EDE9FE] bg-white p-5 shadow-[0_14px_40px_rgba(43,16,85,0.06)]">
      <h2 className="text-lg font-black text-[#120724]">Description</h2>
      <p className="mt-3 whitespace-pre-wrap text-base leading-8 text-[#3F304B]">{description}</p>
    </div>
  );
}