import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { fetchSsoUserData, ssoErrorMessage } from "@/lib/sso";

export function useSsoReturn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const sessionKey = searchParams.get("accessid");
    if (!sessionKey) {
      setError("No session key provided");
      const t = setTimeout(() => navigate("/"), 3000);
      return () => clearTimeout(t);
    }

    (async () => {
      try {
        const userData = await fetchSsoUserData(sessionKey);
        if (cancelled) return;
        localStorage.setItem("user", JSON.stringify(userData));
        navigate("/my-certificates", { replace: true });
      } catch (err) {
        if (cancelled) return;
        setError(ssoErrorMessage(err));
        setTimeout(() => navigate("/"), 3000);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams]);

  return error;
}
