import { router } from "expo-router";
import { ArrowLeft, Save } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

import { authClient } from "@/lib/auth-client";
import {
  Button,
  Card,
  Chip,
  EmptyState,
  Field,
  Header,
  Screen,
} from "@/components/mobile-ui";
import { ThemedText } from "@/components/themed-text";
import { Spacing } from "@/constants/theme";

export default function SettingsScreen() {
  const sessionQuery = authClient.useSession();
  const session = sessionQuery.data;
  const [tab, setTab] = useState<"profile" | "account">("profile");
  const [username, setUsername] = useState(session?.user?.email ?? "");
  const [bio, setBio] = useState("");
  const [firstName, setFirstName] = useState(
    session?.user?.name?.split(" ")[0] ?? "",
  );
  const [lastName, setLastName] = useState(
    session?.user?.name?.split(" ").slice(1).join(" ") ?? "",
  );
  const [saved, setSaved] = useState(false);

  if (!session?.user) {
    return (
      <Screen>
        <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
          Retour
        </Button>
        <EmptyState
          title="Connexion requise"
          text="Connectez-vous pour acceder aux parametres."
        />
        <Button onPress={() => router.push("/login")}>Se connecter</Button>
      </Screen>
    );
  }

  function save() {
    setSaved(true);
  }

  return (
    <Screen>
      <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
        Retour
      </Button>
      <Header eyebrow="Parametres" title="Reglages du compte" />

      <View style={styles.tabs}>
        <Chip
          label="Profil"
          selected={tab === "profile"}
          onPress={() => setTab("profile")}
        />
        <Chip
          label="Compte"
          selected={tab === "account"}
          onPress={() => setTab("account")}
        />
      </View>

      <Card>
        {tab === "profile" ? (
          <>
            <ThemedText type="smallBold">Informations publiques</ThemedText>
            <Field label="Pseudo" value={username} onChangeText={setUsername} />
            <Field label="Bio" value={bio} onChangeText={setBio} multiline />
          </>
        ) : null}
        {tab === "account" ? (
          <>
            <ThemedText type="smallBold">Informations personnelles</ThemedText>
            <Field
              label="Prenom"
              value={firstName}
              onChangeText={setFirstName}
            />
            <Field label="Nom" value={lastName} onChangeText={setLastName} />
            <Field label="Email" value={session.user.email} editable={false} />
          </>
        ) : null}

        {saved ? (
          <ThemedText type="small" themeColor="success">
            Preferences enregistrees localement.
          </ThemedText>
        ) : null}
        <Button icon={Save} onPress={save}>
          Enregistrer
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
});
