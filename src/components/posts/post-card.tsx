"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { MessageSquare, MoreHorizontal, Send } from "lucide-react";

export type PostWithAuthor = {
  id: string;
  content: string;
  image?: string | null;
  createdAt: Date;
  author: {
    name: string;
    email: string;
    image?: string | null;
    username?: string | null;
  };
};

interface PostCardProps {
  post: PostWithAuthor;
  onImageClick?: (imageUrl: string) => void;
}

export function PostCard({ post, onImageClick }: PostCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4 pb-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{post.author.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          {post.author.image && <AvatarImage src={post.author.image} />}
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{post.author.name}</span>
            <span className="text-xs text-muted-foreground">
              {post.author.username || post.author.email}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 rounded-full">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="whitespace-pre-wrap text-sm mb-2">{post.content}</p>
        {post.image && (
          <div className="mt-2 rounded-md overflow-hidden bg-muted border">
            <img
              src={post.image}
              alt="Image du post"
              className="w-full h-auto block cursor-pointer hover:opacity-95 transition-opacity"
              onClick={() => onImageClick?.(post.image!)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t p-2">
        <div className="flex w-full justify-end gap-1 px-2">
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            0
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground">
            <span>❤️</span>
            0
          </Button>
          <Button variant="ghost" size="sm" className="h-8 gap-2 text-xs text-muted-foreground hover:text-foreground">
            <Send className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
