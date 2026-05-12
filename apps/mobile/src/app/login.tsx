import { router } from 'expo-router';
import { ArrowLeft, LogIn } from 'lucide-react-native';
import { useState } from 'react';

import { authClient } from '@/lib/auth-client';
import { Button, Card, Field, Header, Screen } from '@/components/mobile-ui';
import { ThemedText } from '@/components/themed-text';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
        rememberMe: true,
      });
      if (result.error) {
        setError(result.error.code === 'EMAIL_NOT_VERIFIED' ? 'Veuillez verifier votre email.' : 'Identifiants invalides.');
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
      <Header eyebrow="Connexion" title="Bienvenue" description="Connectez-vous avec votre compte citoyen." />
      <Card>
        {error ? (
          <ThemedText type="smallBold" themeColor="danger">
            {error}
          </ThemedText>
        ) : null}
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
        <Button icon={LogIn} disabled={loading || !email || !password} onPress={submit}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
        <Button variant="ghost" onPress={() => router.push('/signup')}>
          Creer un compte
        </Button>
      </Card>
    </Screen>
  );
}
