import { ReactNode } from "react";
import { Link } from "react-router-dom";
import Logo from "@/components/Logo";
import Seo from "@/components/Seo";

export function LegalFooterLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap justify-center gap-4 text-xs ${className}`}>
      <Link to="/terms" className="text-muted-foreground hover:text-primary hover:underline">Terms &amp; Conditions</Link>
      <Link to="/privacy-policy" className="text-muted-foreground hover:text-primary hover:underline">Privacy Policy</Link>
      <Link to="/refund-policy" className="text-muted-foreground hover:text-primary hover:underline">Refund Policy</Link>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="font-display text-lg font-semibold text-foreground">{title}</h2>
      <div className="space-y-2 text-sm leading-relaxed text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">{children}</div>
    </section>
  );
}

export default function LegalLayout({ title, description, updated, children }: { title: string; description: string; updated: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Seo title={`${title} | AutoReach`} description={description} />
      <header className="border-b">
        <div className="container flex items-center justify-between px-4 py-4">
          <Link to="/" aria-label="AutoReach home"><Logo /></Link>
          <Link to="/" className="text-sm text-primary hover:underline">Back to home</Link>
        </div>
      </header>
      <main className="container max-w-3xl space-y-8 px-4 py-10">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">{title}</h1>
          <p className="text-xs text-muted-foreground">Last updated: {updated}</p>
        </div>
        {children}
        <p className="border-t pt-6 text-sm text-muted-foreground">
          Questions? WhatsApp us on <a className="text-primary hover:underline" href="https://wa.me/94721059942">+94 72 105 9942</a>.
        </p>
      </main>
      <footer className="border-t py-6"><LegalFooterLinks /></footer>
    </div>
  );
}
