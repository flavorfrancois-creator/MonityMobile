import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cardApi } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface VirtualCard {
  id: string;
  name: string;
  barcode: string;
  nfc_serial_number?: string;
  printed_card_number?: string;
  currency: string;
  balance: number;
  limit: number;
  status: string;
  is_locked: boolean;
  can_send: boolean;
  can_receive: boolean;
  created_at: string;
}

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<VirtualCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCardName, setNewCardName] = useState('');
  const [newCardCurrency, setNewCardCurrency] = useState('USD');
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'virtual' | 'physical'>('virtual');

  const loadCards = useCallback(async () => {
    try {
      const response = await cardApi.getCards();
      // API returns array directly
      const data = Array.isArray(response.data) ? response.data : (response.data.cards || []);
      setCards(data);
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  }, [loadCards]);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`;
  };

  const handleCreateCard = async () => {
    if (!newCardName) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la carte');
      return;
    }

    setIsCreating(true);
    try {
      await cardApi.createCard({
        name: newCardName,
        currency: newCardCurrency,
        limit: 1000,
      });
      Alert.alert('Succès', 'Carte créée avec succès');
      setShowCreateModal(false);
      setNewCardName('');
      loadCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const toggleCardLock = async (card: VirtualCard) => {
    try {
      await cardApi.updateCard(card.id, { is_locked: !card.is_locked });
      loadCards();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur');
    }
  };

  const getStatusColor = (status: string, isLocked: boolean) => {
    if (isLocked) return '#ef4444';
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mes Cartes</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'virtual' && styles.tabActive]}
          onPress={() => setActiveTab('virtual')}
        >
          <Ionicons name="card-outline" size={18} color={activeTab === 'virtual' ? '#6366f1' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'virtual' && styles.tabTextActive]}>
            Cartes Virtuelles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'physical' && styles.tabActive]}
          onPress={() => setActiveTab('physical')}
        >
          <Ionicons name="phone-portrait-outline" size={18} color={activeTab === 'physical' ? '#6366f1' : '#6b7280'} />
          <Text style={[styles.tabText, activeTab === 'physical' && styles.tabTextActive]}>
            Cartes & Mobile
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {activeTab === 'virtual' ? (
          <>
            {cards.filter(c => !c.nfc_serial_number && !c.printed_card_number).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="card-outline" size={64} color="#6b7280" />
                <Text style={styles.emptyStateText}>Aucune carte virtuelle</Text>
                <Text style={styles.emptyStateSubtext}>Créez une carte pour payer en ligne</Text>
                <TouchableOpacity
                  style={styles.createBtn}
                  onPress={() => setShowCreateModal(true)}
                >
                  <Text style={styles.createBtnText}>Créer une carte</Text>
                </TouchableOpacity>
              </View>
            ) : (
              cards.filter(c => !c.nfc_serial_number && !c.printed_card_number).map((card) => (
                <View key={card.id} style={styles.cardContainer}>
                  <LinearGradient
                    colors={card.is_locked ? ['#374151', '#1f2937'] : ['#6366f1', '#4f46e5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardName}>{card.name}</Text>
                        <View style={styles.statusBadge}>
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: getStatusColor(card.status, card.is_locked) },
                            ]}
                          />
                          <Text style={styles.statusText}>
                            {card.is_locked ? 'Bloquée' : card.status === 'approved' ? 'Active' : 'En attente'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.lockBtn}
                        onPress={() => toggleCardLock(card)}
                      >
                        <Ionicons
                          name={card.is_locked ? 'lock-closed' : 'lock-open'}
                          size={20}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.cardBalance}>
                      {formatCurrency(card.balance, card.currency)}
                    </Text>

                    <View style={styles.cardFooter}>
                      <View style={styles.cardInfo}>
                        <Ionicons name="barcode-outline" size={14} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.cardInfoText}>{card.barcode}</Text>
                      </View>
                      <View style={styles.cardLimits}>
                        <Text style={styles.limitText}>
                          Limite: {formatCurrency(card.limit, card.currency)}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
                      <Text style={styles.actionBtnText}>Recharger</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Ionicons name="qr-code-outline" size={20} color="#6366f1" />
                      <Text style={styles.actionBtnText}>QR Code</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Ionicons name="settings-outline" size={20} color="#6366f1" />
                      <Text style={styles.actionBtnText}>Gérer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        ) : (
          <>
            {cards.filter(c => c.nfc_serial_number || c.printed_card_number).length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="phone-portrait-outline" size={64} color="#6b7280" />
                <Text style={styles.emptyStateText}>Aucune carte physique</Text>
                <Text style={styles.emptyStateSubtext}>Associez une carte NFC ou commandez une carte</Text>
                <TouchableOpacity style={styles.createBtn}>
                  <Text style={styles.createBtnText}>Commander une carte</Text>
                </TouchableOpacity>
              </View>
            ) : (
              cards.filter(c => c.nfc_serial_number || c.printed_card_number).map((card) => (
                <View key={card.id} style={styles.cardContainer}>
                  <LinearGradient
                    colors={card.is_locked ? ['#374151', '#1f2937'] : ['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.card}
                  >
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardName}>{card.name}</Text>
                        <View style={styles.statusBadge}>
                          <Ionicons name="wifi" size={12} color="rgba(255,255,255,0.7)" />
                          <Text style={styles.statusText}>NFC</Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.lockBtn}
                        onPress={() => toggleCardLock(card)}
                      >
                        <Ionicons
                          name={card.is_locked ? 'lock-closed' : 'lock-open'}
                          size={20}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </View>

                    {card.printed_card_number && (
                      <Text style={styles.cardNumber}>{card.printed_card_number}</Text>
                    )}

                    <Text style={styles.cardBalance}>
                      {formatCurrency(card.balance, card.currency)}
                    </Text>

                    <View style={styles.cardFooter}>
                      <View style={styles.cardInfo}>
                        {card.nfc_serial_number && (
                          <>
                            <Ionicons name="wifi" size={14} color="rgba(255,255,255,0.7)" />
                            <Text style={styles.cardInfoText}>{card.nfc_serial_number}</Text>
                          </>
                        )}
                      </View>
                    </View>
                  </LinearGradient>

                  <View style={styles.cardActions}>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Ionicons name="add-circle-outline" size={20} color="#6366f1" />
                      <Text style={styles.actionBtnText}>Recharger</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Ionicons name="swap-horizontal-outline" size={20} color="#6366f1" />
                      <Text style={styles.actionBtnText}>Transférer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionBtn}>
                      <Ionicons name="settings-outline" size={20} color="#6366f1" />
                      <Text style={styles.actionBtnText}>Gérer</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Create Card Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nouvelle carte</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Nom de la carte"
                placeholderTextColor="#6b7280"
                value={newCardName}
                onChangeText={setNewCardName}
              />
            </View>

            <View style={styles.currencySelector}>
              {['USD', 'EUR', 'CDF', 'XAF'].map((currency) => (
                <TouchableOpacity
                  key={currency}
                  style={[
                    styles.currencyOption,
                    newCardCurrency === currency && styles.currencyOptionActive,
                  ]}
                  onPress={() => setNewCardCurrency(currency)}
                >
                  <Text
                    style={[
                      styles.currencyOptionText,
                      newCardCurrency === currency && styles.currencyOptionTextActive,
                    ]}
                  >
                    {currency}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, isCreating && styles.modalBtnDisabled]}
              onPress={handleCreateCard}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Créer la carte</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    gap: 6,
  },
  tabActive: {
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 13,
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#6366f1',
    fontWeight: '600',
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
  emptyStateSubtext: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 24,
  },
  createBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 20,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  lockBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 2,
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  cardBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardInfoLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  cardInfoValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  nfcBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  nfcText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  barcodeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    marginTop: 12,
    paddingVertical: 12,
  },
  cardAction: {
    alignItems: 'center',
    gap: 4,
  },
  cardActionText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
  },
  currencySelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  currencyOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#374151',
    alignItems: 'center',
  },
  currencyOptionActive: {
    backgroundColor: '#6366f1',
  },
  currencyOptionText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  currencyOptionTextActive: {
    color: '#fff',
  },
  modalBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalBtnDisabled: {
    opacity: 0.7,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
