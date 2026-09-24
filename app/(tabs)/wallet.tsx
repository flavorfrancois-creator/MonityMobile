import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { walletApi, transactionApi, configApi } from '../../src/services/api';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface Wallet {
  id: string;
  currency: string;
  balance: number;
  is_primary: boolean;
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState('EUR');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [isAddingWallet, setIsAddingWallet] = useState(false);

  const loadWallets = useCallback(async () => {
    try {
      const response = await walletApi.getWallets();
      // API returns array directly, not { wallets: [] }
      const data = Array.isArray(response.data) ? response.data : (response.data.wallets || []);
      setWallets(data);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadCurrencies = useCallback(async () => {
    try {
      const response = await configApi.getCurrencies();
      const data = Array.isArray(response.data) ? response.data : (response.data.currencies || []);
      const codes = data.map((c: any) => c.code || c);
      setCurrencies(codes);
    } catch (error) {
      console.error('Error loading currencies:', error);
    }
  }, []);

  useEffect(() => {
    loadWallets();
    loadCurrencies();
  }, [loadWallets, loadCurrencies]);

  const handleAddWallet = async () => {
    if (!selectedCurrency) {
      Alert.alert('Erreur', 'Sélectionnez une devise');
      return;
    }
    
    // Check if wallet already exists
    if (wallets.some(w => w.currency === selectedCurrency)) {
      Alert.alert('Erreur', `Vous avez déjà un portefeuille ${selectedCurrency}`);
      return;
    }

    setIsAddingWallet(true);
    try {
      await walletApi.addWallet(selectedCurrency);
      Alert.alert('Succès', `Portefeuille ${selectedCurrency} créé`);
      setShowAddWalletModal(false);
      loadWallets();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors de la création');
    } finally {
      setIsAddingWallet(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadWallets();
    setRefreshing(false);
  }, [loadWallets]);

  const formatCurrency = (amount: number, currency: string) => {
    return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} ${currency}`;
  };

  const handleTransfer = async () => {
    if (!selectedWallet || !transferAmount || !receiverPhone) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsTransferring(true);
    try {
      await transactionApi.transfer({
        receiver_phone: receiverPhone,
        amount: parseFloat(transferAmount),
        currency: selectedWallet.currency,
      });
      Alert.alert('Succès', 'Transfert effectué avec succès');
      setShowTransferModal(false);
      setTransferAmount('');
      setReceiverPhone('');
      loadWallets();
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.detail || 'Erreur lors du transfert');
    } finally {
      setIsTransferring(false);
    }
  };

  const getWalletColor = (currency: string) => {
    const colors: { [key: string]: string[] } = {
      USD: ['#6366f1', '#4f46e5'],
      EUR: ['#10b981', '#059669'],
      CDF: ['#f59e0b', '#d97706'],
      XAF: ['#8b5cf6', '#7c3aed'],
      XOF: ['#ec4899', '#db2777'],
    };
    return colors[currency] || ['#6b7280', '#4b5563'];
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
        <Text style={styles.title}>Mes Portefeuilles</Text>
        <TouchableOpacity 
          style={styles.addBtn}
          onPress={() => setShowAddWalletModal(true)}
        >
          <Ionicons name="add-circle" size={28} color="#6366f1" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
        }
      >
        {wallets.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="wallet-outline" size={64} color="#6b7280" />
            <Text style={styles.emptyStateText}>Aucun portefeuille</Text>
          </View>
        ) : (
          wallets.map((wallet) => (
            <LinearGradient
              key={wallet.id}
              colors={getWalletColor(wallet.currency) as [string, string]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.walletCard}
            >
              <View style={styles.walletHeader}>
                <View style={styles.currencyBadge}>
                  <Text style={styles.currencyText}>{wallet.currency}</Text>
                </View>
                {wallet.is_primary && (
                  <View style={styles.primaryBadge}>
                    <Ionicons name="star" size={12} color="#fbbf24" />
                    <Text style={styles.primaryText}>Principal</Text>
                  </View>
                )}
              </View>

              <Text style={styles.walletBalance}>
                {formatCurrency(wallet.balance, wallet.currency)}
              </Text>

              <View style={styles.walletActions}>
                <TouchableOpacity
                  style={styles.walletAction}
                  onPress={() => {
                    setSelectedWallet(wallet);
                    setShowTransferModal(true);
                  }}
                >
                  <Ionicons name="send" size={18} color="#fff" />
                  <Text style={styles.walletActionText}>Envoyer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.walletAction}
                  onPress={() => {
                    setSelectedWallet(wallet);
                    setShowRechargeModal(true);
                  }}
                >
                  <Ionicons name="add" size={18} color="#fff" />
                  <Text style={styles.walletActionText}>Recharger</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.walletAction}>
                  <Ionicons name="swap-horizontal" size={18} color="#fff" />
                  <Text style={styles.walletActionText}>Convertir</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Transfer Modal */}
      <Modal
        visible={showTransferModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTransferModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Envoyer de l'argent</Text>
              <TouchableOpacity onPress={() => setShowTransferModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Depuis: {selectedWallet?.currency}</Text>

            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Numéro du destinataire"
                placeholderTextColor="#6b7280"
                value={receiverPhone}
                onChangeText={setReceiverPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Montant"
                placeholderTextColor="#6b7280"
                value={transferAmount}
                onChangeText={setTransferAmount}
                keyboardType="decimal-pad"
              />
              <Text style={styles.inputSuffix}>{selectedWallet?.currency}</Text>
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, isTransferring && styles.modalBtnDisabled]}
              onPress={handleTransfer}
              disabled={isTransferring}
            >
              {isTransferring ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Envoyer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Wallet Modal */}
      <Modal
        visible={showAddWalletModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddWalletModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ajouter un portefeuille</Text>
              <TouchableOpacity onPress={() => setShowAddWalletModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>Sélectionnez une devise</Text>

            <View style={styles.pickerContainer}>
              {Platform.OS === 'web' ? (
                <select
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                  style={{
                    backgroundColor: '#374151',
                    color: '#fff',
                    padding: 16,
                    borderRadius: 12,
                    border: 'none',
                    width: '100%',
                    fontSize: 16,
                  }}
                >
                  {currencies.filter(c => !wallets.some(w => w.currency === c)).map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              ) : (
                <Picker
                  selectedValue={selectedCurrency}
                  onValueChange={setSelectedCurrency}
                  style={styles.picker}
                  dropdownIconColor="#fff"
                >
                  {currencies.filter(c => !wallets.some(w => w.currency === c)).map((currency) => (
                    <Picker.Item key={currency} label={currency} value={currency} color="#fff" />
                  ))}
                </Picker>
              )}
            </View>

            <TouchableOpacity
              style={[styles.modalBtn, isAddingWallet && styles.modalBtnDisabled]}
              onPress={handleAddWallet}
              disabled={isAddingWallet}
            >
              {isAddingWallet ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.modalBtnText}>Créer le portefeuille</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  addBtn: {
    padding: 4,
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
  walletCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencyBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  currencyText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  primaryText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '500',
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 16,
  },
  walletAction: {
    alignItems: 'center',
    gap: 4,
  },
  walletActionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
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
  modalLabel: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
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
  inputSuffix: {
    color: '#9ca3af',
    fontSize: 14,
  },
  modalBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalBtnDisabled: {
    opacity: 0.7,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  picker: {
    color: '#fff',
    backgroundColor: 'transparent',
  },
});
