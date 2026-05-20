import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { ArrowLeft, Save, ShieldAlert, Trash2 } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { deleteAccount, getMe, updateProfile } from '@/lib/api';
import {
  Button,
  Card,
  EmptyState,
  Field,
  Header,
  Screen,
} from '@/components/mobile-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function SettingsScreen() {
  const sessionQuery = authClient.useSession();
  const session = sessionQuery.data;
  const theme = useTheme();

  const [name, setName] = useState(session?.user?.name ?? '');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [firstName, setFirstName] = useState(
    session?.user?.name?.split(' ')[0] ?? '',
  );
  const [lastName, setLastName] = useState(
    session?.user?.name?.split(' ').slice(1).join(' ') ?? '',
  );
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.user) return;

    getMe()
      .then(({ user }) => {
        if (!user) return;
        setName(user.name);
        setUsername((user as { username?: string | null }).username ?? '');
        setBio((user as { bio?: string | null }).bio ?? '');
      })
      .catch(() => {});
  }, [session?.user]);

  if (!session?.user) {
    return (
      <Screen>
        <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
          Retour
        </Button>
        <EmptyState
          title="Connexion requise"
          text="Connectez-vous pour accéder aux paramètres."
        />
        <Button onPress={() => router.push('/login')}>Se connecter</Button>
      </Screen>
    );
  }

  async function save() {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const displayName =
        name.trim() ||
        [firstName.trim(), lastName.trim()].filter(Boolean).join(' ') ||
        session.user.name;

      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: displayName,
        username: username.trim(),
        bio: bio.trim(),
      });

      setSaved(true);
      await sessionQuery.refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  }

  async function removeAccount() {
    setDeleting(true);
    setError(null);

    try {
      await deleteAccount({ confirmation });
      await authClient.signOut();
      router.replace('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression');
      setDeleting(false);
    }
  }

  return (
    <Screen>
      <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
        Retour
      </Button>
      <Header eyebrow="Paramètres" title="Réglages du compte" />

      <Card>
        <ThemedText type="smallBold">Profil public</ThemedText>
        <Field label="Prénom" value={firstName} onChangeText={setFirstName} />
        <Field label="Nom" value={lastName} onChangeText={setLastName} />
        <Field label="Nom affiché" value={name} onChangeText={setName} />
        <Field label="Pseudo" value={username} onChangeText={setUsername} />
        <Field label="Bio" value={bio} onChangeText={setBio} multiline />
        <Field label="Email" value={session.user.email} editable={false} style={{ opacity: 0.7 }} />

        {saved ? (
          <ThemedText type="small" themeColor="success">
            Profil enregistré avec succès.
          </ThemedText>
        ) : null}

        {error ? (
          <ThemedText type="small" style={{ color: theme.danger }}>
            {error}
          </ThemedText>
        ) : null}

        <Button icon={Save} onPress={save} disabled={saving}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </Card>

      <Card style={[styles.dangerCard, { borderColor: theme.danger }]}>
        <View style={styles.dangerHeader}>
          <ShieldAlert size={20} color={theme.danger} />
          <ThemedText type="smallBold" style={{ color: theme.danger }}>
            Zone sensible
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          Cette action supprime vos données personnelles, vos sessions, votre progression,
          vos commentaires et vos activités. Saisissez SUPPRIMER pour confirmer.
        </ThemedText>
        <Field
          label="Confirmation"
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder="SUPPRIMER"
          autoCapitalize="characters"
        />
        <Button
          variant="danger"
          icon={Trash2}
          disabled={deleting}
          onPress={removeAccount}
        >
          {deleting ? 'Suppression...' : 'Supprimer mon compte'}
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  dangerCard: {
    borderWidth: 1,
    marginTop: Spacing.four,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
});
