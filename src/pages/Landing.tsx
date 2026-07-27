import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  Car,
  ClipboardCheck,
  MapPin,
  MessageCircle,
  Receipt,
  ShieldCheck,
  Truck,
  Wrench,
} from "lucide-react";
import heroImage from "@/assets/hero-autoreach.jpg";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth, homeForRole } from "@/context/AuthContext";
import { SERVICE_MENU, whatsappLink } from "@/lib/autoreach";

const steps = [
  { icon: Truck, title: "We Pick Up", body: "A vetted AutoReach handler collects your vehicle from your home or office." },
  { icon: Wrench, title: "We Service", body: "We take it to an authorized or trusted partner centre and supervise every step." },
  { icon: Car, title: "We Deliver", body: "Your vehicle comes back washed, serviced and documented — same day where possible." },
];

const badges = [
  { icon: ShieldCheck, label: "Safe Handling", body: "Insured transit, vetted drivers" },
  { icon: Camera, label: "Photo Updates", body: "Condition photos at every stage" },
  { icon: Receipt, label: "Transparent Pricing", body: "Itemised invoice, no surprises" },
  { icon: BadgeCheck, label: "Authorized Centres", body: "Brand agents & trusted partners" },
];

export default function Landing() {
  const { user, role } = useAuth();
  const dest = user ? homeForRole(role) : "/auth";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur">
        <div className="container flex items-center justify-between px-4 py-3">
          <Logo />
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={dest}>{user ? "My account" : "Sign in"}</Link>
            </Button>
            <Button asChild variant="cta" size="sm">
              <Link to={user ? "/book" : "/auth"}>Book a Service</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-brand">
          <div className="container grid gap-10 px-4 py-14 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:py-20">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/12 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-primary-foreground/85">
                <MapPin className="h-3.5 w-3.5" /> Colombo & suburbs
              </span>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] text-primary-foreground sm:text-5xl lg:text-6xl">
                Your vehicle service,
                <br />
                without the service centre.
              </h1>
              <p className="mt-4 max-w-xl text-base text-primary-foreground/80 sm:text-lg">
                AutoReach is Sri Lanka&apos;s vehicle concierge. We pick up. We service. We deliver — so you never lose a
                working day to a garage queue again.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="onBrand" size="xl">
                  <Link to={user ? "/book" : "/auth"}>
                    Book a Service <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outlineBrand" size="xl">
                  <Link to={user ? "/track" : "/auth"}>Track My Vehicle</Link>
                </Button>
              </div>
              <div className="mt-8 inline-flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl bg-primary-foreground/10 px-4 py-3">
                <span className="rounded-full bg-warning px-2.5 py-1 text-xs font-bold text-warning-foreground">
                  LAUNCH OFFER
                </span>
                <p className="text-sm font-semibold text-primary-foreground">
                  Pickup &amp; drop for just Rs. 1,500 — limited time.
                </p>
              </div>
            </div>

            <div className="relative">
              <img
                src={heroImage}
                alt="AutoReach driver handing car keys back to a customer at their home in Colombo"
                width={1600}
                height={1104}
                className="w-full rounded-3xl object-cover shadow-lift"
              />
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="container px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">Three steps. Zero hassle.</h2>
            <p className="mt-3 text-muted-foreground">
              Book in under two minutes and track your vehicle the whole way through.
            </p>
          </div>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="surface-card p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-brand text-primary-foreground">
                    <s.icon className="h-5 w-5" />
                  </span>
                  <span className="font-display text-4xl font-extrabold text-accent">{i + 1}</span>
                </div>
                <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Trust badges */}
        <section className="bg-accent/50 py-16">
          <div className="container px-4">
            <h2 className="text-center font-display text-2xl font-bold text-primary sm:text-3xl">
              Built on trust, not promises
            </h2>
            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {badges.map((b) => (
                <div key={b.label} className="surface-card p-5">
                  <b.icon className="h-6 w-6 text-secondary" />
                  <h3 className="mt-3 font-display text-base font-bold">{b.label}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="container px-4 py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <h2 className="font-display text-3xl font-bold text-primary sm:text-4xl">Simple, published pricing</h2>
              <p className="mt-3 text-muted-foreground">
                Service centre costs are billed at actual and shown on your invoice. You only pay AutoReach for the
                concierge work.
              </p>
              <Button asChild variant="hero" size="lg" className="mt-6">
                <Link to={user ? "/book" : "/auth"}>
                  Start a booking <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
            <ul className="surface-card divide-y">
              {SERVICE_MENU.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-4 px-5 py-4">
                  <span className="text-sm font-semibold">{s.name}</span>
                  <span className="text-right text-sm text-muted-foreground">{s.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="container px-4 pb-16">
          <div className="rounded-3xl bg-gradient-brand px-6 py-12 text-center sm:px-12">
            <ClipboardCheck className="mx-auto h-9 w-9 text-primary-foreground/80" />
            <h2 className="mt-4 font-display text-3xl font-bold text-primary-foreground">
              We Pick Up. We Service. We Deliver.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">
              Serving Colombo and suburbs today. Kandy and Galle next.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild variant="onBrand" size="lg">
                <Link to={user ? "/book" : "/auth"}>Book a Service</Link>
              </Button>
              <Button asChild variant="outlineBrand" size="lg">
                <a href={whatsappLink("Hi AutoReach, I'd like to know more about your service.")} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <Logo showTagline />
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} AutoReach — Colombo, Sri Lanka</p>
        </div>
      </footer>
    </div>
  );
}
