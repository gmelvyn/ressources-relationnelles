import Link from "next/link";
import { Bookmark, Clock, Eye, Heart, MessageCircle, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ResourceListItem } from "@/lib/resources";

type ResourceCardProps = {
  resource: ResourceListItem;
};

function difficultyLabel(value: string) {
  if (value === "avance") return "Avancé";
  if (value === "intermediaire") return "Intermédiaire";
  return "Accessible";
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-sm transition hover:border-teal-700/40 hover:shadow-md">
      <div className="flex flex-wrap items-center gap-2">
        <Badge style={{ backgroundColor: resource.category.color }} className="text-white">
          {resource.category.name}
        </Badge>
        <Badge variant="secondary">{resource.type.name}</Badge>
        <span className="text-xs font-medium text-muted-foreground">{difficultyLabel(resource.difficulty)}</span>
      </div>

      <div className="mt-4 space-y-2">
        <Link href={`/resources/${resource.slug}`} className="group">
          <h2 className="text-xl font-semibold leading-tight group-hover:text-teal-700">{resource.title}</h2>
        </Link>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{resource.summary}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {resource.relations.map((relation) => (
          <span key={relation.slug} className="rounded-full border px-2.5 py-1 text-xs text-muted-foreground">
            {relation.name}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {resource.durationMinutes ? (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {resource.durationMinutes} min
            </span>
          ) : null}
          <span className="flex items-center gap-1">
            <MessageCircle className="size-3.5" />
            {resource.commentsCount}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="size-3.5" />
            {resource.viewCount}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {resource.progress?.isFavorite ? <Heart className="size-4 fill-rose-600 text-rose-600" /> : null}
          {resource.progress?.isSaved ? <Bookmark className="size-4 fill-teal-700 text-teal-700" /> : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/resources/${resource.slug}`}>
              <Share2 className="size-3.5" />
              Ouvrir
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
