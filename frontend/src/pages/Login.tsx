import { buttonVariants } from "@/lib/constants/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Award, CheckCircle, Shield } from "lucide-react";
import { getSsoLoginUrl } from "@/lib/sso";

const features = [
  {
    icon: <Award className="h-5 w-5" />,
    title: "Digital Certificates",
    description: "Create and manage professional certificates in minutes",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Secure Verification",
    description: "Verify authenticity using tamper-resistant certificate links",
  },
  {
    icon: <CheckCircle className="h-5 w-5" />,
    title: "Easy Distribution",
    description: "Issue bulk certificates from CSV data with reliable output",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = () => {
    setLoginError(null);
    try {
      window.location.href = getSsoLoginUrl();
    } catch {
      setLoginError("SSO is not configured. Set VITE_SSO_PROJECT_ID in .env.");
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name) {
      localStorage.removeItem("user");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:px-8 lg:py-14">
        <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <img src="/img/logo.png" alt="Logo" className="h-11 w-11 rounded-lg border border-primary/20" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/80">ITC Web Team</p>
              <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">Certificate Portal</h1>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Build, validate, and distribute institutional certificates with a consistent rendering pipeline.
            The preview and generated output stay aligned across browsers and screen sizes.
          </p>

          <div className="mt-8 space-y-3">
            {loginError ? <p className="text-sm text-destructive">{loginError}</p> : null}
            <button
              onClick={handleLogin}
              className={buttonVariants({
                size: "lg",
                className: "h-12 w-full justify-center gap-2 text-base font-semibold sm:w-auto sm:px-8",
              })}
            >
              Login with SSO
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-xl border border-border/70 bg-muted/30 p-4">
                <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{feature.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-primary/80">Live Example</h2>
            <span className="rounded-full border border-accent/40 bg-accent/20 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
              Blue & Gold Theme
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <img
              src="/img/certificate.png"
              alt="Certificate preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="mt-4 rounded-xl border border-border/70 bg-muted/30 p-4">
            <p className="text-sm text-foreground">Ready for organizers and departments.</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Use CSV imports, dynamic fields, and server-side rendering to generate high-volume certificates with consistent typography and placement.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}