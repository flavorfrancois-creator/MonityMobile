import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { walletApi, transactionApi } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Wallet {
  id: string;
  currency: string;
  balance: number;
  is_primary: boolean;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description?: string;
  receiver_name?: string;
  sender_name?: string;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);

  const loadData = useCallback(async () => {
    try {
      const [walletsRes, txRes] = await Promise.all([
        walletApi.getWallets(),
        transactionApi.getHistory(1, 5),
      ]);
      setWallets(walletsRes.data.wallets || []);
      setTransactions(txRes.data.transactions || []);
      
      // Calculate total balance in USD
      const total = (walletsRes.data.wallets || []).reduce(
        (acc: number, w: Wallet) => acc + w.balance,
        0
      );
      setTotalBalance(total);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    refreshUser();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer_sent':
      case 'transfer':
        return { name: 'arrow-up', color: '#ef4444' };
      case 'transfer_received':
        return { name: 'arrow-down', color: '#10b981' };
      case 'recharge':
        return { name: 'add-circle', color: '#10b981' };
      case 'withdrawal':
        return { name: 'remove-circle', color: '#ef4444' };
      case 'card_recharge':
        return { name: 'card', color: '#6366f1' };
      default:
        return { name: 'swap-horizontal', color: '#6b7280' };
    }
  };

  const quickActions = [
    { icon: 'send', label: 'Envoyer', route: '/send', color: '#6366f1' },
    { icon: 'download', label: 'Recevoir', route: '/receive', color: '#10b981' },
    { icon: 'card', label: 'Recharger', route: '/recharge', color: '#f59e0b' },
    { icon: 'qr-code', label: 'QR Code', route: '/qr', color: '#8b5cf6' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>{user?.name}</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
            <View style={styles.notifBadge} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#6366f1', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <Text style={styles.balanceLabel}>Solde total</Text>
          <Text style={styles.balanceAmount}>
            {formatCurrency(totalBalance, 'USD')}
          </Text>
          <View style={styles.balanceDetails}>
            <View style={styles.balanceItem}>
              <Ionicons name="trending-up" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balanceItemText}>
                {wallets.length} portefeuille{wallets.length > 1 ? 's' : ''}
              </Text>
            </View>
            <View style={styles.balanceItem}>
              <Ionicons name="shield-checkmark" size={16} color="rgba(255,255,255,0.8)" />
              <Text style={styles.balanceItemText}>
                {user?.kyc_status === 'approved' ? 'Vérifié' : 'Non vérifié'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.quickAction}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
                <Ionicons name={action.icon as any} size={24} color={action.color} />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* NFC & Barcode Scan */}
        <View style={styles.scanSection}>
          <TouchableOpacity
            style={styles.scanCard}
            onPress={() => router.push('/nfc-scan')}
          >
            <LinearGradient
              colors={['#1f2937', '#374151']}
              style={styles.scanCardGradient}
            >
              <Ionicons name="phone-portrait" size={32} color="#6366f1" />
              <View style={styles.scanCardText}>
                <Text style={styles.scanCardTitle}>Scanner NFC</Text>
                <Text style={styles.scanCardSubtitle}>Cartes Monity</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.scanCard}
            onPress={() => router.push('/barcode-scan')}
          >
            <LinearGradient
              colors={['#1f2937', '#374151']}
              style={styles.scanCardGradient}
            >
              <Ionicons name="barcode" size={32} color="#10b981" />
              <View style={styles.scanCardText}>
                <Text style={styles.scanCardTitle}>Scanner Code</Text>
                <Text style={styles.scanCardSubtitle}>Code-barres</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Transactions récentes</Text>
            <TouchableOpacity onPress={() => router.push('/history')}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={48} color="#6b7280" />
              <Text style={styles.emptyStateText}>Aucune transaction</Text>
            </View>
          ) : (
            transactions.map((tx) => {
              const icon = getTransactionIcon(tx.type);
              return (
                <View key={tx.id} style={styles.transaction}>
                  <View style={[styles.txIcon, { backgroundColor: icon.color + '20' }]}>
                    <Ionicons name={icon.name as any} size={20} color={icon.color} />
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txTitle}>
                      {tx.receiver_name || tx.sender_name || tx.description || tx.type}
                    </Text>
                    <Text style={styles.txDate}>{formatDate(tx.created_at)}</Text>
                  </View>
                  <Text style={[styles.txAmount, { color: icon.color }]}>
                    {tx.type.includes('received') || tx.type === 'recharge' ? '+' : '-'}
                    {formatCurrency(tx.amount, tx.currency)}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0f',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 14,
    color: '#9ca3af',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  notifBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
  },
  balanceCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  balanceDetails: {
    flexDirection: 'row',
    gap: 24,
  },
  balanceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceItemText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickAction: {
    alignItems: 'center',
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    color: '#9ca3af',
  },
  scanSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  scanCard: {
    flex: 1,
  },
  scanCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 12,
  },
  scanCardText: {
    flex: 1,
  },
  scanCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  scanCardSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  section: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  seeAll: {
    fontSize: 14,
    color: '#6366f1',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#1f2937',
    borderRadius: 16,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 12,
  },
  transaction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  txAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
