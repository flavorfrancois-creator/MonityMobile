import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Share,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import * as Clipboard from 'expo-clipboard';

export default function PaymentLinksScreen() {
  const insets = useSafeAreaInsets();
  const [links, setLinks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const response = await api.get('/payment-links');
      setLinks(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading payment links:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const copyLink = async (link: any) => {
    const url = `https://pay.monityworld.com/${link.code}`;
    await Clipboard.setStringAsync(url);
    Alert.alert('Copié!', 'Lien de paiement copié');
  };

  const shareLink = async (link: any) => {
    const url = `https://pay.monityworld.com/${link.code}`;
    try {
      await Share.share({
        message: `Payez ${link.amount} ${link.currency} via Monity World:\n${url}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
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
        <Text style={styles.title}>Liens de paiement</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {links.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="link-outline" size={48} color="#6b7280" />
            <Text style={styles.emptyText}>Aucun lien de paiement</Text>
            <Text style={styles.emptySubtext}>Créez des liens pour recevoir des paiements</Text>
          </View>
        ) : (
          links.map((link) => (
            <View key={link.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{link.description || 'Lien de paiement'}</Text>
                <View style={[styles.badge, link.status === 'active' ? styles.badgeActive : styles.badgeUsed]}>
                  <Text style={[styles.badgeText, link.status !== 'active' && { color: '#9ca3af' }]}>
                    {link.status === 'active' ? 'Actif' : 'Utilisé'}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.amount}>
                {link.amount?.toLocaleString()} {link.currency}
              </Text>
              
              <Text style={styles.code}>Code: {link.code}</Text>
              
              <View style={styles.actions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => copyLink(link)}>
                  <Ionicons name="copy-outline" size={20} color="#6366f1" />
                  <Text style={styles.actionText}>Copier</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn} onPress={() => shareLink(link)}>
                  <Ionicons name="share-social-outline" size={20} color="#6366f1" />
                  <Text style={styles.actionText}>Partager</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
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
    padding: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#fff',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 8,
  },
  code: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeUsed: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    color: '#10b981',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    color: '#6366f1',
    marginLeft: 6,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
