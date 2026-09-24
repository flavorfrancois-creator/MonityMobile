import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { transactionApi } from '../src/services/api';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  description?: string;
  receiver_name?: string;
  receiver_phone?: string;
  sender_name?: string;
  sender_phone?: string;
}

export default function TransactionHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const loadTransactions = useCallback(async (pageNum = 1, reset = false) => {
    try {
      const response = await transactionApi.getHistory(pageNum, 20);
      const newTx = response.data.transactions || [];
      
      if (reset) {
        setTransactions(newTx);
      } else {
        setTransactions(prev => [...prev, ...newTx]);
      }
      
      setHasMore(newTx.length === 20);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTransactions(1, true);
  }, [loadTransactions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await loadTransactions(1, true);
    setRefreshing(false);
  }, [loadTransactions]);

  const loadMore = () => {
    if (hasMore && !isLoading) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadTransactions(nextPage);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`;
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer_sent':
      case 'transfer':
        return { name: 'arrow-up-circle', color: '#ef4444' };
      case 'transfer_received':
        return { name: 'arrow-down-circle', color: '#10b981' };
      case 'recharge':
        return { name: 'add-circle', color: '#10b981' };
      case 'withdrawal':
        return { name: 'remove-circle', color: '#ef4444' };
      case 'card_recharge':
        return { name: 'card', color: '#6366f1' };
      case 'card_transfer':
        return { name: 'swap-horizontal', color: '#8b5cf6' };
      default:
        return { name: 'swap-horizontal-outline', color: '#6b7280' };
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: 'Terminé', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' };
      case 'pending':
        return { text: 'En attente', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
      case 'failed':
        return { text: 'Échoué', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
      default:
        return { text: status, color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)' };
    }
  };

  const filteredTransactions = filter === 'all'
    ? transactions
    : transactions.filter(tx => {
        if (filter === 'sent') return tx.type.includes('sent') || tx.type === 'transfer' || tx.type === 'withdrawal';
        if (filter === 'received') return tx.type.includes('received') || tx.type === 'recharge';
        return true;
      });

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const icon = getTransactionIcon(item.type);
    const status = getStatusBadge(item.status);
    const isOutgoing = item.type.includes('sent') || item.type === 'transfer' || item.type === 'withdrawal';

    return (
      <TouchableOpacity style={styles.transactionItem}>
        <View style={[styles.txIcon, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        <View style={styles.txInfo}>
          <Text style={styles.txTitle} numberOfLines={1}>
            {item.receiver_name || item.sender_name || item.description || item.type}
          </Text>
          <Text style={styles.txDate}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.txRight}>
          <Text style={[styles.txAmount, { color: icon.color }]}>
            {isOutgoing ? '-' : '+'}{formatCurrency(item.amount, item.currency)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>{status.text}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const filters = [
    { key: 'all', label: 'Tous' },
    { key: 'sent', label: 'Envoyés' },
    { key: 'received', label: 'Reçus' },
  ];

  if (isLoading && transactions.length === 0) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.filters}>
        {filters.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.filterBtnText, filter === f.key && styles.filterBtnTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTransactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyStateText}>Aucune transaction</Text>
          </View>
        }
        ListFooterComponent={
          hasMore && transactions.length > 0 ? (
            <View style={styles.footer}>
              <ActivityIndicator size="small" color="#6366f1" />
            </View>
          ) : null
        }
      />
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filterBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#1f2937',
  },
  filterBtnActive: {
    backgroundColor: '#6366f1',
  },
  filterBtnText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  filterBtnTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  txIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 4,
  },
  txDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 16,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});
