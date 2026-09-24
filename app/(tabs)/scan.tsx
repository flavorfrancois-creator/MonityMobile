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
import { LinearGradient } from 'expo-linear-gradient';

export default function ScanScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Scanner</Text>
        <Text style={styles.subtitle}>Choisissez votre méthode de scan</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.scanOption}
          onPress={() => router.push('/nfc-scan')}
        >
          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanOptionGradient}
          >
            <View style={styles.scanIconContainer}>
              <Ionicons name="phone-portrait" size={48} color="#fff" />
            </View>
            <Text style={styles.scanOptionTitle}>Scanner NFC</Text>
            <Text style={styles.scanOptionDesc}>
              Approchez votre carte Monity NFC du téléphone pour effectuer un paiement ou une identification
            </Text>
            <View style={styles.scanOptionArrow}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.scanOption}
          onPress={() => router.push('/barcode-scan')}
        >
          <LinearGradient
            colors={['#10b981', '#059669']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.scanOptionGradient}
          >
            <View style={styles.scanIconContainer}>
              <Ionicons name="barcode" size={48} color="#fff" />
            </View>
            <Text style={styles.scanOptionTitle}>Scanner Code-barres</Text>
            <Text style={styles.scanOptionDesc}>
              Scannez le code-barres de votre carte Monity pour accéder aux transactions
            </Text>
            <View style={styles.scanOptionArrow}>
              <Ionicons name="arrow-forward" size={24} color="#fff" />
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.qrOption}
          onPress={() => router.push('/qr-scan')}
        >
          <View style={styles.qrIconContainer}>
            <Ionicons name="qr-code" size={32} color="#8b5cf6" />
          </View>
          <View style={styles.qrTextContainer}>
            <Text style={styles.qrOptionTitle}>Scanner QR Code</Text>
            <Text style={styles.qrOptionDesc}>Pour liens de paiement</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6b7280" />
        </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    gap: 16,
  },
  scanOption: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanOptionGradient: {
    padding: 24,
    alignItems: 'center',
  },
  scanIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  scanOptionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  scanOptionDesc: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scanOptionArrow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 16,
    gap: 16,
  },
  qrIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrTextContainer: {
    flex: 1,
  },
  qrOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  qrOptionDesc: {
    fontSize: 12,
    color: '#9ca3af',
  },
});
