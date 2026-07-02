type BidraTrustCueProps = {
  text: string;
  variant?: "default" | "inverse";
};

export function BidraTrustCue({ text, variant = "default" }: BidraTrustCueProps) {
  return <span className={`bidra-trust-cue bidra-trust-cue--${variant}`}>{text}</span>;
}
