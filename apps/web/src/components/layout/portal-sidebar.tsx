import { Button } from "@/components/ui/button";
import { Bell, Bookmark, Home, Search, User } from "lucide-react";
import Link from "next/link";

export function PortalSidebar() {
  return (
    <aside className="sticky top-20 hidden self-start flex-col space-y-4 md:flex">
      <nav className="grid gap-2 text-sm font-medium">
        <Link href="/portal">
          <Button variant="secondary" className="w-full justify-start">
            <Home className="mr-2 h-4 w-4" />
            Fil d'actualité
          </Button>
        </Link>
        <Link href="/portal/explore">
          <Button variant="ghost" className="w-full justify-start">
            <Search className="mr-2 h-4 w-4" />
            Explorer
          </Button>
        </Link>
        <Link href="/portal/saved">
          <Button variant="ghost" className="w-full justify-start">
            <Bookmark className="mr-2 h-4 w-4" />
            Enregistrés
          </Button>
        </Link>
        <Link href="/portal/profile">
          <Button variant="ghost" className="w-full justify-start">
            <User className="mr-2 h-4 w-4" />
            Profil
          </Button>
        </Link>
      </nav>
    </aside>
  );
}
