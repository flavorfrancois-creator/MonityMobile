import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function ReceiveScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const options = [
    {
      icon: 'qr-code',
      title: 'QR Code',
      subtitle: 'Partager votre QR code de paiement',
      route: '/qr',
      colors: ['#6366f1', '#4f46e5'],
    },
    {
      icon: 'link',
      title: 'Lien de paiement',
      subtitle: 'Créer un lien pour recevoir de l\'argent',
      route: '/payment-links/create',
      colors: ['#10b981', '#059669'],
    },
    {
      icon: 'card',
      title: 'Scanner carte NFC',
      subtitle: 'Recevoir via carte NFC Monity',
      route: '/nfc-scan',
      colors: ['#8b5cf6', '#7c3aed'],
    },
    {
      icon: 'barcode',
      title: 'Scanner code-barres',
      subtitle: 'Recevoir via code-barres',
      route: '/barcode-scan',
      colors: ['#f59e0b', '#d97706'],
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recevoir</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* Account info */}
        <View style={styles.accountCard}>
          <Text style={styles.accountLabel}>Votre numéro de compte</Text>
          <Text style={styles.accountNumber}>{user?.account_number}</Text>
          <Text style={styles.accountPhone}>{user?.phone}</Text>
        </View>

        {/* Receive options */}
        <Text style={styles.sectionTitle}>Choisir une méthode</Text>
        <View style={styles.options}>
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => router.push(option.route as any)}
            >
              <LinearGradient
                colors={option.colors as [string, string]}
                style={styles.optionIcon}
              >
                <Ionicons name={option.icon as any} size={24} color="#fff" />
              </LinearGradient>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>
      </View>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  accountCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
  },
  accountLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  accountNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
    marginBottom: 4,
  },
  accountPhone: {
    fontSize: 14,
    color: '#6366f1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
