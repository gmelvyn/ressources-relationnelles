import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { BookOpenCheck, Heart, MessageCircle, LogOut, Settings, ShieldCheck } from 'lucide-react-native';
import { StyleSheet, View, Pressable } from 'react-native';

import { authClient } from '@/lib/auth-client';
import {
  Button,
  Card,
  EmptyState,
  Header,
  Screen,
  StatCard,
  Chip,
  Badge,
  LoadingState,
} from '@/components/mobile-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { roleLabel, formatDate } from '@/lib/format';
import { useTheme } from '@/hooks/use-theme';
import { getMyResources, getMyComments, getMyLikes } from '@/lib/api';
import type { MyResource, MyComment, MyLike } from '@/lib/types';

type TabType = 'resources' | 'comments' | 'favorites';

export default function ProfileScreen() {
  const sessionQuery = authClient.useSession();
  const session = sessionQuery.data;
  const theme = useTheme();

  const [activeTab, setActiveTab] = useState<TabType>('resources');
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<MyResource[]>([]);
  const [comments, setComments] = useState<MyComment[]>([]);
  const [likes, setLikes] = useState<MyLike[]>([]);

  useEffect(() => {
    if (!session?.user) return;

    async function loadData() {
      setLoading(true);
      try {
        const [resData, commentData, likeData] = await Promise.all([
          getMyResources().catch(() => []),
          getMyComments().catch(() => []),
          getMyLikes().catch(() => []),
        ]);
        setResources(resData);
        setComments(commentData);
        setLikes(likeData);
      } catch (err) {
        console.error('Error fetching profile tab data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [session?.user]);

  async function signOut() {
    await authClient.signOut();
    router.replace('/login');
  }

  if (!session?.user) {
    return (
      <Screen tabs>
        <Header eyebrow="Profil" title="Connexion requise" />
        <EmptyState title="Aucun profil chargé" text="Connectez-vous pour accéder à votre profil." />
        <Button onPress={() => router.push('/login')}>Se connecter</Button>
      </Screen>
    );
  }

  const userBio = (session.user as { bio?: string | null }).bio;
  const createdAtStr = (session.user as { createdAt?: string | null }).createdAt;

  return (
    <Screen tabs>
      <Header
        eyebrow="Profil"
        title={session.user.name}
        description={session.user.email}
        action={
          <Button variant="outline" icon={Settings} onPress={() => router.push('/settings')}>
            Réglages
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
          {createdAtStr && (
            <ThemedText type="code" themeColor="textSecondary">
              Membre depuis le {formatDate(createdAtStr)}
            </ThemedText>
          )}
        </View>
      </Card>

      {userBio ? (
        <Card>
          <ThemedText type="smallBold">Biographie</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {userBio}
          </ThemedText>
        </Card>
      ) : null}

      <View style={styles.statsRow}>
        <StatCard label="Ressources" value={resources.length} icon={BookOpenCheck} />
        <StatCard label="Commentaires" value={comments.length} icon={MessageCircle} />
        <StatCard label="Favoris" value={likes.length} icon={Heart} />
      </View>

      <View style={styles.tabsContainer}>
        <Chip
          label={`Mes Ressources (${resources.length})`}
          selected={activeTab === 'resources'}
          onPress={() => setActiveTab('resources')}
        />
        <Chip
          label={`Mes Commentaires (${comments.length})`}
          selected={activeTab === 'comments'}
          onPress={() => setActiveTab('comments')}
        />
        <Chip
          label={`Favoris (${likes.length})`}
          selected={activeTab === 'favorites'}
          onPress={() => setActiveTab('favorites')}
        />
      </View>

      <View style={styles.tabContent}>
        {loading ? (
          <LoadingState label="Chargement des données du profil..." />
        ) : (
          <>
            {activeTab === 'resources' && (
              <View style={styles.listContainer}>
                {resources.length === 0 ? (
                  <EmptyState
                    title="Aucune ressource"
                    text="Vous n'avez pas encore publié de ressource."
                  />
                ) : (
                  resources.map((item) => (
                    <Card key={item.id} style={styles.itemCard}>
                      <View style={styles.badgeRow}>
                        <Badge>{item.category?.name ?? 'Général'}</Badge>
                        <Badge outline color={item.status === 'validated' ? theme.primary : theme.textSecondary}>
                          {item.status === 'validated' ? 'Validé' : item.status === 'pending' ? 'En attente' : item.status}
                        </Badge>
                      </View>
                      <ThemedText type="smallBold" style={styles.itemTitle}>
                        {item.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        {item.summary}
                      </ThemedText>
                      <ThemedText type="code" themeColor="textSecondary" style={styles.itemMeta}>
                        Créé le {formatDate(item.createdAt)} • {item.visibility === 'public' ? 'Public' : 'Privé'}
                      </ThemedText>
                    </Card>
                  ))
                )}
              </View>
            )}

            {activeTab === 'comments' && (
              <View style={styles.listContainer}>
                {comments.length === 0 ? (
                  <EmptyState
                    title="Aucun commentaire"
                    text="Vous n'avez pas encore commenté de ressource."
                  />
                ) : (
                  comments.map((item) => (
                    <Card key={item.id} style={styles.itemCard}>
                      <ThemedText type="small">
                        &quot;{item.content}&quot;
                      </ThemedText>
                      <Pressable
                        onPress={() => router.push(`/resources/${item.resource?.slug}`)}
                        style={styles.commentResourceLink}
                      >
                        <ThemedText type="code" themeColor="primary">
                          Sur : {item.resource?.title}
                        </ThemedText>
                      </Pressable>
                      <ThemedText type="code" themeColor="textSecondary" style={styles.itemMeta}>
                        Posté le {formatDate(item.createdAt)}
                      </ThemedText>
                    </Card>
                  ))
                )}
              </View>
            )}

            {activeTab === 'favorites' && (
              <View style={styles.listContainer}>
                {likes.length === 0 ? (
                  <EmptyState
                    title="Aucun favori"
                    text="Vous n'avez pas encore ajouté de ressource à vos favoris."
                  />
                ) : (
                  likes.map((item) => (
                    <Card key={item.id} style={styles.itemCard}>
                      <View style={styles.favHeader}>
                        <ThemedText type="smallBold" style={styles.itemTitle}>
                          {item.title}
                        </ThemedText>
                        <Heart size={16} color={theme.danger} fill={theme.danger} />
                      </View>
                      <ThemedText type="small" themeColor="textSecondary">
                        {item.summary}
                      </ThemedText>
                      <Button
                        variant="outline"
                        style={styles.viewResourceBtn}
                        onPress={() => router.push(`/resources/${item.slug}`)}
                      >
                        Voir la ressource
                      </Button>
                    </Card>
                  ))
                )}
              </View>
            )}
          </>
        )}
      </View>

      <Button variant="danger" icon={LogOut} onPress={signOut} style={styles.signOutBtn}>
        Se déconnecter
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
    marginRight: Spacing.three,
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
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
    flexWrap: 'wrap',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    width: '100%',
    flexWrap: 'wrap',
    marginTop: Spacing.one,
  },
  tabContent: {
    width: '100%',
  },
  listContainer: {
    gap: Spacing.two,
  },
  itemCard: {
    gap: Spacing.one,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    lineHeight: 20,
    marginTop: Spacing.half,
  },
  itemMeta: {
    fontSize: 11,
    marginTop: Spacing.half,
  },
  commentResourceLink: {
    alignSelf: 'flex-start',
    marginTop: Spacing.half,
  },
  favHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
  viewResourceBtn: {
    marginTop: Spacing.one,
    minHeight: 36,
  },
  signOutBtn: {
    marginTop: Spacing.two,
  },
});
