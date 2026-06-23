import Link from "next/link";
import {
  BookOpenCheck,
  LayoutDashboard,
  LogOutIcon,
  UserRound,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { canModerate, hasRequiredSensitiveAuth } from "@/lib/permissions";
import type { CurrentUser } from "@/lib/session";

type SiteHeaderProps = {
  user?: CurrentUser | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-lg bg-teal-700 text-white">
            <BookOpenCheck className="size-5" />
          </span>
          <span className="hidden font-display text-lg sm:inline">
            (RE)Sources Relationnelles
          </span>
          <span className="font-display text-lg sm:hidden">Ressources</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button asChild variant="ghost">
            <Link href="/resources">Catalogue</Link>
          </Button>

          <Button asChild variant="ghost">
            <Link href="/help">Aide</Link>
          </Button>
          {user && canModerate(user.role) && (
            <Button asChild variant="ghost">
              <Link
                href={
                  hasRequiredSensitiveAuth(user.role, user.twoFactorEnabled)
                    ? "/admin"
                    : "/dashboard/settings?security=2fa-required"
                }
              >
                Administration
              </Link>
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <>
              <Button
                asChild
                variant="outline"
                className="hidden sm:inline-flex"
              >
                <Link href="/dashboard">
                  <LayoutDashboard className="size-4" />
                  Tableau de bord
                </Link>
              </Button>
              <Button asChild size="icon" aria-label="Profil">
                <Link href="/dashboard/profile">
                  <UserRound className="size-4" />
                </Link>
              </Button>
              <Button
                variant="link"
                color="red"
                size="icon"
                aria-label="Déconnexion"
              >
                <Link href="/login">
                  <LogOutIcon color="red" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Connexion</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Créer un compte</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
