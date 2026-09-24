import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';

export default function QRScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (user) {
      // Generate QR code with payment info
      const paymentData = JSON.stringify({
        type: 'monity_payment',
        account: user.account_number,
        phone: user.phone,
        name: user.name,
      });
      setQrValue(paymentData);
    }
  }, [user]);

  const copyAccountNumber = async () => {
    if (user?.account_number) {
      await Clipboard.setStringAsync(user.account_number);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copié', 'Numéro de compte copié dans le presse-papiers');
    }
  };

  const copyPhone = async () => {
    if (user?.phone) {
      await Clipboard.setStringAsync(user.phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Copié', 'Numéro de téléphone copié dans le presse-papiers');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mon QR Code</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.qrCard}>
          <View style={styles.qrContainer}>
            {qrValue ? (
              <QRCode
                value={qrValue}
                size={200}
                backgroundColor="#fff"
                color="#0a0a0f"
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <Ionicons name="qr-code" size={100} color="#6b7280" />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.instruction}>
            Scannez ce QR code pour me payer
          </Text>
        </View>

        <View style={styles.infoSection}>
          <TouchableOpacity style={styles.infoItem} onPress={copyAccountNumber}>
            <View style={styles.infoIcon}>
              <Ionicons name="wallet-outline" size={20} color="#6366f1" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>N° de compte</Text>
              <Text style={styles.infoValue}>{user?.account_number}</Text>
            </View>
            <Ionicons name="copy-outline" size={20} color="#6b7280" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem} onPress={copyPhone}>
            <View style={styles.infoIcon}>
              <Ionicons name="call-outline" size={20} color="#10b981" />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
            <Ionicons name="copy-outline" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.shareBtn}
          onPress={() => {
            // Share functionality
            Alert.alert('Partager', 'Fonctionnalité de partage bientôt disponible');
          }}
        >
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.shareBtnText}>Partager mon QR Code</Text>
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
    alignItems: 'center',
  },
  qrCard: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  infoSection: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  infoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoText: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    width: '100%',
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
