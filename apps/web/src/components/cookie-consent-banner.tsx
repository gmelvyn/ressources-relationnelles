"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const consentCookie = "rrb_cookie_consent";

function setConsent(value: "accepted" | "refused") {
  document.cookie = `${consentCookie}=${value}; path=/; max-age=31536000; SameSite=Lax`;
}

function hasConsentCookie() {
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .some((part) => part.startsWith(`${consentCookie}=`));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setVisible(!hasConsentCookie());
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2147483647] border-t bg-background shadow-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="max-w-3xl text-muted-foreground">
          Nous utilisons uniquement les cookies nécessaires au fonctionnement du service et au suivi de votre consentement.
        </p>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setConsent("refused");
              setVisible(false);
            }}
          >
            Refuser
          </Button>
          <Button
            type="button"
            onClick={() => {
              setConsent("accepted");
              setVisible(false);
            }}
          >
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
