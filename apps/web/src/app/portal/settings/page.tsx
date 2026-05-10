"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "@tanstack/react-form";

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "";
  const lastName = session?.user?.name?.split(" ").slice(1).join(" ") || "";

  const profileForm = useForm({
    defaultValues: {
      username: session?.user?.email || "",
      bio: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Saving profile:", value);
      // Implementation placeholder
    },
  });

  const accountForm = useForm({
    defaultValues: {
      firstName,
      lastName,
      password: "",
    },
    onSubmit: async ({ value }) => {
      console.log("Saving account:", value);
      // Implementation placeholder
    },
  });

  const notificationsForm = useForm({
    defaultValues: {
      emailNotifs: true,
      pushNotifs: true,
      marketingNotifs: false,
    },
    onSubmit: async ({ value }) => {
      console.log("Saving notifications:", value);
      // Implementation placeholder
    },
  });

  return (
    <div className="container mx-auto max-w-4xl py-6">
      <div className="mb-6 flex items-center space-x-4">
        <Link href="/portal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Paramètres</h1>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Settings */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              profileForm.handleSubmit();
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Informations publiques</CardTitle>
                <CardDescription>
                  Ces informations seront visibles par les autres utilisateurs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <profileForm.Field
                  name="username"
                  children={(field) => (
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor={field.name}>Pseudo</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="@monpseudo"
                      />
                    </div>
                  )}
                />
                <profileForm.Field
                  name="bio"
                  children={(field) => (
                    <div className="grid w-full items-center gap-1.5">
                      <Label htmlFor={field.name}>Bio</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>
                  )}
                />
              </CardContent>
              <CardFooter>
                <profileForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enregistrer"}
                    </Button>
                  )}
                />
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4 mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              accountForm.handleSubmit();
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Informations personnelles</CardTitle>
                <CardDescription>
                  Gérez vos informations de connexion et de contact.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <accountForm.Field
                    name="firstName"
                    children={(field) => (
                      <div className="grid gap-1.5">
                        <Label htmlFor={field.name}>Prénom</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  />
                  <accountForm.Field
                    name="lastName"
                    children={(field) => (
                      <div className="grid gap-1.5">
                        <Label htmlFor={field.name}>Nom</Label>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session?.user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <Separator />
                <accountForm.Field
                  name="password"
                  children={(field) => (
                    <div className="grid gap-1.5">
                      <Label htmlFor={field.name}>Nouveau mot de passe</Label>
                      <Input
                        id={field.name}
                        name={field.name}
                        type="password"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                />
              </CardContent>
              <CardFooter>
                <accountForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Mettre à jour le compte"}
                    </Button>
                  )}
                />
              </CardFooter>
            </Card>
          </form>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              notificationsForm.handleSubmit();
            }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Préférences de notifications</CardTitle>
                <CardDescription>
                  Choisissez comment vous souhaitez être informé.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <notificationsForm.Field
                  name="emailNotifs"
                  children={(field) => (
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor={field.name} className="flex flex-col space-y-1">
                        <span>Notifications par email</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Recevoir un email pour les activités importantes.
                        </span>
                      </Label>
                      <Switch
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked)}
                      />
                    </div>
                  )}
                />
                <Separator />
                <notificationsForm.Field
                  name="pushNotifs"
                  children={(field) => (
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor={field.name} className="flex flex-col space-y-1">
                        <span>Notifications push</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Recevoir des alertes sur votre appareil.
                        </span>
                      </Label>
                      <Switch
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked)}
                      />
                    </div>
                  )}
                />
                <Separator />
                <notificationsForm.Field
                  name="marketingNotifs"
                  children={(field) => (
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor={field.name} className="flex flex-col space-y-1">
                        <span>Actualités de la plateforme</span>
                        <span className="font-normal text-xs text-muted-foreground">
                          Recevoir les dernières nouvelles et mises à jour.
                        </span>
                      </Label>
                      <Switch
                        id={field.name}
                        checked={field.state.value}
                        onCheckedChange={(checked) => field.handleChange(checked)}
                      />
                    </div>
                  )}
                />
              </CardContent>
              <CardFooter>
                <notificationsForm.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                  children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" variant="outline" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enregistrer les préférences"}
                    </Button>
                  )}
                />
              </CardFooter>
            </Card>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
