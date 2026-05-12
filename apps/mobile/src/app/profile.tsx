import { router } from 'expo-router';
import { LogOut, Settings, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { Button, Card, EmptyState, Header, Screen } from '@/components/mobile-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { roleLabel } from '@/lib/format';
import { useTheme } from '@/hooks/use-theme';

export default function ProfileScreen() {
  const sessionQuery = authClient.useSession();
  const session = sessionQuery.data;
  const theme = useTheme();

  async function signOut() {
    await authClient.signOut();
    router.replace('/login');
  }

  if (!session?.user) {
    return (
      <Screen tabs>
        <Header eyebrow="Profil" title="Connexion requise" />
        <EmptyState title="Aucun profil charge" text="Connectez-vous pour acceder a votre profil." />
        <Button onPress={() => router.push('/login')}>Se connecter</Button>
      </Screen>
    );
  }

  return (
    <Screen tabs>
      <Header
        eyebrow="Profil"
        title={session.user.name}
        description={session.user.email}
        action={
          <Button variant="outline" icon={Settings} onPress={() => router.push('/settings')}>
            Reglages
          </Button>
        }
      />

      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <ThemedText type="subtitle" style={{ color: theme.primaryForeground }}>
            {session.user.name.slice(0, 2).toUpperCase()}
          </ThemedText>
        </View>
        <View style={styles.profileCopy}>
          <ThemedText type="smallBold">{session.user.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {session.user.email}
          </ThemedText>
          <View style={styles.role}>
            <ShieldCheck size={16} color={theme.primary} />
            <ThemedText type="small" themeColor="primary">
              {roleLabel((session.user as { role?: string }).role)}
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card>
        <ThemedText type="smallBold">Posts et portail</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          Le fil de posts web est reporte a une prochaine version mobile. Cette v1 se concentre sur le
          catalogue, le parcours et la moderation.
        </ThemedText>
      </Card>

      <Button variant="danger" icon={LogOut} onPress={signOut}>
        Se deconnecter
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  role: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
});
