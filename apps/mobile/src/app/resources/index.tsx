import { router } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, Chip, EmptyState, Field, Header, LoadingState, Screen } from '@/components/mobile-ui';
import { ResourceCard } from '@/components/resource-card';
import { Spacing } from '@/constants/theme';
import { getResources, type ResourceFilters } from '@/lib/api';
import type { CatalogMeta, ResourceListItem } from '@/lib/types';

export default function ResourcesScreen() {
  const [meta, setMeta] = useState<CatalogMeta | null>(null);
  const [resources, setResources] = useState<ResourceListItem[]>([]);
  const [filters, setFilters] = useState<ResourceFilters>({});
  const [searchDraft, setSearchDraft] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback((nextFilters: ResourceFilters) => {
    setLoading(true);
    getResources(nextFilters)
      .then((payload) => {
        setMeta(payload.meta);
        setResources(payload.resources);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(filters);
  }, [filters, load]);

  function setFilter(key: keyof ResourceFilters, value?: string) {
    setFilters((current) => ({
      ...current,
      [key]: current[key] === value ? undefined : value,
    }));
  }

  return (
    <Screen tabs>
      <Header
        eyebrow="Catalogue"
        title="Ressources relationnelles"
        description="Filtrez par categorie, relation ou format pour trouver un support adapte."
        action={
          <Button icon={Plus} onPress={() => router.push('/resources/new')}>
            Proposer
          </Button>
        }
      />

      <View style={styles.searchRow}>
        <View style={styles.searchField}>
          <Field
            label="Recherche"
            value={searchDraft}
            onChangeText={setSearchDraft}
            placeholder="Titre, resume, contenu..."
            returnKeyType="search"
            onSubmitEditing={() => setFilters((current) => ({ ...current, search: searchDraft.trim() || undefined }))}
          />
        </View>
        <Button
          icon={Search}
          onPress={() => setFilters((current) => ({ ...current, search: searchDraft.trim() || undefined }))}>
          Filtrer
        </Button>
      </View>

      {meta ? (
        <View style={styles.filters}>
          <View style={styles.chips}>
            {meta.categories.map((category) => (
              <Chip
                key={category.id}
                label={category.name}
                selected={filters.category === category.slug}
                onPress={() => setFilter('category', category.slug)}
              />
            ))}
          </View>
          <View style={styles.chips}>
            {meta.resourceTypes.map((type) => (
              <Chip
                key={type.id}
                label={type.name}
                selected={filters.type === type.slug}
                onPress={() => setFilter('type', type.slug)}
              />
            ))}
          </View>
          <View style={styles.chips}>
            {meta.relationTypes.map((relation) => (
              <Chip
                key={relation.id}
                label={relation.name}
                selected={filters.relation === relation.slug}
                onPress={() => setFilter('relation', relation.slug)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {loading ? <LoadingState /> : null}
      {!loading && resources.length === 0 ? (
        <EmptyState title="Aucune ressource" text="Aucune ressource ne correspond a ces criteres." />
      ) : null}
      {!loading ? resources.map((resource) => <ResourceCard key={resource.slug} resource={resource} />) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchRow: {
    gap: Spacing.two,
  },
  searchField: {
    flex: 1,
  },
  filters: {
    gap: Spacing.two,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
