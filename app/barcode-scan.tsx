import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions, BarcodeScanningResult } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { cardApi } from '../src/services/api';

interface CardInfo {
  id: string;
  name: string;
  balance: number;
  currency: string;
  owner_name?: string;
  barcode: string;
  status: string;
}

export default function BarcodeScanScreen() {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(true);
  const [scannedCard, setScannedCard] = useState<CardInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [flashOn, setFlashOn] = useState(false);

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (!isScanning || isLoading) return;

    const barcode = result.data;
    
    // Only process Monity barcodes (start with MVC)
    if (!barcode.startsWith('MVC')) {
      return;
    }

    setIsScanning(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    console.log('Barcode scanned:', barcode);

    await lookupCardByBarcode(barcode);
  };

  const lookupCardByBarcode = async (barcode: string) => {
    setIsLoading(true);
    try {
      const response = await cardApi.getCardByBarcode(barcode);
      setScannedCard(response.data.card);
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert(
          'Carte non trouvée',
          'Ce code-barres n\'est pas enregistré dans le système Monity.',
          [
            { text: 'OK' },
            { text: 'Réessayer', onPress: () => {
              setIsScanning(true);
            }},
          ]
        );
      } else {
        Alert.alert('Erreur', 'Impossible de récupérer les informations de la carte');
        setIsScanning(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = () => {
    if (scannedCard) {
      router.push({
        pathname: '/barcode-payment',
        params: { cardId: scannedCard.id },
      });
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`;
  };

  const resetScan = () => {
    setScannedCard(null);
    setIsScanning(true);
  };

  // Permission not determined yet
  if (!permission) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  // Permission denied
  if (!permission.granted) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.centerContent}>
          <View style={styles.errorIcon}>
            <Ionicons name="camera-outline" size={64} color="#f59e0b" />
          </View>
          <Text style={styles.errorTitle}>Accès caméra requis</Text>
          <Text style={styles.errorText}>
            Pour scanner les codes-barres Monity, nous avons besoin d'accéder à votre caméra.
          </Text>
          <TouchableOpacity style={styles.permissionBtn} onPress={requestPermission}>
            <Text style={styles.permissionBtnText}>Autoriser l'accès</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {scannedCard ? (
        // Card found view
        <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
          <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Carte détectée</Text>
            <View style={{ width: 44 }} />
          </View>

          <View style={styles.cardFoundContainer}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
            </View>

            <LinearGradient
              colors={['#10b981', '#059669']}
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
                <Ionicons name="barcode" size={14} color="#fff" />
                <Text style={styles.cardBadgeText}>{scannedCard.barcode}</Text>
              </View>
            </LinearGradient>

            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handlePayment}>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Payer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.secondaryBtn]}
                onPress={resetScan}
              >
                <Ionicons name="refresh" size={20} color="#10b981" />
                <Text style={[styles.actionBtnText, { color: '#10b981' }]}>Rescanner</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      ) : (
        // Camera view
        <>
          <CameraView
            style={styles.camera}
            facing="back"
            enableTorch={flashOn}
            barcodeScannerSettings={{
              barcodeTypes: ['code128', 'code39', 'code93', 'ean13', 'ean8', 'qr'],
            }}
            onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
          />

          {/* Overlay */}
          <View style={styles.overlay}>
            <View style={[styles.overlayHeader, { paddingTop: insets.top + 10 }]}>
              <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.overlayTitle}>Scanner Code-barres</Text>
              <TouchableOpacity
                style={styles.flashBtn}
                onPress={() => setFlashOn(!flashOn)}
              >
                <Ionicons
                  name={flashOn ? 'flash' : 'flash-off'}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>
            </View>

            {/* Scan frame */}
            <View style={styles.scanArea}>
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                {isLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#10b981" />
                  </View>
                )}
              </View>
            </View>

            <View style={styles.overlayFooter}>
              <Text style={styles.instruction}>
                Alignez le code-barres de votre carte Monity{"\n"}dans le cadre
              </Text>
              <View style={styles.tips}>
                <View style={styles.tip}>
                  <Ionicons name="sunny-outline" size={16} color="#9ca3af" />
                  <Text style={styles.tipText}>Bonne luminosité</Text>
                </View>
                <View style={styles.tip}>
                  <Ionicons name="hand-left-outline" size={16} color="#9ca3af" />
                  <Text style={styles.tipText}>Main stable</Text>
                </View>
              </View>
            </View>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  scanArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 280,
    height: 180,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#10b981',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  overlayFooter: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 32,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  instruction: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  tips: {
    flexDirection: 'row',
    gap: 24,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  errorIcon: {
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
  permissionBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  cardFoundContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  successIcon: {
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
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardBadgeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
    fontFamily: 'monospace',
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
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#10b981',
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
