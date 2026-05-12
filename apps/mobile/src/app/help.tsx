import { router } from "expo-router";
import {
  Accessibility,
  ArrowLeft,
  DatabaseZap,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react-native";

import { Button, Card, Header, Screen } from "@/components/mobile-ui";
import { ThemedText } from "@/components/themed-text";

const items = [
  {
    icon: ShieldCheck,
    title: "Ressources moderees",
    text: "Les ressources proposees par les citoyens passent en validation avant publication publique.",
  },
  {
    icon: LockKeyhole,
    title: "Donnees personnelles",
    text: "La progression reste rattachee au compte connecte et les donnees sensibles sont minimisées.",
  },
  {
    icon: Accessibility,
    title: "Accessibilite",
    text: "Les ecrans privilegient des libelles explicites et un contraste lisible.",
  },
  {
    icon: DatabaseZap,
    title: "Statistiques",
    text: "Les indicateurs portent sur la consultation, la recherche, les creations et l’exploitation.",
  },
];

export default function HelpScreen() {
  return (
    <Screen>
      <Button variant="ghost" icon={ArrowLeft} onPress={() => router.back()}>
        Retour
      </Button>
      <Header
        eyebrow="Aide"
        title="Reperes d'utilisation et de confiance"
        description="La plateforme distingue l'acces public, les fonctionnalites de compte citoyen et les espaces de moderation."
      />

      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title}>
            <Icon size={20} color="#0f766e" />
            <ThemedText type="smallBold">{item.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {item.text}
            </ThemedText>
          </Card>
        );
      })}

      <Button onPress={() => router.push("/resources")}>
        Retour au catalogue
      </Button>
    </Screen>
  );
}
