import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { ResourceForm } from "@/components/resources/resource-form";
import { getCatalogMeta } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function NewResourcePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const meta = await getCatalogMeta();

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader user={user} />
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/resources">
            <ArrowLeft className="size-4" />
            Retour au catalogue
          </Link>
        </Button>
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Contribution citoyenne</p>
          <h1 className="mt-2 text-3xl font-semibold">Proposer une ressource</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Les ressources publiques et partagées sont soumises à validation avant publication.
          </p>
        </div>
        <ResourceForm meta={meta} />
      </div>
    </main>
  );
}
