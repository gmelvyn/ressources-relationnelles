import type { LucideIcon } from 'lucide-react-native';
import { BookOpenCheck, Home, LayoutDashboard, UserRound } from 'lucide-react-native';
import { Href, router, usePathname } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  type TextInputProps,
  type StyleProp,
  type ViewStyle,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type ScreenProps = {
  children: ReactNode;
  tabs?: boolean;
  scroll?: boolean;
};

const navItems: { href: Href; label: string; icon: LucideIcon }[] = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/resources', label: 'Catalogue', icon: BookOpenCheck },
  { href: '/dashboard', label: 'Parcours', icon: LayoutDashboard },
  { href: '/profile', label: 'Profil', icon: UserRound },
];

export function Screen({ children, tabs = false, scroll = true }: ScreenProps) {
  const theme = useTheme();
  const content = (
    <SafeAreaView style={[styles.safeArea, { maxWidth: MaxContentWidth, backgroundColor: theme.background }]}>
      <View style={[styles.content, tabs && styles.contentWithTabs]}>{children}</View>
    </SafeAreaView>
  );

  return (
    <ThemedView style={[styles.root, { backgroundColor: theme.background }]}>
      {scroll ? (
        <ScrollView
          style={[styles.scroller, { backgroundColor: theme.background }]}
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
      {tabs ? <BottomNav /> : null}
    </ThemedView>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.nav,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.text,
        },
      ]}>
      {navItems.map((item) => {
        const active =
          item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Pressable
            key={String(item.href)}
            accessibilityRole="button"
            onPress={() => router.replace(item.href)}
            style={({ pressed }) => [
              styles.navItem,
              active && { backgroundColor: theme.backgroundSelected },
              !active && pressed && { backgroundColor: theme.backgroundElement },
              pressed && styles.pressed,
            ]}>
            <Icon size={18} color={active ? theme.primary : theme.textSecondary} />
            <ThemedText
              type="code"
              style={[styles.navLabel, { color: active ? theme.primary : theme.textSecondary }]}>
              {item.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Header({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={styles.headerText}>
        {eyebrow ? (
          <ThemedText type="code" themeColor="primary" style={styles.eyebrow}>
            {eyebrow}
          </ThemedText>
        ) : null}
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {description ? (
          <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
            {description}
          </ThemedText>
        ) : null}
      </View>
      {action ? <View style={styles.headerAction}>{action}</View> : null}
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          shadowColor: theme.text,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export function Button({
  children,
  onPress,
  icon: Icon,
  variant = 'primary',
  disabled = false,
  style,
}: {
  children: ReactNode;
  onPress?: () => void;
  icon?: LucideIcon;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const filled = variant === 'primary' || variant === 'danger';
  const color = variant === 'danger' ? theme.danger : theme.primary;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        filled && { backgroundColor: color, borderColor: color },
        variant === 'secondary' && { backgroundColor: theme.backgroundSelected, borderColor: theme.backgroundSelected },
        variant === 'outline' && { borderColor: theme.border },
        variant === 'ghost' && { borderColor: 'transparent' },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}>
      {Icon ? <Icon size={17} color={filled ? theme.primaryForeground : color} /> : null}
      <ThemedText
        type="smallBold"
        numberOfLines={1}
        style={{
          color: filled ? theme.primaryForeground : variant === 'ghost' ? theme.text : color,
        }}>
        {children}
      </ThemedText>
    </Pressable>
  );
}

export function Badge({
  children,
  color,
  outline = false,
}: {
  children: ReactNode;
  color?: string;
  outline?: boolean;
}) {
  const theme = useTheme();
  const background = outline ? 'transparent' : color ?? theme.backgroundSelected;
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: background,
          borderColor: color ?? theme.border,
        },
      ]}>
      <ThemedText
        type="code"
        style={{
          color: outline ? color ?? theme.textSecondary : color ? '#ffffff' : theme.text,
        }}>
        {children}
      </ThemedText>
    </View>
  );
}

export function Field({
  label,
  multiline = false,
  style,
  ...props
}: TextInputProps & { label: string; multiline?: boolean }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <TextInput
        placeholderTextColor={theme.textSecondary}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={[
          styles.input,
          multiline && styles.textarea,
          { color: theme.text, backgroundColor: theme.card, borderColor: theme.border },
          style,
        ]}
        {...props}
      />
    </View>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { borderColor: selected ? theme.primary : theme.border },
        selected && { backgroundColor: theme.backgroundSelected },
        pressed && styles.pressed,
      ]}>
      <ThemedText type="small" style={{ color: selected ? theme.primary : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

export function LoadingState({ label = 'Chargement...' }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.state}>
      <ActivityIndicator color={theme.primary} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

export function EmptyState({ title, text }: { title: string; text?: string }) {
  return (
    <Card style={styles.stateCard}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {text ? (
        <ThemedText type="small" themeColor="textSecondary" style={styles.description}>
          {text}
        </ThemedText>
      ) : null}
    </Card>
  );
}

export function StatCard({ label, value, icon: Icon }: { label: string; value: number | string; icon: LucideIcon }) {
  const theme = useTheme();
  return (
    <Card style={styles.statCard}>
      <Icon size={20} color={theme.primary} />
      <ThemedText type="subtitle" style={styles.statValue}>
        {String(value)}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </Card>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroller: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    flexGrow: 1,
  },
  safeArea: {
    flex: 1,
    width: '100%',
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    paddingTop: Spacing.two,
    width: '100%',
  },
  contentWithTabs: {
    paddingBottom: BottomTabInset + 96,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  eyebrow: {
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    lineHeight: 34,
  },
  description: {
    marginTop: Spacing.one,
  },
  card: {
    borderRadius: 8,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  headerAction: {
    alignSelf: 'stretch',
  },
  button: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    flexShrink: 1,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
  badge: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    alignSelf: 'flex-start',
  },
  field: {
    gap: Spacing.one,
  },
  input: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    lineHeight: 22,
  },
  textarea: {
    minHeight: 120,
    paddingTop: Spacing.two,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 36,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    justifyContent: 'center',
  },
  state: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.five,
  },
  stateCard: {
    alignItems: 'center',
    paddingVertical: Spacing.four,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
  },
  statValue: {
    fontSize: 30,
    lineHeight: 36,
  },
  nav: {
    position: 'absolute',
    left: Spacing.three,
    right: Spacing.three,
    bottom: Spacing.three,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    padding: Spacing.one,
    gap: Spacing.one,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 22,
    elevation: 8,
  },
  navItem: {
    flex: 1,
    minHeight: 58,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.one,
  },
  navLabel: {
    fontSize: 10,
  },
});
