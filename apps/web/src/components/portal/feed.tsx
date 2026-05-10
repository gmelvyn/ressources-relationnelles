"use client";

import { createPostAction } from "@/app/actions/post";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { Image as ImageIcon, MessageSquare, MoreHorizontal, Send, X } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";

type PostWithAuthor = {
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

interface FeedProps {
  initialPosts: PostWithAuthor[];
  currentUser?: {
    name: string;
    image?: string | null;
  } | null;
}

export function Feed({ initialPosts, currentUser }: FeedProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    defaultValues: {
      content: "",
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: z.object({
        content: z.string().optional(),
      }).refine((data) => data.content?.trim() || selectedImage, {
        message: "Le post ne peut pas être vide.",
      }),
    },
    onSubmit: async ({ value }) => {
      const formData = new FormData();
      if (value.content) formData.append("content", value.content);
      if (selectedImage) formData.append("image", selectedImage);

      const result = await createPostAction(formData);
      if (result?.success) {
        form.reset();
        removeImage();
      } else if (result?.error) {
        alert(result.error);
      }
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Re-validate form since selectedImage changed
      form.validate("change");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    form.validate("change");
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Create Post */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Partager une information</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="post-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="content"
              children={(field) => (
                <Textarea
                  name={field.name}
                  placeholder="Quoi de neuf dans votre ville ?"
                  className="resize-none mb-2"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              )}
            />

            {/* Image Preview */}
            {previewUrl && (
              <div className="relative mt-2 w-fit">
                <img
                  src={previewUrl}
                  alt="Aperçu"
                  className="max-h-48 rounded-md object-cover border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={removeImage}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <input
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
            </Button>
            <p className="text-xs text-muted-foreground self-center hidden sm:block">
              Ajoutez une photo pour illustrer.
            </p>
          </div>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => (
              <Button
                onClick={() => form.handleSubmit()}
                disabled={!canSubmit || isSubmitting || !currentUser}
              >
                <Send className="mr-2 h-4 w-4" /> {isSubmitting ? "Publication..." : "Publier"}
              </Button>
            )}
          />
        </CardFooter>
      </Card>

      {/* Posts List */}
      <div className="flex flex-col gap-4">
        {initialPosts.map((post) => (
          <Card key={post.id} className="overflow-hidden">
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
                    onClick={() => setZoomedImage(post.image!)}
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
        ))}
        {initialPosts.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            Aucun post pour le moment. Soyez le premier à partager quelque chose !
          </div>
        )}
      </div>

      <Dialog open={!!zoomedImage} onOpenChange={(open) => !open && setZoomedImage(null)}>
        <DialogContent className="max-w-screen-lg p-0 overflow-hidden bg-black/90 border-none shadow-none text-white">
          <VisuallyHidden>
            <DialogTitle>Zoom Image</DialogTitle>
          </VisuallyHidden>
          <div className="relative flex items-center justify-center h-[90vh] w-full p-4">
            <img
              src={zoomedImage || ""}
              alt="Zoom"
              className="max-h-full max-w-full object-contain rounded-md"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-white hover:bg-white/20 rounded-full"
              onClick={() => setZoomedImage(null)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
