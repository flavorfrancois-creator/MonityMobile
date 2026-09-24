import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

export default function GroupsScreen() {
  const insets = useSafeAreaInsets();
  const [savings, setSavings] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'savings' | 'groups'>('savings');

  const loadData = async () => {
    try {
      const [savingsRes, groupsRes] = await Promise.all([
        api.get('/savings'),
        api.get('/groups'),
      ]);
      setSavings(Array.isArray(savingsRes.data) ? savingsRes.data : []);
      setGroups(Array.isArray(groupsRes.data) ? groupsRes.data : []);
    } catch (error) {
      console.error('Error loading data:', error);
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
        <Text style={styles.title}>Épargne & Cotisations</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'savings' && styles.tabActive]}
          onPress={() => setActiveTab('savings')}
        >
          <Text style={[styles.tabText, activeTab === 'savings' && styles.tabTextActive]}>
            Épargnes ({savings.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'groups' && styles.tabActive]}
          onPress={() => setActiveTab('groups')}
        >
          <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
            Tontines ({groups.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />}
      >
        {activeTab === 'savings' ? (
          <>
            {savings.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="wallet-outline" size={48} color="#6b7280" />
                <Text style={styles.emptyText}>Aucune épargne</Text>
                <Text style={styles.emptySubtext}>Créez votre première épargne</Text>
              </View>
            ) : (
              savings.map((saving) => (
                <View key={saving.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{saving.name || 'Épargne'}</Text>
                    <View style={[styles.badge, saving.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
                      <Text style={styles.badgeText}>{saving.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardAmount}>
                    {saving.amount?.toLocaleString()} {saving.currency}
                  </Text>
                  {saving.target_amount && (
                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View 
                          style={[
                            styles.progressFill, 
                            { width: `${Math.min(100, (saving.amount / saving.target_amount) * 100)}%` }
                          ]} 
                        />
                      </View>
                      <Text style={styles.progressText}>
                        {Math.round((saving.amount / saving.target_amount) * 100)}% de {saving.target_amount} {saving.currency}
                      </Text>
                    </View>
                  )}
                </View>
              ))
            )}
          </>
        ) : (
          <>
            {groups.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="people-outline" size={48} color="#6b7280" />
                <Text style={styles.emptyText}>Aucune tontine</Text>
                <Text style={styles.emptySubtext}>Rejoignez ou créez un groupe</Text>
              </View>
            ) : (
              groups.map((group) => (
                <TouchableOpacity key={group.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{group.name}</Text>
                    <View style={styles.membersBadge}>
                      <Ionicons name="people" size={14} color="#6366f1" />
                      <Text style={styles.membersText}>{group.members?.length || 0}</Text>
                    </View>
                  </View>
                  <Text style={styles.cardSubtitle}>{group.description || 'Groupe de cotisation'}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.contribution}>
                      {group.contribution_amount} {group.currency} / {group.frequency}
                    </Text>
                    <Text style={styles.pot}>
                      Cagnotte: {group.current_pot || 0} {group.currency}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#6366f1',
    fontWeight: '600',
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
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 12,
  },
  cardAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  badgeInactive: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
  },
  badgeText: {
    fontSize: 12,
    color: '#10b981',
    textTransform: 'capitalize',
  },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  membersText: {
    fontSize: 12,
    color: '#6366f1',
    marginLeft: 4,
  },
  progressContainer: {
    marginTop: 12,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#374151',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  contribution: {
    fontSize: 14,
    color: '#9ca3af',
  },
  pot: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
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
