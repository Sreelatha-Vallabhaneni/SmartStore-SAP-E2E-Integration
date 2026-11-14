// app/components/Footer.jsx
import { ArrowRight, ArrowUpRight, LockKeyhole } from "lucide-react";

export function Footer() {
  return (
    <footer className="app-footer">
      <span className="flex items-center gap-1.5">
        <LockKeyhole size={11} />
        SmartStore <span className="mx-1">/</span> SAP Integration Suite Demo
      </span>
      <span className="flex items-center gap-1.5">
        Web App <ArrowRight size={10} /> API Management <ArrowRight size={10} /> Integration Suite{" "}
        <ArrowRight size={10} /> S/4HANA <ArrowUpRight size={11} />
      </span>
    </footer>
  );
}