import { useLocalSearchParams, router } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Heart,
  MessageCircle,
  PlayCircle,
  Send,
  ShieldCheck,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { createComment, getResource, updateProgress } from '@/lib/api';
import type { ResourceComment, ResourceListItem } from '@/lib/types';
import { Badge, Button, Card, EmptyState, Field, LoadingState, Screen } from '@/components/mobile-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { absoluteUrl } from '@/lib/config';
import { formatDate } from '@/lib/format';
import { useTheme } from '@/hooks/use-theme';

export default function ResourceDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const sessionQuery = authClient.useSession();
  const session = sessionQuery.data;
  const theme = useTheme();
  const [resource, setResource] = useState<ResourceListItem | null>(null);
  const [comments, setComments] = useState<ResourceComment[]>([]);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!slug) return;
    setLoading(true);
    getResource(slug)
      .then((payload) => {
        setResource(payload.resource);
        setComments(payload.comments);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  async function runProgress(intent: string) {
    if (!resource) return;
    if (!session?.user) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      await updateProgress({ resourceId: resource.id, intent });
      await getResource(resource.slug).then((payload) => {
        setResource(payload.resource);
        setComments(payload.comments);
      });
    } finally {
      setBusy(false);
    }
  }

  async function submitComment() {
    if (!resource || comment.trim().length < 2) return;
    if (!session?.user) {
      router.push('/login');
      return;
    }
    setBusy(true);
    try {
      await createComment({ resourceId: resource.id, content: comment.trim() });
      setComment('');
      const payload = await getResource(resource.slug);
      setComments(payload.comments);
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (!resource) {
    return (
      <Screen>
        <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
          Retour
        </Button>
        <EmptyState title="Ressource introuvable" />
      </Screen>
    );
  }

  const sourceUrl = absoluteUrl(resource.sourceUrl);

  return (
    <Screen>
      <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
        Retour au catalogue
      </Button>

      <View style={styles.badges}>
        <Badge color={resource.category.color}>{resource.category.name}</Badge>
        <Badge outline>{resource.type.name}</Badge>
        <Badge outline>{resource.visibility === 'PUBLIC' ? 'Public' : 'Restreint'}</Badge>
      </View>

      <View style={styles.titleBlock}>
        <ThemedText type="subtitle">{resource.title}</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          {resource.summary}
        </ThemedText>
      </View>

      <View style={styles.meta}>
        {resource.durationMinutes ? (
          <View style={styles.metaItem}>
            <Clock3 size={16} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">
              {resource.durationMinutes} minutes
            </ThemedText>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <MessageCircle size={16} color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            {resource.commentsCount} echanges
          </ThemedText>
        </View>
        <View style={styles.metaItem}>
          <ShieldCheck size={16} color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            Ressource moderee
          </ThemedText>
        </View>
      </View>

      <Card>
        {resource.content.split('\n').map((paragraph, index) => (
          <ThemedText key={`${resource.slug}-${index}`} type="default" themeColor="textSecondary">
            {paragraph}
          </ThemedText>
        ))}
        {sourceUrl ? (
          <Button variant="outline" icon={ExternalLink} onPress={() => openBrowserAsync(sourceUrl)}>
            Ouvrir la source
          </Button>
        ) : null}
      </Card>

      <Card>
        <ThemedText type="smallBold">Suivi personnel</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Ajoutez cette ressource a votre parcours et suivez son exploitation.
        </ThemedText>
        {session?.user ? (
          <View style={styles.actions}>
            <Button
              variant="outline"
              disabled={busy}
              icon={Heart}
              onPress={() => runProgress(resource.progress?.isFavorite ? 'unfavorite' : 'favorite')}>
              {resource.progress?.isFavorite ? 'Retirer favori' : 'Favori'}
            </Button>
            <Button
              variant="outline"
              disabled={busy}
              icon={Bookmark}
              onPress={() => runProgress(resource.progress?.isSaved ? 'unsave' : 'save')}>
              {resource.progress?.isSaved ? 'Retirer' : 'Mettre de cote'}
            </Button>
            <Button variant="secondary" disabled={busy} icon={PlayCircle} onPress={() => runProgress('start')}>
              Demarrer
            </Button>
            <Button disabled={busy} icon={CheckCircle2} onPress={() => runProgress('complete')}>
              Exploitee
            </Button>
          </View>
        ) : (
          <Button variant="outline" onPress={() => router.push('/login')}>
            Se connecter
          </Button>
        )}
      </Card>

      <Card>
        <ThemedText type="smallBold">Relations concernees</ThemedText>
        <View style={styles.badges}>
          {resource.relations.map((relation) => (
            <Badge key={relation.slug} outline>
              {relation.name}
            </Badge>
          ))}
        </View>
      </Card>

      <View style={styles.section}>
        <ThemedText type="code" themeColor="primary">
          Echanges
        </ThemedText>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Commentaires moderes
        </ThemedText>
      </View>

      {session?.user ? (
        <Card>
          <Field
            label="Ajouter un commentaire"
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={1200}
            placeholder="Votre commentaire"
          />
          <Button icon={Send} disabled={busy || comment.trim().length < 2} onPress={submitComment}>
            Publier
          </Button>
        </Card>
      ) : (
        <EmptyState title="Connexion requise" text="Connectez-vous pour participer aux echanges." />
      )}

      {comments.length === 0 ? <EmptyState title="Aucun echange" /> : null}
      {comments.map((item) => (
        <CommentCard key={item.id} comment={item} />
      ))}
    </Screen>
  );
}

function CommentCard({ comment }: { comment: ResourceComment }) {
  return (
    <Card>
      <View>
        <ThemedText type="smallBold">{comment.author.name}</ThemedText>
        <ThemedText type="code" themeColor="textSecondary">
          {formatDate(comment.createdAt)}
        </ThemedText>
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {comment.content}
      </ThemedText>
      {comment.replies?.map((reply) => (
        <View key={reply.id} style={styles.reply}>
          <ThemedText type="smallBold">{reply.author.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {reply.content}
          </ThemedText>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  titleBlock: {
    gap: Spacing.two,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.one,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  reply: {
    borderLeftWidth: 2,
    borderLeftColor: '#0f766e',
    paddingLeft: Spacing.two,
    gap: Spacing.one,
  },
});
