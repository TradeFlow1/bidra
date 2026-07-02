type BidraTrustCueProps = {
  text: string;
};

export function BidraTrustCue({ text }: BidraTrustCueProps) {
  return <span className="bidra-trust-cue">{text}</span>;
}
