"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { authClient } from "@/lib/auth-client";
import {
  ArrowLeft,
  Calendar,
  Edit2,
  MapPin,
  MessageSquare,
  MoreHorizontal,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Post = {
  id: string;
  content: string;
  image: string | null;
  createdAt: string;
  author: { id: string; name: string; email: string; image: string | null };
};

type LikedResource = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  createdAt: string;
};

type UserResource = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl: string | null;
  status: string;
  visibility: string;
  createdAt: string;
  category: { name: string; color: string };
};

type Comment = {
  id: string;
  content: string;
  createdAt: string;
  resource: { id: string; title: string; slug: string };
};

export default function ProfilePage() {
  const { data: session } = authClient.useSession();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [likedResources, setLikedResources] = useState<LikedResource[]>([]);
  const [userComments, setUserComments] = useState<Comment[]>([]);
  const [userResources, setUserResources] = useState<UserResource[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    fetch(`/api/posts?userId=${session.user.id}`)
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUserPosts(data))
      .catch(() => {});
    fetch("/api/me/likes")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setLikedResources(data))
      .catch(() => {});
    fetch("/api/me/comments")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUserComments(data))
      .catch(() => {});
    fetch("/api/me/resources")
      .then((r) => r.json())
      .then((data) => Array.isArray(data) && setUserResources(data))
      .catch(() => {});
  }, [session?.user?.id]);

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
          <h1 className="text-xl font-bold">
            {session?.user?.name ?? "Chargement..."}
          </h1>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="overflow-hidden">
        {/* Cover Image Placeholder */}
        <div className="h-32 w-full bg-linear-to-r from-blue-500 to-red-500 md:h-48"></div>

        <CardContent className="relative pt-0">
          <div className="flex justify-between items-end -mt-12 mb-4 px-2">
            <Avatar className="h-24 w-24 border-4 border-background md:h-32 md:w-32">
              <AvatarImage
                src={session?.user?.image ?? ""}
                alt={session?.user?.name ?? ""}
              />
              <AvatarFallback className="text-2xl">
                {session?.user?.name
                  ? session.user.name.slice(0, 2).toUpperCase()
                  : "UA"}
              </AvatarFallback>
            </Avatar>
            <Link href="/portal/settings">
              <Button variant="outline" size="sm" className="mb-2">
                <Edit2 className="mr-2 h-4 w-4" /> Editer le profil
              </Button>
            </Link>
          </div>

          <div className="space-y-1 px-2">
            <h2 className="text-2xl font-bold">
              {session?.user?.name ?? "Invité"}
            </h2>
            <p className="text-muted-foreground">
              {session?.user?.email ?? ""}
            </p>
          </div>

          <div className="mt-4 px-2">
            <p className="text-sm">
              {(session?.user as { bio?: string })?.bio || ""}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Tabs */}
      <div className="mt-6">
        <Tabs defaultValue="resources" className="w-full">
          <TabsList className="w-full justify-start border-b bg-transparent p-0">
            <TabsTrigger
              value="resources"
              className="rounded-none border-b-2 border-transparent px-6 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
            >
              Ressources
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

          <TabsContent value="resources" className="mt-4 space-y-4">
            {userResources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="flex items-start gap-4 p-4">
                  {resource.imageUrl && (
                    <img
                      src={resource.imageUrl}
                      alt=""
                      className="h-16 w-16 rounded-md object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/resources/${resource.slug}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {resource.title}
                      </Link>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: resource.category.color }}
                      >
                        {resource.category.name}
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          resource.status === "PUBLISHED"
                            ? "bg-green-100 text-green-700"
                            : resource.status === "PENDING_REVIEW"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {resource.status === "PUBLISHED"
                          ? "Publié"
                          : resource.status === "PENDING_REVIEW"
                            ? "En attente"
                            : resource.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {resource.summary}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(resource.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            {userResources.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                Aucune ressource proposée pour le moment.
              </div>
            )}
          </TabsContent>

          <TabsContent value="posts" className="mt-4 space-y-4">
            {userPosts.map((post) => (
              <Card key={post.id} className="overflow-hidden">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4 pb-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.image ?? ""} />
                    <AvatarFallback>
                      {post.author.name?.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {post.author.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {post.author.email}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8 rounded-full"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="whitespace-pre-wrap text-sm">{post.content}</p>
                  {post.image && (
                    <img
                      src={post.image}
                      alt=""
                      className="mt-2 rounded-md max-h-80 object-cover w-full"
                    />
                  )}
                </CardContent>
                <CardFooter className="border-t p-2">
                  <div className="flex w-full justify-end gap-1 px-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <span>❤️</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
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

          <TabsContent value="replies" className="mt-4 space-y-4">
            {userComments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="p-4">
                  <div className="mb-1 text-xs text-muted-foreground">
                    Commentaire sur{" "}
                    <Link
                      href={`/resources/${comment.resource.slug}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {comment.resource.title}
                    </Link>
                    {" · "}
                    {formatDistanceToNow(new Date(comment.createdAt), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </div>
                  <p className="text-sm whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </CardContent>
              </Card>
            ))}
            {userComments.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                Aucun commentaire pour le moment.
              </div>
            )}
          </TabsContent>

          <TabsContent value="likes" className="mt-4 space-y-4">
            {likedResources.map((resource) => (
              <Card key={resource.id}>
                <CardContent className="flex items-start gap-4 p-4">
                  {resource.imageUrl && (
                    <img
                      src={resource.imageUrl}
                      alt=""
                      className="h-16 w-16 rounded-md object-cover shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/resources/${resource.slug}`}
                      className="font-semibold text-sm hover:underline line-clamp-1"
                    >
                      {resource.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {resource.summary}
                    </p>
                  </div>
                  <span className="text-lg shrink-0">❤️</span>
                </CardContent>
              </Card>
            ))}
            {likedResources.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">
                Vous n'avez pas encore aimé de ressources.
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
