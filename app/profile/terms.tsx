import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Conditions d'utilisation</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.lastUpdated}>Dernière mise à jour: Février 2026</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Acceptation des conditions</Text>
          <Text style={styles.text}>
            En utilisant l'application Monity World, vous acceptez d'être lié par les présentes conditions d'utilisation. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Services</Text>
          <Text style={styles.text}>
            Monity World fournit des services de portefeuille électronique, de transfert d'argent, et de gestion de cartes virtuelles. Les services sont soumis aux lois et réglementations en vigueur.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Compte utilisateur</Text>
          <Text style={styles.text}>
            Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe. Vous acceptez de notifier immédiatement Monity World de toute utilisation non autorisée de votre compte.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Frais et tarifs</Text>
          <Text style={styles.text}>
            Les frais applicables aux transactions sont affichés avant chaque opération. Monity World se réserve le droit de modifier les tarifs avec un préavis raisonnable.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Protection des données</Text>
          <Text style={styles.text}>
            Vos données personnelles sont protégées conformément à notre politique de confidentialité. Nous ne partageons pas vos informations avec des tiers sans votre consentement explicite.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Limitation de responsabilité</Text>
          <Text style={styles.text}>
            Monity World ne saurait être tenu responsable des pertes indirectes ou consécutives résultant de l'utilisation de l'application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Contact</Text>
          <Text style={styles.text}>
            Pour toute question concernant ces conditions, contactez-nous à: legal@monityworld.com
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 22,
  },
});
