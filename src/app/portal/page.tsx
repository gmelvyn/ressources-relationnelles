import { PortalHeader } from "@/components/layout/portal-header";
import { PortalSidebar } from "@/components/layout/portal-sidebar";
import { Feed } from "@/components/portal/feed";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export default async function PortalHome() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: {
        select: {
          name: true,
          email: true,
          image: true,
          username: true,
        },
      },
    },
  });

  // Mapper les données pour correspondre au format attendu par Feed
  // Prisma retourne un objet Date, que l'on peut passer directement aux Client Components depuis Next.js 13+
  // Cependant, pour éviter les soucis de sérialisation "Plain Object", on s'assure que tout est propre.
  // Next.js gère bien les Dates maintenant, mais par précaution je le passe tel quel.

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PortalHeader />

      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[250px_1fr] lg:grid-cols-[250px_1fr_300px]">
        <PortalSidebar />

        {/* Main Feed */}
        <main className="flex w-full max-w-[600px] flex-col gap-6 mx-auto">
          <Feed
            initialPosts={posts}
            currentUser={session?.user}
          />
        </main>

        {/* Right Sidebar (Trending) */}
        <aside className="hidden lg:block">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-base">Tendances en France</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">#ServicePublic</p>
                <p className="text-xs text-muted-foreground">2.5k posts</p>
              </div>
              <Separator />
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">#Ecologie</p>
                <p className="text-xs text-muted-foreground">1.8k posts</p>
              </div>
              <Separator />
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">#Education</p>
                <p className="text-xs text-muted-foreground">940 posts</p>
              </div>
              <Separator />
              <div className="grid gap-1">
                <p className="text-sm font-medium leading-none">Mairie de Lyon</p>
                <p className="text-xs text-muted-foreground">Tendance locale</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="link" className="w-full px-0">
                Voir plus
              </Button>
            </CardFooter>
          </Card>
        </aside>
      </div>
    </div>
  );
}