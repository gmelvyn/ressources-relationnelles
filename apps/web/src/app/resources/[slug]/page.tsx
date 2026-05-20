import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink, MessageCircle, ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/layout/site-header";
import { CommentForm } from "@/components/resources/comment-form";
import { ResourceProgressActions } from "@/components/resources/resource-progress-actions";
import { ShareResourceButton } from "@/components/resources/share-resource-button";
import { getResourceAccessBySlug, getResourceComments } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type ResourcePageProps = {
  params: Promise<{ slug: string }>;
};

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function youtubeEmbedUrl(url?: string | null) {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    const videoId =
      parsedUrl.hostname === "youtu.be"
        ? parsedUrl.pathname.slice(1)
        : parsedUrl.searchParams.get("v");

    if (!videoId || !parsedUrl.hostname.includes("youtube")) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const user = await getCurrentUser();
  const access = await getResourceAccessBySlug(slug, user?.id);
  const resource = access.resource;

  if (!resource && access.accessDenied) {
    redirect(`/login?callbackUrl=/resources/${slug}`);
  }

  if (!resource) {
    notFound();
  }

  const comments = await getResourceComments(resource.id);
  const embedUrl = youtubeEmbedUrl(resource.sourceUrl);

  return (
    <main className="min-h-screen bg-background">
      <SiteHeader user={user} />

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/resources">
            <ArrowLeft className="size-4" />
            Retour au catalogue
          </Link>
        </Button>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <article>
            <div className="flex flex-wrap items-center gap-2">
              <Badge style={{ backgroundColor: resource.category.color }} className="text-white">
                {resource.category.name}
              </Badge>
              <Badge variant="secondary">{resource.type.name}</Badge>
              <Badge variant="outline">{resource.visibility === "PUBLIC" ? "Public" : "Restreint"}</Badge>
            </div>

            <h1 className="mt-5 text-4xl font-semibold leading-tight">{resource.title}</h1>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{resource.summary}</p>

            <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {resource.durationMinutes ? (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {resource.durationMinutes} minutes
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <MessageCircle className="size-4" />
                {resource.commentsCount} échanges
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-4" />
                Ressource modérée
              </span>
            </div>

            <div className="mt-8 rounded-lg border bg-card p-6 leading-8 shadow-sm">
              {resource.imageUrl ? (
                <div className="relative mb-6 aspect-video overflow-hidden rounded-md border bg-muted">
                  <Image
                    src={resource.imageUrl}
                    alt={resource.title}
                    fill
                    sizes="(min-width: 1024px) 680px, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              ) : null}
              {embedUrl ? (
                <div className="mb-6 aspect-video overflow-hidden rounded-md border bg-muted">
                  <iframe
                    src={embedUrl}
                    title={resource.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              ) : null}
              {resource.content.split("\n").map((paragraph, index) => (
                <p key={`${resource.slug}-${index}`} className="mb-4 last:mb-0">
                  {paragraph}
                </p>
              ))}
              {resource.sourceUrl ? (
                <Button asChild variant="outline" className="mt-6">
                  <a href={resource.sourceUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                    Ouvrir la source
                  </a>
                </Button>
              ) : null}
            </div>

            <section id="echanges" className="mt-10 space-y-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Echanges</p>
                <h2 className="mt-2 text-2xl font-semibold">Commentaires modérés</h2>
              </div>
              <CommentForm resourceId={resource.id} slug={resource.slug} isAuthenticated={Boolean(user)} />

              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="rounded-lg border bg-card p-4">
                    <div className="flex gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={comment.author.image ?? ""} />
                        <AvatarFallback>{initials(comment.author.name)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{comment.author.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(comment.createdAt)}
                          </p>
                        </div>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
                        {comment.replies.length ? (
                          <div className="mt-4 space-y-3 border-l pl-4">
                            {comment.replies.map((reply) => (
                              <div key={reply.id}>
                                <p className="text-sm font-medium">{reply.author.name}</p>
                                <p className="mt-1 text-sm leading-6 text-muted-foreground">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
                {comments.length === 0 ? (
                  <div className="rounded-lg border bg-muted/40 p-5 text-sm text-muted-foreground">
                    Aucun échange n'a encore été publié sur cette ressource.
                  </div>
                ) : null}
              </div>
            </section>
          </article>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">Suivi personnel</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Ajoutez cette ressource à votre parcours pour suivre vos consultations et exploitations.
              </p>
              <div className="mt-4">
                <ResourceProgressActions
                  resource={resource}
                  isAuthenticated={Boolean(user)}
                  redirectTo={`/resources/${resource.slug}`}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">Partager</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Générez un lien de partage ou utilisez le canal proposé par votre navigateur.
              </p>
              <div className="mt-4">
                <ShareResourceButton
                  resourceId={resource.id}
                  title={resource.title}
                  url={`/resources/${resource.slug}`}
                />
              </div>
            </div>

            <div className="rounded-lg border bg-card p-5 shadow-sm">
              <h2 className="font-semibold">Relations concernées</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {resource.relations.map((relation) => (
                  <span key={relation.slug} className="rounded-full border px-3 py-1 text-sm text-muted-foreground">
                    {relation.name}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
