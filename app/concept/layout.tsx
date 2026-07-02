import type { ReactNode } from "react";
import "@/styles/concept-marketplace.css";

type ConceptLayoutProps = {
  children: ReactNode;
};

export default function ConceptLayout({ children }: ConceptLayoutProps) {
  return children;
}
