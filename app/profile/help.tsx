import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function HelpScreen() {
  const insets = useSafeAreaInsets();

  const faqs = [
    { q: "Comment ajouter un portefeuille ?", a: "Allez dans l'onglet Portefeuille et appuyez sur le bouton + en haut à droite." },
    { q: "Comment envoyer de l'argent ?", a: "Sélectionnez un portefeuille, appuyez sur 'Envoyer' et entrez le numéro du destinataire." },
    { q: "Comment recharger mon compte ?", a: "Utilisez la fonction 'Recharger' depuis le portefeuille souhaité." },
    { q: "Comment créer une carte virtuelle ?", a: "Allez dans l'onglet Cartes et appuyez sur 'Nouvelle carte'." },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Aide & Support</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Questions fréquentes</Text>
        
        {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <Text style={styles.question}>{faq.q}</Text>
            <Text style={styles.answer}>{faq.a}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Contact</Text>
        
        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('mailto:support@monityworld.com')}
        >
          <Ionicons name="mail-outline" size={24} color="#6366f1" />
          <Text style={styles.contactText}>support@monityworld.com</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.contactItem}
          onPress={() => Linking.openURL('https://wa.me/243000000000')}
        >
          <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          <Text style={styles.contactText}>WhatsApp Support</Text>
        </TouchableOpacity>
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
  sectionTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
    marginTop: 20,
    textTransform: 'uppercase',
  },
  faqItem: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  question: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
    marginBottom: 8,
  },
  answer: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  contactText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 12,
  },
});
