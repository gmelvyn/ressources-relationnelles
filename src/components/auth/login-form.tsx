"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { AlertCircle, KeyRound, Loader2 } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifyEmailMessage, setVerifyEmailMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get('verifyEmail') === 'true') {
      setVerifyEmailMessage("Veuillez vérifier votre email avant de vous connecter. Un lien de vérification a été envoyé à votre adresse email.");
    }
  }, [searchParams]);

  const login = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setLoading(true)
    setError(null);
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
        callbackURL: "/dashboard",
      });
      if (error) {
        if (error.code === "EMAIL_NOT_VERIFIED") setError("Veuillez vérifier votre email avant de vous connecter. Un lien de vérification a été envoyé à votre adresse email.");
        else setError("Connexion échouée. Veuillez vérifier vos identifiants.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Bienvenue</CardTitle>
          <CardDescription>Connectez-vous avec votre clé d&apos;accès</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="flex flex-col gap-4">
              <Button variant="outline" className="w-full">
                <KeyRound />
                Se connecter avec une clé d&apos;accès
              </Button>
            </div>
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
              <span className="relative z-10 bg-background px-2 text-muted-foreground rounded">Ou continuer avec</span>
            </div>
            <form onSubmit={login}>
              <div className="grid gap-6">
                {error && (
                  <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                {verifyEmailMessage && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Vérification de l&apos;email requise</AlertTitle>
                    <AlertDescription>{verifyEmailMessage}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Link href="password-reset" className="ml-auto text-sm underline-offset-4 hover:underline">Mot de passe oublié ?</Link>
                  </div>
                  <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <Button type="submit" className="w-full" disabled={email === "" || password === "" || loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Se connecter"}
                </Button>
              </div>
            </form>
            <div className="text-center text-sm">
              Vous n&apos;avez pas de compte ?{" "}
              <Link href="/signup" className="underline underline-offset-4">
                S&apos;inscrire
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}