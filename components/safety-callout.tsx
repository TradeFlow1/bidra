type Props = {
  title?: string;
  children?: React.ReactNode;
  className?: string;
};

export default function SafetyCallout({
  title = "Safety reminder",
  children,
  className = "",
}: Props) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white p-4 ${className}`.trim()}>
      <div className="text-sm font-extrabold bd-ink">{title}</div>
      <div className="mt-2 text-sm bd-ink2 space-y-2">
        {children ? (
          children
        ) : (
          <>
            <p>
              Keep communication on Bidra, verify details carefully, and don’t send money until you’re confident the listing and seller are legitimate.
            </p>
            <ul className="list-disc pl-5">
              <li>Meet in public where possible and inspect items before paying.</li>
              <li>Double-check PayID / bank details inside Bidra messages before sending payment.</li>
              <li>If something feels off, stop and report it.</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
