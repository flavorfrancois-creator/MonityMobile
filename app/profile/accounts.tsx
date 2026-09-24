import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWallets = async () => {
    try {
      const response = await api.get('/wallets');
      setWallets(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWallets();
  }, []);

  const setPrimaryWallet = async (currency: string) => {
    try {
      await api.patch(`/wallets/${currency}/primary`);
      Alert.alert('Succès', `${currency} est maintenant votre portefeuille principal`);
      loadWallets();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Gestion des comptes</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Account Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations du compte</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Numéro de compte</Text>
              <Text style={styles.infoValue}>{user?.account_number || 'N/A'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{user?.phone}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || 'Non défini'}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Pays</Text>
              <Text style={styles.infoValue}>{user?.country || 'N/A'}</Text>
            </View>
          </View>
        </View>

        {/* Wallets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mes portefeuilles ({wallets.length})</Text>
          
          {wallets.map((wallet) => (
            <View key={wallet.id} style={styles.walletCard}>
              <View style={styles.walletInfo}>
                <View style={styles.walletIcon}>
                  <Text style={styles.walletIconText}>{wallet.currency}</Text>
                </View>
                <View style={styles.walletDetails}>
                  <Text style={styles.walletCurrency}>{wallet.currency}</Text>
                  <Text style={styles.walletBalance}>
                    {wallet.balance?.toLocaleString()} {wallet.currency}
                  </Text>
                </View>
              </View>
              <View style={styles.walletActions}>
                {wallet.is_primary ? (
                  <View style={styles.primaryBadge}>
                    <Ionicons name="star" size={14} color="#f59e0b" />
                    <Text style={styles.primaryText}>Principal</Text>
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.setPrimaryBtn}
                    onPress={() => setPrimaryWallet(wallet.currency)}
                  >
                    <Text style={styles.setPrimaryText}>Définir principal</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Limits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limites</Text>
          
          <View style={styles.limitCard}>
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Transfert quotidien</Text>
              <Text style={styles.limitValue}>1,000 USD</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Transfert mensuel</Text>
              <Text style={styles.limitValue}>10,000 USD</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.limitRow}>
              <Text style={styles.limitLabel}>Portefeuilles max</Text>
              <Text style={styles.limitValue}>{user?.max_wallets || 2}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.upgradeBtn} onPress={() => router.push('/profile/kyc')}>
            <Ionicons name="trending-up-outline" size={20} color="#6366f1" />
            <Text style={styles.upgradeBtnText}>Augmenter mes limites</Text>
          </TouchableOpacity>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  infoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#374151',
  },
  walletCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletIconText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  walletDetails: {
    marginLeft: 12,
  },
  walletCurrency: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
  walletBalance: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 2,
  },
  walletActions: {},
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  primaryText: {
    fontSize: 12,
    color: '#f59e0b',
    marginLeft: 4,
  },
  setPrimaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6366f1',
  },
  setPrimaryText: {
    fontSize: 12,
    color: '#6366f1',
  },
  limitCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
  },
  limitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  limitLabel: {
    fontSize: 14,
    color: '#9ca3af',
  },
  limitValue: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  upgradeBtnText: {
    color: '#6366f1',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
});
