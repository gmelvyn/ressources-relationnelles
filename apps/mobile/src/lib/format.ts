export function difficultyLabel(value: string) {
  if (value === 'avance') return 'Avance';
  if (value === 'intermediaire') return 'Intermediaire';
  return 'Accessible';
}

export function roleLabel(role?: string | null) {
  switch (role) {
    case 'moderator':
      return 'Moderateur';
    case 'catalog_admin':
      return 'Administrateur catalogue';
    case 'super_admin':
      return 'Super-administrateur';
    default:
      return 'Citoyen';
  }
}

export function formatDate(value?: string | null) {
  if (!value) return '';
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(value));
}
