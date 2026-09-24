import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { transactionApi, walletApi } from '../src/services/api';

interface Wallet {
  id: string;
  currency: string;
  balance: number;
}

export default function RechargeScreen() {
  const insets = useSafeAreaInsets();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [selectedWallet, setSelectedWallet] = useState<string>('USD');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('mobile_money');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState(true);

  const methods = [
    { key: 'mobile_money', label: 'Mobile Money', icon: 'phone-portrait' },
    { key: 'bank_transfer', label: 'Virement', icon: 'business' },
    { key: 'cash', label: 'Cash', icon: 'cash' },
  ];

  const loadWallets = useCallback(async () => {
    try {
      const response = await walletApi.getWallets();
      setWallets(response.data.wallets || []);
    } catch (error) {
      console.error('Error loading wallets:', error);
    } finally {
      setLoadingWallets(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const handleRecharge = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    setIsLoading(true);
    try {
      await transactionApi.recharge(
        parseFloat(amount),
        selectedWallet,
        method
      );
      Alert.alert(
        'Demande envoyée',
        'Votre demande de recharge a été envoyée. Elle sera traitée rapidement.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      Alert.alert(
        'Erreur',
        error.response?.data?.detail || 'Erreur lors de la recharge'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectedWalletInfo = wallets.find(w => w.currency === selectedWallet);

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Recharger</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Selected wallet info */}
          {selectedWalletInfo && (
            <View style={styles.walletInfo}>
              <Text style={styles.walletLabel}>Portefeuille sélectionné</Text>
              <Text style={styles.walletBalance}>
                {selectedWalletInfo.balance.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {selectedWalletInfo.currency}
              </Text>
            </View>
          )}

          {/* Currency selection */}
          <Text style={styles.sectionLabel}>Devise</Text>
          <View style={styles.currencyContainer}>
            {loadingWallets ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              wallets.map((wallet) => (
                <TouchableOpacity
                  key={wallet.id}
                  style={[
                    styles.currencyBtn,
                    selectedWallet === wallet.currency && styles.currencyBtnActive,
                  ]}
                  onPress={() => setSelectedWallet(wallet.currency)}
                >
                  <Text
                    style={[
                      styles.currencyBtnText,
                      selectedWallet === wallet.currency && styles.currencyBtnTextActive,
                    ]}
                  >
                    {wallet.currency}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Amount input */}
          <Text style={styles.sectionLabel}>Montant</Text>
          <View style={styles.amountContainer}>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              placeholderTextColor="#6b7280"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <Text style={styles.amountCurrency}>{selectedWallet}</Text>
          </View>

          {/* Quick amounts */}
          <View style={styles.quickAmounts}>
            {[50, 100, 200, 500].map((quickAmount) => (
              <TouchableOpacity
                key={quickAmount}
                style={styles.quickAmountBtn}
                onPress={() => setAmount(quickAmount.toString())}
              >
                <Text style={styles.quickAmountText}>{quickAmount}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment method */}
          <Text style={styles.sectionLabel}>Méthode de paiement</Text>
          <View style={styles.methodsContainer}>
            {methods.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.methodBtn,
                  method === m.key && styles.methodBtnActive,
                ]}
                onPress={() => setMethod(m.key)}
              >
                <View
                  style={[
                    styles.methodIcon,
                    method === m.key && styles.methodIconActive,
                  ]}
                >
                  <Ionicons
                    name={m.icon as any}
                    size={24}
                    color={method === m.key ? '#fff' : '#6366f1'}
                  />
                </View>
                <Text
                  style={[
                    styles.methodLabel,
                    method === m.key && styles.methodLabelActive,
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.rechargeBtn, isLoading && styles.rechargeBtnDisabled]}
            onPress={handleRecharge}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="add-circle" size={20} color="#fff" />
                <Text style={styles.rechargeBtnText}>Recharger</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 16,
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
  },
  walletInfo: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  walletLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 12,
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  currencyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  currencyBtnActive: {
    backgroundColor: '#6366f1',
    borderColor: '#6366f1',
  },
  currencyBtnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  currencyBtnTextActive: {
    color: '#fff',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 16,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#374151',
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    paddingVertical: 20,
  },
  amountCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickAmountBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1f2937',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
  },
  quickAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  methodsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  methodBtn: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#1f2937',
    borderWidth: 1,
    borderColor: '#374151',
  },
  methodBtnActive: {
    borderColor: '#6366f1',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  methodIconActive: {
    backgroundColor: '#6366f1',
  },
  methodLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  methodLabelActive: {
    color: '#fff',
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  rechargeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  rechargeBtnDisabled: {
    opacity: 0.7,
  },
  rechargeBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
