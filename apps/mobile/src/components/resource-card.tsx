import { Bookmark, Clock3, Eye, Heart, MessageCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { Badge, Button, Card } from '@/components/mobile-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { difficultyLabel } from '@/lib/format';
import type { ResourceListItem } from '@/lib/types';
import { useTheme } from '@/hooks/use-theme';

export function ResourceCard({ resource }: { resource: ResourceListItem }) {
  const theme = useTheme();
  return (
    <Pressable onPress={() => router.push(`/resources/${resource.slug}`)} style={({ pressed }) => pressed && styles.pressed}>
      <Card>
        <View style={styles.badges}>
          <Badge color={resource.category.color}>{resource.category.name}</Badge>
          <Badge outline>{resource.type.name}</Badge>
          <ThemedText type="code" themeColor="textSecondary">
            {difficultyLabel(resource.difficulty)}
          </ThemedText>
        </View>

        <View style={styles.copy}>
          <ThemedText type="smallBold" style={styles.title}>
            {resource.title}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={3}>
            {resource.summary}
          </ThemedText>
        </View>

        <View style={styles.relations}>
          {resource.relations.map((relation) => (
            <Badge key={relation.slug} outline>
              {relation.name}
            </Badge>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <View style={styles.meta}>
            {resource.durationMinutes ? (
              <View style={styles.metaItem}>
                <Clock3 size={14} color={theme.textSecondary} />
                <ThemedText type="code" themeColor="textSecondary">
                  {resource.durationMinutes} min
                </ThemedText>
              </View>
            ) : null}
            <View style={styles.metaItem}>
              <MessageCircle size={14} color={theme.textSecondary} />
              <ThemedText type="code" themeColor="textSecondary">
                {resource.commentsCount}
              </ThemedText>
            </View>
            <View style={styles.metaItem}>
              <Eye size={14} color={theme.textSecondary} />
              <ThemedText type="code" themeColor="textSecondary">
                {resource.viewCount}
              </ThemedText>
            </View>
          </View>
          <View style={styles.statusIcons}>
            {resource.progress?.isFavorite ? <Heart size={16} color="#e11d48" fill="#e11d48" /> : null}
            {resource.progress?.isSaved ? <Bookmark size={16} color={theme.primary} fill={theme.primary} /> : null}
            <Button variant="outline" onPress={() => router.push(`/resources/${resource.slug}`)}>
              Ouvrir
            </Button>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  copy: {
    gap: Spacing.one,
  },
  title: {
    fontSize: 19,
    lineHeight: 25,
  },
  relations: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: Spacing.two,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    alignItems: 'center',
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.two,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.half,
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  pressed: {
    opacity: 0.75,
  },
});
