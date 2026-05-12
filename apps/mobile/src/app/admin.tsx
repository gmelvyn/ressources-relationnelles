import { router } from 'expo-router';
import { ArrowLeft, Ban, CheckCircle2, ShieldAlert, UserCog } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  createCategory,
  getAdminOverview,
  moderateResource,
  updateUser,
} from '@/lib/api';
import type { AdminPayload, AdminUser } from '@/lib/types';
import { Button, Card, EmptyState, Field, Header, LoadingState, Screen, StatCard } from '@/components/mobile-ui';
import { ResourceCard } from '@/components/resource-card';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { roleLabel } from '@/lib/format';

export default function AdminScreen() {
  const [payload, setPayload] = useState<AdminPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryColor, setCategoryColor] = useState('#0f766e');

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setPayload(await getAdminOverview());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Administration indisponible.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function moderate(resourceId: string, action: string) {
    await moderateResource({ resourceId, action });
    await load();
  }

  async function submitCategory() {
    if (!categoryName.trim() || !categoryDescription.trim()) return;
    await createCategory({
      name: categoryName.trim(),
      description: categoryDescription.trim(),
      color: categoryColor.trim() || undefined,
    });
    setCategoryName('');
    setCategoryDescription('');
    await load();
  }

  async function changeUser(user: AdminUser, role?: string, action?: string) {
    await updateUser({ userId: user.id, role, action });
    await load();
  }

  if (loading && !payload) {
    return (
      <Screen>
        <LoadingState />
      </Screen>
    );
  }

  if (error || !payload) {
    return (
      <Screen>
        <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
          Retour
        </Button>
        <EmptyState title="Acces refuse" text={error ?? 'Vous devez etre moderateur pour acceder a cet espace.'} />
        <Button onPress={() => router.push('/dashboard')}>Retour au parcours</Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
        Retour
      </Button>
      <Header
        eyebrow="Back-office"
        title="Administration du catalogue"
        description={`Connecte en tant que ${roleLabel(payload.user.role)}.`}
      />

      <View style={styles.stats}>
        <StatCard label="Ressources" value={payload.overview.counters.resources} icon={CheckCircle2} />
        <StatCard label="Utilisateurs" value={payload.overview.counters.users} icon={UserCog} />
        <StatCard label="Commentaires" value={payload.overview.counters.comments} icon={ShieldAlert} />
        <StatCard label="En validation" value={payload.overview.counters.pendingResources} icon={Ban} />
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Ressources a valider
        </ThemedText>
      </View>
      {payload.pendingResources.length === 0 ? <EmptyState title="Aucune ressource en attente" /> : null}
      {payload.pendingResources.map((resource) => (
        <Card key={resource.id}>
          <ResourceCard resource={resource} />
          <View style={styles.actions}>
            <Button icon={CheckCircle2} onPress={() => moderate(resource.id, 'publish')}>
              Publier
            </Button>
            <Button variant="outline" icon={ShieldAlert} onPress={() => moderate(resource.id, 'suspend')}>
              Suspendre
            </Button>
          </View>
        </Card>
      ))}

      {payload.permissions.canAdminCatalog ? (
        <Card>
          <ThemedText type="smallBold">Nouvelle categorie</ThemedText>
          <Field label="Nom" value={categoryName} onChangeText={setCategoryName} />
          <Field label="Description" value={categoryDescription} onChangeText={setCategoryDescription} multiline />
          <Field label="Couleur" value={categoryColor} onChangeText={setCategoryColor} />
          <Button onPress={submitCategory}>Creer la categorie</Button>
        </Card>
      ) : null}

      {payload.permissions.canAdminUsers ? (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Comptes et roles
          </ThemedText>
          {payload.users.map((user) => (
            <UserRow key={user.id} user={user} onChange={changeUser} />
          ))}
        </View>
      ) : null}
    </Screen>
  );
}

function UserRow({
  user,
  onChange,
}: {
  user: AdminUser;
  onChange: (user: AdminUser, role?: string, action?: string) => void;
}) {
  return (
    <Card>
      <ThemedText type="smallBold">{user.name}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {user.email}
      </ThemedText>
      <ThemedText type="code" themeColor="textSecondary">
        {roleLabel(user.role)} - {user.banned ? 'Desactive' : 'Actif'}
      </ThemedText>
      <View style={styles.actions}>
        <Button variant="outline" onPress={() => onChange(user, 'citizen')}>
          Citoyen
        </Button>
        <Button variant="outline" onPress={() => onChange(user, 'moderator')}>
          Moderateur
        </Button>
        <Button variant="outline" onPress={() => onChange(user, 'catalog_admin')}>
          Admin catalogue
        </Button>
        <Button variant="danger" onPress={() => onChange(user, undefined, user.banned ? 'unban' : 'ban')}>
          {user.banned ? 'Reactiver' : 'Desactiver'}
        </Button>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  section: {
    gap: Spacing.two,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 30,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
