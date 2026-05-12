import { router } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { authClient } from '@/lib/auth-client';
import { Button, Card, Field, Header, Screen } from '@/components/mobile-ui';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

function passwordErrors(password: string) {
  return [
    password.length >= 8 ? null : '8 caracteres minimum',
    /[A-Z]/.test(password) ? null : 'Une majuscule',
    /[a-z]/.test(password) ? null : 'Une minuscule',
    /[0-9]/.test(password) ? null : 'Un chiffre',
    /[^A-Za-z0-9]/.test(password) ? null : 'Un caractere special',
  ].filter((item): item is string => Boolean(item));
}

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const errors = passwordErrors(password);

  async function submit() {
    setError(null);
    if (errors.length > 0 || password !== confirmPassword) {
      setError('Le mot de passe ne respecte pas les criteres.');
      return;
    }
    setLoading(true);
    try {
      const result = await authClient.signUp.email({
        email: email.trim(),
        password,
        name: name.trim() || email.split('@')[0],
      });
      if (result.error) {
        setError("Une erreur est survenue lors de l'inscription.");
        return;
      }
      router.replace('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
        Retour
      </Button>
      <Header eyebrow="Inscription" title="Creer un compte" description="Inscrivez-vous avec votre email." />
      <Card>
        {error ? (
          <ThemedText type="smallBold" themeColor="danger">
            {error}
          </ThemedText>
        ) : null}
        <Field label="Nom" value={name} onChangeText={setName} />
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Field
          label="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <View style={styles.actions}>
          <Button variant="outline" icon={showPassword ? EyeOff : Eye} onPress={() => setShowPassword((current) => !current)}>
            {showPassword ? 'Masquer' : 'Afficher'}
          </Button>
        </View>
        {errors.length > 0 ? (
          <View style={styles.rules}>
            {errors.map((item) => (
              <ThemedText key={item} type="code" themeColor="textSecondary">
                {item}
              </ThemedText>
            ))}
          </View>
        ) : (
          <ThemedText type="small" themeColor="success">
            Mot de passe fort
          </ThemedText>
        )}
        <Field
          label="Confirmer le mot de passe"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPassword}
        />
        <Button
          icon={UserPlus}
          disabled={loading || !email || !password || !confirmPassword}
          onPress={submit}>
          {loading ? 'Creation...' : "S'inscrire"}
        </Button>
        <Button variant="ghost" onPress={() => router.push('/login')}>
          Se connecter
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: 'flex-start',
  },
  rules: {
    gap: Spacing.one,
  },
});
