import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowRight, BookOpenCheck, Plus, ShieldCheck, UsersRound } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Card, Header, LoadingState, Screen } from '@/components/mobile-ui';
import { ResourceCard } from '@/components/resource-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getResources } from '@/lib/api';
import { absoluteUrl } from '@/lib/config';
import type { ResourceListItem } from '@/lib/types';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getResources()
      .then((payload) => {
        if (active) setResources(payload.resources.slice(0, 3));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <Screen tabs>
      <View style={[styles.hero, { backgroundColor: theme.backgroundElement }]}>
        <Image source={{ uri: absoluteUrl('/images/relations-hero.png') ?? undefined }} style={styles.heroImage} />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <ThemedText type="code" style={styles.heroEyebrow}>
            Plateforme citoyenne
          </ThemedText>
          <ThemedText type="title" style={styles.heroTitle}>
            (RE)Sources Relationnelles
          </ThemedText>
          <ThemedText type="small" style={styles.heroText}>
            Un catalogue public et modere pour creer, renforcer et enrichir les relations avec soi,
            ses proches, ses collegues et ses communautes.
          </ThemedText>
          <View style={styles.heroActions}>
            <Button icon={ArrowRight} onPress={() => router.push('/resources')}>
              Explorer
            </Button>
            <Button variant="outline" icon={Plus} onPress={() => router.push('/resources/new')}>
              Proposer
            </Button>
          </View>
        </View>
      </View>

      <View style={styles.featureGrid}>
        <Card style={styles.featureCard}>
          <BookOpenCheck color={theme.primary} size={20} />
          <ThemedText type="smallBold">Catalogue dynamique</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Categories, relations et formats.
          </ThemedText>
        </Card>
        <Card style={styles.featureCard}>
          <UsersRound color={theme.primary} size={20} />
          <ThemedText type="smallBold">Echanges moderes</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Commentaires et reponses.
          </ThemedText>
        </Card>
        <Card style={styles.featureCard}>
          <ShieldCheck color={theme.primary} size={20} />
          <ThemedText type="smallBold">Suivi personnel</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Favoris, mises de cote et progression.
          </ThemedText>
        </Card>
      </View>

      <Header
        eyebrow="Ressources a decouvrir"
        title="Des supports concrets pour agir"
        action={
          <Button variant="outline" onPress={() => router.push('/resources')}>
            Voir tout
          </Button>
        }
      />

      {loading ? <LoadingState /> : resources.map((resource) => <ResourceCard key={resource.slug} resource={resource} />)}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    minHeight: 520,
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  heroContent: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
  heroEyebrow: {
    color: '#b7f7eb',
    textTransform: 'uppercase',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 42,
    lineHeight: 46,
  },
  heroText: {
    color: 'rgba(255,255,255,0.86)',
  },
  heroActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  featureGrid: {
    gap: Spacing.two,
  },
  featureCard: {
    gap: Spacing.two,
  },
});
