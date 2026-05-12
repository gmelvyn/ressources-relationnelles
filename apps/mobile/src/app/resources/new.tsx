import { router } from 'expo-router';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { createResource, getResources } from '@/lib/api';
import type { CatalogMeta } from '@/lib/types';
import { Button, Card, Chip, EmptyState, Field, Header, LoadingState, Screen } from '@/components/mobile-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

const visibilityOptions = [
  { label: 'Publique', value: 'PUBLIC' },
  { label: 'Comptes verifies', value: 'RESTRICTED' },
  { label: 'Partagee', value: 'SHARED' },
  { label: 'Privee', value: 'PRIVATE' },
];

export default function NewResourceScreen() {
  const sessionQuery = authClient.useSession();
  const session = sessionQuery.data;
  const [meta, setMeta] = useState<CatalogMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [typeId, setTypeId] = useState('');
  const [visibility, setVisibility] = useState('PUBLIC');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [relationTypeIds, setRelationTypeIds] = useState<string[]>([]);

  useEffect(() => {
    getResources()
      .then((payload) => setMeta(payload.meta))
      .finally(() => setLoading(false));
  }, []);

  function toggleRelation(id: string) {
    setRelationTypeIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  async function submit() {
    setError(null);
    if (!session?.user) {
      router.push('/login');
      return;
    }
    if (!title.trim() || !summary.trim() || !content.trim() || !categoryId || !typeId || relationTypeIds.length === 0) {
      setError('Titre, resume, contenu, categorie, type et relation sont obligatoires.');
      return;
    }

    setBusy(true);
    try {
      const resource = await createResource({
        title: title.trim(),
        summary: summary.trim(),
        content: content.trim(),
        categoryId,
        typeId,
        visibility,
        durationMinutes: durationMinutes ? Number.parseInt(durationMinutes, 10) : undefined,
        sourceUrl: sourceUrl.trim() || undefined,
        relationTypeIds,
      });
      const slug = (resource as { slug?: string }).slug;
      router.replace(slug ? `/resources/${slug}` : '/resources');
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible d'enregistrer la ressource.");
    } finally {
      setBusy(false);
    }
  }

  if (!session?.user) {
    return (
      <Screen>
        <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
          Retour
        </Button>
        <EmptyState title="Connexion requise" text="Connectez-vous pour proposer une ressource." />
        <Button onPress={() => router.push('/login')}>Se connecter</Button>
      </Screen>
    );
  }

  return (
    <Screen>
      <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
        Retour au catalogue
      </Button>
      <Header
        eyebrow="Contribution citoyenne"
        title="Proposer une ressource"
        description="Les ressources publiques et partagees sont soumises a validation avant publication."
      />

      {loading ? <LoadingState /> : null}
      {!loading && !meta ? (
        <EmptyState title="Catalogue indisponible" text="Le referentiel de categories n'est pas initialise." />
      ) : null}
      {meta ? (
        <Card>
          {error ? (
            <ThemedText type="smallBold" themeColor="danger">
              {error}
            </ThemedText>
          ) : null}
          <Field label="Titre" value={title} onChangeText={setTitle} maxLength={140} />
          <Field label="Resume" value={summary} onChangeText={setSummary} maxLength={300} multiline />
          <Field label="Contenu" value={content} onChangeText={setContent} multiline />
          <Field
            label="Duree estimee"
            value={durationMinutes}
            onChangeText={setDurationMinutes}
            keyboardType="number-pad"
            placeholder="15"
          />
          <Field label="Source externe" value={sourceUrl} onChangeText={setSourceUrl} placeholder="https://..." />

          <PickerBlock title="Categorie">
            {meta.categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={categoryId === category.id}
                onPress={() => setCategoryId(category.id)}
              />
            ))}
          </PickerBlock>

          <PickerBlock title="Type de ressource">
            {meta.resourceTypes.map((type) => (
              <Chip key={type.id} label={type.name} selected={typeId === type.id} onPress={() => setTypeId(type.id)} />
            ))}
          </PickerBlock>

          <PickerBlock title="Visibilite">
            {visibilityOptions.map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                selected={visibility === option.value}
                onPress={() => setVisibility(option.value)}
              />
            ))}
          </PickerBlock>

          <PickerBlock title="Types de relations">
            {meta.relationTypes.map((relation) => (
              <Chip
                key={relation.id}
                label={relation.name}
                selected={relationTypeIds.includes(relation.id)}
                onPress={() => toggleRelation(relation.id)}
              />
            ))}
          </PickerBlock>

          <Button icon={Send} disabled={busy} onPress={submit}>
            {busy ? 'Enregistrement...' : 'Soumettre la ressource'}
          </Button>
        </Card>
      ) : null}
    </Screen>
  );
}

function PickerBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.picker}>
      <ThemedText type="smallBold">{title}</ThemedText>
      <View style={styles.chips}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
