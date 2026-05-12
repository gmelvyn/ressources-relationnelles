"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { useForm } from "@tanstack/react-form";

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères")
  .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
  .regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
  .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre")
  .regex(
    /[^A-Za-z0-9]/,
    "Le mot de passe doit contenir au moins un caractère spécial",
  );

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const calculatePasswordStrength = (password: string) => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (/[A-Z]/.test(password)) strength += 20;
    if (/[a-z]/.test(password)) strength += 20;
    if (/[0-9]/.test(password)) strength += 20;
    if (/[^A-Za-z0-9]/.test(password)) strength += 20;
    return strength;
  };

  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "bg-red-500";
    if (strength < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    },
    validators: {
      onChange: z
        .object({
          email: z.string().email("Email invalide"),
          password: passwordSchema,
          confirmPassword: z.string(),
          name: z.string().min(1, "Le pseudonyme est requis"),
        })
        .refine((data) => data.password === data.confirmPassword, {
          message: "Les mots de passe ne correspondent pas",
          path: ["confirmPassword"],
        }),
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      setError(null);
      try {
        const { error } = await authClient.signUp.email({
          email: value.email,
          password: value.password,
          name: value.name,
          callbackURL: "/dashboard",
          fetchOptions: {
            onSuccess: () => {
              router.push("/dashboard");
            },
          },
        });
        if (error) {
          setError("Une erreur est survenue lors de l'inscription");
        }
      } finally {
        setLoading(false);
      }
    },
  });

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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
              }}
            >
              <div className="grid gap-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <form.Field
                  name="name"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Pseudonyme</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="text"
                        placeholder="Votre pseudonyme"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={
                          field.state.meta.isTouched &&
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 ? (
                        <p className="text-xs text-red-500">
                          {field.state.meta.errors
                            .map((e) =>
                              typeof e === "string" ? e : e?.message,
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                />
                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="m@exemple.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={
                          field.state.meta.isTouched &&
                          field.state.meta.errors.length > 0
                            ? "border-red-500"
                            : ""
                        }
                      />
                      {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 ? (
                        <p className="text-xs text-red-500">
                          {field.state.meta.errors
                            .map((e) =>
                              typeof e === "string" ? e : e?.message,
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                />

                <form.Field
                  name="password"
                  children={(field) => {
                    const strength = calculatePasswordStrength(
                      field.state.value,
                    );
                    return (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>Mot de passe</Label>
                        <div className="relative">
                          <Input
                            id={field.name}
                            name={field.name}
                            type={showPassword ? "text" : "password"}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={
                              field.state.meta.isTouched &&
                              field.state.meta.errors.length > 0
                                ? "border-red-500 pr-10"
                                : "pr-10"
                            }
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                              {showPassword
                                ? "Masquer le mot de passe"
                                : "Afficher le mot de passe"}
                            </span>
                          </Button>
                        </div>

                        {field.state.value && (
                          <div className="mt-2 space-y-2">
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span>Force du mot de passe</span>
                                <span>
                                  {strength < 40
                                    ? "Faible"
                                    : strength < 80
                                      ? "Moyen"
                                      : "Fort"}
                                </span>
                              </div>
                              <Progress
                                value={strength}
                                className={`h-1 ${getStrengthColor(strength)}`}
                              />
                            </div>

                            {field.state.meta.isTouched &&
                              field.state.meta.errors.length > 0 && (
                                <ul className="text-sm text-red-500 space-y-1 list-disc pl-5">
                                  {field.state.meta.errors.map(
                                    (error, index) => (
                                      <li key={index}>
                                        {typeof error === "string"
                                          ? error
                                          : (error?.message ??
                                            "Champ invalide")}
                                      </li>
                                    ),
                                  )}
                                </ul>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  }}
                />

                <form.Field
                  name="confirmPassword"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>
                        Confirmer le mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id={field.name}
                          name={field.name}
                          type={showConfirmPassword ? "text" : "password"}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className={
                            field.state.meta.isTouched &&
                            field.state.meta.errors.length > 0
                              ? "border-red-500 pr-10"
                              : "pr-10"
                          }
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                          <span className="sr-only">
                            {showConfirmPassword
                              ? "Masquer le mot de passe"
                              : "Afficher le mot de passe"}
                          </span>
                        </Button>
                      </div>
                      {field.state.meta.isTouched &&
                      field.state.meta.errors.length > 0 ? (
                        <p className="text-sm text-red-500 mt-1">
                          {field.state.meta.errors
                            .map((e) =>
                              typeof e === "string" ? e : e?.message,
                            )
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                />

                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canSubmit || isSubmitting || loading}
                    >
                      {loading || isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "S'inscrire"
                      )}
                    </Button>
                  )}
                />
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
  );
}
