import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/lib/constants/button";
import { getSsoLoginUrl } from "@/lib/sso";

export default function Login() {
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name || user.roll) {
      navigate("/my-certificates", { replace: true });
    }
  }, [navigate]);

  const handleLogin = () => {
    setLoginError(null);
    try {
      window.location.href = getSsoLoginUrl();
    } catch {
      setLoginError("SSO is not configured. Set VITE_SSO_PROJECT_ID in .env.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        <div className="space-y-3">
          <img
            src="/img/logo.png"
            alt="Logo"
            className="mx-auto h-14 w-14 rounded-xl border border-primary/20"
          />
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Certificate Portal
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Access, download, and share your institutional certificates.
          </p>
        </div>

        <div className="space-y-3">
          {loginError && (
            <p className="text-sm text-destructive">{loginError}</p>
          )}
          <button
            onClick={handleLogin}
            className={buttonVariants({
              size: "lg",
              className: "h-12 w-full justify-center gap-2 text-base font-semibold",
            })}
          >
            Sign in with SSO
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground/70">
          Powered by ITC Web Team, IIT Bombay
        </p>
      </div>
    </div>
  );
}
