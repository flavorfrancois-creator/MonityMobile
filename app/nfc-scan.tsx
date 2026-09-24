import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NfcManager, { NfcTech, Ndef } from 'react-native-nfc-manager';
import * as Haptics from 'expo-haptics';
import { cardApi } from '../src/services/api';

interface CardInfo {
  id: string;
  name: string;
  balance: number;
  currency: string;
  owner_name?: string;
  nfc_serial_number: string;
  status: string;
}

export default function NFCScanScreen() {
  const insets = useSafeAreaInsets();
  const [isScanning, setIsScanning] = useState(false);
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);
  const [nfcEnabled, setNfcEnabled] = useState<boolean | null>(null);
  const [scannedCard, setScannedCard] = useState<CardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    checkNfcSupport();
    return () => {
      NfcManager.cancelTechnologyRequest().catch(() => {});
    };
  }, []);

  useEffect(() => {
    if (isScanning) {
      startPulseAnimation();
    }
  }, [isScanning]);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const checkNfcSupport = async () => {
    try {
      const supported = await NfcManager.isSupported();
      setNfcSupported(supported);
      if (supported) {
        await NfcManager.start();
        const enabled = await NfcManager.isEnabled();
        setNfcEnabled(enabled);
      }
    } catch (error) {
      console.error('NFC check error:', error);
      setNfcSupported(false);
    }
  };

  const startNfcScan = async () => {
    if (!nfcSupported || !nfcEnabled) {
      Alert.alert('Erreur', 'NFC non disponible sur cet appareil');
      return;
    }

    setIsScanning(true);
    setScannedCard(null);

    try {
      // Request NFC technology
      await NfcManager.requestTechnology(NfcTech.Ndef);

      // Get the tag
      const tag = await NfcManager.getTag();
      
      if (tag) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Format NFC serial number from tag.id
        const serialNumber = formatNfcSerial(tag.id || '');
        console.log('NFC Tag scanned:', serialNumber);

        // Look up card by NFC serial
        if (serialNumber) {
          await lookupCardByNfc(serialNumber);
        }
      }
    } catch (error: any) {
      if (error.message !== 'cancelled') {
        console.error('NFC scan error:', error);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Erreur', 'Impossible de lire la carte NFC');
      }
    } finally {
      NfcManager.cancelTechnologyRequest().catch(() => {});
      setIsScanning(false);
    }
  };

  const formatNfcSerial = (id: string): string => {
    // Format: XX:XX:XX:XX:XX:XX:XX
    if (!id) return '';
    const bytes = id.match(/.{1,2}/g) || [];
    return bytes.join(':').toUpperCase();
  };

  const lookupCardByNfc = async (nfcSerial: string) => {
    setIsLoading(true);
    try {
      const response = await cardApi.getCardByNFC(nfcSerial);
      setScannedCard(response.data.card);
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert(
          'Carte non trouvée',
          'Cette carte NFC n\'est pas enregistrée dans le système Monity.',
          [
            { text: 'OK' },
            { text: 'Réessayer', onPress: startNfcScan },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer les informations de la carte');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const cancelScan = async () => {
    try {
      await NfcManager.cancelTechnologyRequest();
    } catch (error) {
      // Ignore
    }
    setIsScanning(false);
  };

  const handlePayment = () => {
    if (scannedCard) {
      router.push({
        pathname: '/nfc-payment',
        params: { cardId: scannedCard.id },
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`;
  };

  // NFC not supported view
  if (nfcSupported === false) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centerContent}>
          <View style={styles.errorIcon}>
            <Ionicons name="phone-portrait-outline" size={64} color="#ef4444" />
          </View>
          <Text style={styles.errorTitle}>NFC non supporté</Text>
          <Text style={styles.errorText}>
            Votre appareil ne supporte pas la technologie NFC.
          </Text>
        </View>
      </View>
    );
  }

  // NFC disabled view
  if (nfcEnabled === false) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centerContent}>
          <View style={styles.warningIcon}>
            <Ionicons name="warning" size={64} color="#f59e0b" />
          </View>
          <Text style={styles.errorTitle}>NFC désactivé</Text>
          <Text style={styles.errorText}>
            Veuillez activer le NFC dans les paramètres de votre appareil.
          </Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => {
              if (Platform.OS === 'android') {
                NfcManager.goToNfcSetting();
              }
            }}
          >
            <Text style={styles.settingsBtnText}>Ouvrir les paramètres</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scanner NFC</Text>
        <View style={{ width: 44 }} />
      </View>

      {scannedCard ? (
        // Card found view
        <View style={styles.cardFoundContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color="#10b981" />
          </View>
          <Text style={styles.cardFoundTitle}>Carte détectée</Text>

          <LinearGradient
            colors={['#6366f1', '#4f46e5']}
            style={styles.cardPreview}
          >
            <Text style={styles.cardName}>{scannedCard.name}</Text>
            {scannedCard.owner_name && (
              <Text style={styles.cardOwner}>{scannedCard.owner_name}</Text>
            )}
            <Text style={styles.cardBalance}>
              {formatCurrency(scannedCard.balance, scannedCard.currency)}
            </Text>
            <View style={styles.cardBadge}>
              <Ionicons name="phone-portrait" size={14} color="#fff" />
              <Text style={styles.cardBadgeText}>NFC</Text>
            </View>
          </LinearGradient>

          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handlePayment}>
              <Ionicons name="send" size={20} color="#fff" />
              <Text style={styles.actionBtnText}>Payer</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.secondaryBtn]}
              onPress={() => setScannedCard(null)}
            >
              <Ionicons name="refresh" size={20} color="#6366f1" />
              <Text style={[styles.actionBtnText, { color: '#6366f1' }]}>Rescanner</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : isScanning ? (
        // Scanning view
        <View style={styles.scanningContainer}>
          <Animated.View
            style={[
              styles.scanCircle,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View style={styles.scanCircleInner}>
              <Ionicons name="phone-portrait" size={64} color="#6366f1" />
            </View>
          </Animated.View>
          <Text style={styles.scanningTitle}>En attente...</Text>
          <Text style={styles.scanningText}>
            Approchez votre carte NFC Monity{"\n"}du dos de votre téléphone
          </Text>
          <TouchableOpacity style={styles.cancelBtn} onPress={cancelScan}>
            <Text style={styles.cancelBtnText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        // Loading view
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Recherche de la carte...</Text>
        </View>
      ) : (
        // Initial view
        <View style={styles.initialContainer}>
          <View style={styles.nfcIconContainer}>
            <Ionicons name="phone-portrait" size={80} color="#6366f1" />
          </View>
          <Text style={styles.initialTitle}>Scanner une carte NFC</Text>
          <Text style={styles.initialText}>
            Utilisez votre téléphone pour scanner une carte NFC Monity et effectuer des paiements ou vérifier le solde.
          </Text>

          <TouchableOpacity style={styles.scanBtn} onPress={startNfcScan}>
            <Ionicons name="scan" size={24} color="#fff" />
            <Text style={styles.scanBtnText}>Commencer le scan</Text>
          </TouchableOpacity>

          <View style={styles.tips}>
            <Text style={styles.tipsTitle}>Conseils</Text>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>Placez la carte au dos du téléphone</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>Maintenez la carte immobile</Text>
            </View>
            <View style={styles.tip}>
              <Ionicons name="checkmark-circle" size={16} color="#10b981" />
              <Text style={styles.tipText}>Retirez les coques épaisses</Text>
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
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
    paddingBottom: 16,
  },
  closeBtn: {
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  settingsBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  settingsBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  initialContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  nfcIconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  initialTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  initialText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
    marginBottom: 40,
  },
  scanBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  tips: {
    width: '100%',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  scanningContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  scanCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  scanCircleInner: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanningTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  scanningText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 32,
  },
  cancelBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6b7280',
  },
  cancelBtnText: {
    color: '#9ca3af',
    fontSize: 16,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 14,
    marginTop: 16,
  },
  cardFoundContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  successIcon: {
    marginBottom: 16,
  },
  cardFoundTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
  },
  cardPreview: {
    width: '100%',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  cardOwner: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 16,
  },
  cardBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
