"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();

  const verifyEmailMessage =
    searchParams.get("verifyEmail") === "true"
      ? "Veuillez vérifier votre email avant de vous connecter. Un lien de vérification a été envoyé à votre adresse email."
      : null;

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onChange: z.object({
        email: z.string().email("Email invalide"),
        password: z.string().min(1, "Mot de passe requis"),
        rememberMe: z.boolean(),
      }),
    },
    onSubmit: async ({ value }) => {
      setLoading(true);
      setError(null);
      try {
        const { error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
          callbackURL: "/dashboard",
        });
        if (error) {
          if (error.code === "EMAIL_NOT_VERIFIED")
            setError(
              "Veuillez vérifier votre email avant de vous connecter. Un lien de vérification a été envoyé à votre adresse email.",
            );
          else
            setError("Connexion échouée. Veuillez vérifier vos identifiants.");
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
          <CardTitle className="text-xl">Bienvenue</CardTitle>
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
                  <div className="bg-destructive/15 text-destructive p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}
                {verifyEmailMessage && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>
                      Vérification de l&apos;email requise
                    </AlertTitle>
                    <AlertDescription>{verifyEmailMessage}</AlertDescription>
                  </Alert>
                )}

                <form.Field
                  name="email"
                  children={(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Email</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="email"
                        placeholder="m@example.com"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={
                          field.state.meta.errors.length > 0
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {field.state.meta.errors ? (
                        <p className="text-xs text-destructive">
                          {field.state.meta.errors.join(", ")}
                        </p>
                      ) : null}
                    </div>
                  )}
                />

                <form.Field
                  name="password"
                  children={(field) => (
                    <div className="grid gap-2">
                      <div className="flex items-center">
                        <Label htmlFor={field.name}>Mot de passe</Label>
                        <Link
                          href="password-reset"
                          className="ml-auto text-sm underline-offset-4 hover:underline"
                        >
                          Mot de passe oublié ?
                        </Link>
                      </div>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        className={
                          field.state.meta.errors.length > 0
                            ? "border-destructive"
                            : ""
                        }
                      />
                      {field.state.meta.errors ? (
                        <p className="text-xs text-destructive">
                          {field.state.meta.errors.join(", ")}
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
                      disabled={!canSubmit || loading || isSubmitting}
                    >
                      {loading || isSubmitting ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        "Se connecter"
                      )}
                    </Button>
                  )}
                />
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
  );
}
