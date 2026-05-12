import { router } from 'expo-router';
import { BookMarked, CheckCircle2, Heart, Plus } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { getDashboard } from '@/lib/api';
import type { DashboardPayload } from '@/lib/types';
import { Button, EmptyState, Header, LoadingState, Screen, StatCard } from '@/components/mobile-ui';
import { ResourceCard } from '@/components/resource-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export default function DashboardScreen() {
  const sessionQuery = authClient.useSession();
  const session = sessionQuery.data;
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    setLoading(true);
    getDashboard()
      .then(setPayload)
      .finally(() => setLoading(false));
  }, [session?.user]);

  if (!session?.user) {
    return (
      <Screen tabs>
        <Header eyebrow="Parcours utilisateur" title="Connexion requise" />
        <EmptyState title="Votre parcours est protege" text="Connectez-vous pour retrouver vos favoris et ressources." />
        <Button onPress={() => router.push('/login')}>Se connecter</Button>
      </Screen>
    );
  }

  return (
    <Screen tabs>
      <Header
        eyebrow="Parcours utilisateur"
        title={`Bonjour ${payload?.user.name ?? session.user.name}`}
        description="Retrouvez vos favoris, ressources mises de cote, contenus exploites et contributions."
        action={
          <Button icon={Plus} onPress={() => router.push('/resources/new')}>
            Nouvelle
          </Button>
        }
      />

      {loading && !payload ? <LoadingState /> : null}
      {payload ? (
        <>
          <View style={styles.stats}>
            <StatCard label="Favoris" value={payload.counters.favorites} icon={Heart} />
            <StatCard label="Mises de cote" value={payload.counters.saved} icon={BookMarked} />
            <StatCard label="Exploitees" value={payload.counters.completed} icon={CheckCircle2} />
          </View>

          <View style={styles.section}>
            <ThemedText type="code" themeColor="primary">
              Suivi
            </ThemedText>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Ressources de votre parcours
            </ThemedText>
          </View>
          {payload.data.progress.length === 0 ? <EmptyState title="Votre parcours est vide" /> : null}
          {payload.data.progress.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}

          <View style={styles.section}>
            <ThemedText type="code" themeColor="primary">
              Contributions
            </ThemedText>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Vos ressources proposees
            </ThemedText>
          </View>
          {payload.data.ownResources.length === 0 ? <EmptyState title="Aucune contribution pour le moment" /> : null}
          {payload.data.ownResources.map((resource) => (
            <ResourceCard key={resource.slug} resource={resource} />
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: {
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
});
