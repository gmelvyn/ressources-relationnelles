"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

type ShareResourceButtonProps = {
  resourceId: string;
  title: string;
  url: string;
};

export function ShareResourceButton({ resourceId, title, url }: ShareResourceButtonProps) {
  const [status, setStatus] = useState<"idle" | "sharing" | "shared">("idle");

  async function copyToClipboard(value: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    document.body.removeChild(input);
  }

  async function share() {
    setStatus("sharing");
    const shareUrl = new URL(url, window.location.origin).toString();

    try {
      if (navigator.share) {
        await navigator.share({ title, url: shareUrl });
      } else {
        await copyToClipboard(shareUrl);
      }

      setStatus("shared");

      fetch("/api/resources/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resourceId }),
      }).catch(() => undefined);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant="outline" className="w-full" onClick={share} disabled={status === "sharing"}>
        <Share2 className="size-4" />
        {status === "sharing" ? "Partage..." : "Partager"}
      </Button>
      {status === "shared" ? (
        <p className="text-xs text-muted-foreground">Lien de partage généré.</p>
      ) : null}
    </div>
  );
}
