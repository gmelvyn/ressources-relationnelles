"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { z } from "zod"

// Password validation schema
const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(/[^A-Za-z0-9]/, "Le mot de passe doit contenir au moins un caractère spécial")

export function SignUpForm({ className, ...props }: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter()

  const validatePassword = (password: string) => {
    try {
      passwordSchema.parse(password)
      setPasswordErrors([])
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        setPasswordErrors(error.issues.map((e) => e.message))
      }
      return false
    }
  }

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0

    let strength = 0

    // Length check
    if (password.length >= 8) strength += 20

    // Character type checks
    if (/[A-Z]/.test(password)) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 20
    if (/[^A-Za-z0-9]/.test(password)) strength += 20

    return strength
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    setPasswordStrength(calculatePasswordStrength(newPassword))
    if (newPassword) {
      validatePassword(newPassword)
    } else {
      setPasswordErrors([])
    }
  }

  const getStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 80) return "bg-yellow-500"
    return "bg-green-500"
  }

  const register = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!validatePassword(password)) {
      setLoading(false)
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      setLoading(false);
      return;
    }

    try {
      const { error } = await authClient.signUp.email({
        email,
        password,
        name: email.split("@")[0],
        callbackURL: "/portal",
        fetchOptions: {
          onSuccess: () => {
            router.push("/portal")
          }
        }
      });
      if (error) {
        setError("Une erreur est survenue lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Créer un compte</CardTitle>
          <CardDescription>Inscrivez-vous avec votre email</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border"></div>
            <form onSubmit={register}>
              <div className="grid gap-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="m@exemple.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={handlePasswordChange}
                      className={passwordErrors.length > 0 ? "border-red-500 pr-10" : "pr-10"}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}</span>
                    </Button>
                  </div>

                  {password && (
                    <div className="mt-2 space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Force du mot de passe</span>
                          <span>{passwordStrength < 40 ? "Faible" : passwordStrength < 80 ? "Moyen" : "Fort"}</span>
                        </div>
                        <Progress value={passwordStrength} className={`h-1 ${getStrengthColor()}`} />
                      </div>

                      {passwordErrors.length > 0 && (
                        <ul className="text-sm text-red-500 space-y-1 list-disc pl-5">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={
                        password && confirmPassword && password !== confirmPassword ? "border-red-500 pr-10" : "pr-10"
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}</span>
                    </Button>
                  </div>
                  {password && confirmPassword && password !== confirmPassword && (
                    <p className="text-sm text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    !email ||
                    !password ||
                    !confirmPassword ||
                    password !== confirmPassword ||
                    passwordErrors.length > 0 ||
                    loading
                  }
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "S'inscrire"}
                </Button>
              </div>
            </form>
            <div className="text-center text-sm">
              Vous avez déjà un compte?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Se connecter
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}