"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import { ArrowLeft, Calendar, Edit2, MapPin, MessageSquare, MoreHorizontal, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ProfilePage() {
  const { data: session } = authClient.useSession();

  const [userPosts] = useState([
    {
      id: 1,
      author: session?.user?.name ?? "Jean Dupont",
      username: session?.user?.email ?? "@jdupont",
      avatar: session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "JD",
      content: "Je viens de rejoindre RESources Relationnelles ! Hâte d'échanger avec vous sur les initiatives locales.",
      timestamp: "Il y a 2 jours",
      likes: 5,
      comments: 1,
    },
    // We can add more placeholder posts or fetch real ones later
  ]);

  return (
    <div className="container mx-auto max-w-4xl py-6">
      {/* Header with Back Button */}
      <div className="mb-4 flex items-center space-x-4">
        <Link href="/portal">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">{session?.user?.name ?? "Chargement..."}</h1>
          <p className="text-xs text-muted-foreground">{userPosts.length} posts</p>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        {/* Cover Image Placeholder */}
        <div className="h-32 w-full bg-linear-to-r from-blue-500 to-red-500 md:h-48"></div>

        <CardContent className="relative pt-0">
          <div className="flex justify-between items-end -mt-12 mb-4 px-2">
            <Avatar className="h-24 w-24 border-4 border-background md:h-32 md:w-32">
              <AvatarImage src={session?.user?.image ?? ""} alt={session?.user?.name ?? ""} />
              <AvatarFallback className="text-2xl">{session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "UA"}</AvatarFallback>
            </Avatar>
            <Link href="/portal/settings">
              <Button variant="outline" size="sm" className="mb-2">
                <Edit2 className="mr-2 h-4 w-4" /> Editer le profil
              </Button>
            </Link>
          </div>

          <div className="space-y-1 px-2">
            <h2 className="text-2xl font-bold">{session?.user?.name ?? "Invité"}</h2>
            <p className="text-muted-foreground">{session?.user?.email ?? ""}</p>
          </div>

          <div className="mt-4 px-2">
            <p className="text-sm">
              Citoyen engagé pour une ville plus verte et solidaire. Passionné par l'urbanisme et la participation citoyenne.
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 px-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Paris, France</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>A rejoint en Janvier 2026</span>
            </div>
          </div>

          <div className="mt-4 flex gap-4 px-2 text-sm">
            <div className="flex gap-1">
              <span className="font-bold">128</span>
              <span className="text-muted-foreground">Abonnements</span>
            </div>
            <div className="flex gap-1">
              <span className="font-bold">256</span>
              <span className="text-muted-foreground">Abonnés</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger
              value="posts"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Posts
            </TabsTrigger>
            <TabsTrigger
              value="replies"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Réponses
            </TabsTrigger>
            <TabsTrigger
              value="likes"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              J'aime
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-4 space-y-4">
            {userPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4 pb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{post.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{post.author}</span>
                      <span className="text-xs text-muted-foreground">{post.username}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{post.timestamp}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 rounded-full">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                </CardContent>
                <CardFooter className="border-t p-2">
                  <div className="flex w-full justify-end gap-1 px-2">
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <span>❤️</span>
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground">
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
            {userPosts.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                Aucun post pour le moment.
              </div>
            )}
          </TabsContent>

          <TabsContent value="replies" className="mt-4">
            <div className="py-12 text-center text-muted-foreground">
              Aucune réponse pour le moment.
            </div>
          </TabsContent>

          <TabsContent value="likes" className="mt-4">
            <div className="py-12 text-center text-muted-foreground">
              Vous n'avez pas encore aimé de posts.
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}