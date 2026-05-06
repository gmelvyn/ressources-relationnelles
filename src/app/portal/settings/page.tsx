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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session } = authClient.useSession();
  const firstName = session?.user?.name?.split(" ")[0] || "";
  const lastName = session?.user?.name?.split(" ").slice(1).join(" ") || "";

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
          <Card>
            <CardHeader>
              <CardTitle>Informations publiques</CardTitle>
              <CardDescription>
                Ces informations seront visibles par les autres utilisateurs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="username">Pseudo</Label>
                <Input 
                  id="username" 
                  placeholder="@monpseudo" 
                  defaultValue={session?.user?.email || ""}
                />
              </div>
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" placeholder="Parlez-nous de vous..." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Enregistrer</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
              <CardDescription>
                Gérez vos informations de connexion et de contact.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="firstname">Prénom</Label>
                  <Input 
                    id="firstname" 
                    defaultValue={firstName}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="lastname">Nom</Label>
                  <Input 
                    id="lastname" 
                    defaultValue={lastName}
                  />
                </div>
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
              <div className="grid gap-1.5">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input id="password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Mettre à jour le compte</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notifications</CardTitle>
              <CardDescription>
                Choisissez comment vous souhaitez être informé.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-notifs" className="flex flex-col space-y-1">
                  <span>Notifications par email</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Recevoir un email pour les activités importantes.
                  </span>
                </Label>
                <Switch id="email-notifs" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="push-notifs" className="flex flex-col space-y-1">
                  <span>Notifications push</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Recevoir des alertes sur votre appareil.
                  </span>
                </Label>
                <Switch id="push-notifs" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="marketing-notifs" className="flex flex-col space-y-1">
                  <span>Actualités de la plateforme</span>
                  <span className="font-normal text-xs text-muted-foreground">
                    Recevoir les dernières nouvelles et mises à jour.
                  </span>
                </Label>
                <Switch id="marketing-notifs" />
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline">Enregistrer les préférences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
