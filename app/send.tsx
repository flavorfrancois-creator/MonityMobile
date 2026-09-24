import React, { useState } from 'react';
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
import { transactionApi } from '../src/services/api';

export default function SendMoneyScreen() {
  const insets = useSafeAreaInsets();
  const [receiverPhone, setReceiverPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currencies = ['USD', 'EUR', 'CDF', 'XAF', 'XOF'];

  const handleSend = async () => {
    if (!receiverPhone) {
      Alert.alert('Erreur', 'Veuillez entrer le numéro du destinataire');
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer un montant valide');
      return;
    }

    Alert.alert(
      'Confirmer le transfert',
      `Envoyer ${amount} ${currency} à ${receiverPhone} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setIsLoading(true);
            try {
              await transactionApi.transfer({
                receiver_phone: receiverPhone,
                amount: parseFloat(amount),
                currency,
                description: description || undefined,
              });
              Alert.alert('Succès', 'Transfert effectué avec succès', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (error: any) {
              Alert.alert(
                'Erreur',
                error.response?.data?.detail || 'Erreur lors du transfert'
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

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
          <Text style={styles.headerTitle}>Envoyer de l'argent</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <Text style={styles.label}>Destinataire</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Numéro de téléphone"
                placeholderTextColor="#6b7280"
                value={receiverPhone}
                onChangeText={setReceiverPhone}
                keyboardType="phone-pad"
              />
              <TouchableOpacity
                style={styles.contactBtn}
                onPress={() => router.push('/contacts')}
              >
                <Ionicons name="people" size={20} color="#6366f1" />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Montant</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="cash-outline" size={20} color="#6b7280" />
              <TextInput
                style={[styles.input, styles.amountInput]}
                placeholder="0.00"
                placeholderTextColor="#6b7280"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <Text style={styles.label}>Devise</Text>
            <View style={styles.currencyContainer}>
              {currencies.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.currencyBtn, currency === c && styles.currencyBtnActive]}
                  onPress={() => setCurrency(c)}
                >
                  <Text
                    style={[
                      styles.currencyBtnText,
                      currency === c && styles.currencyBtnTextActive,
                    ]}
                  >
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Description (optionnel)</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="document-text-outline" size={20} color="#6b7280" />
              <TextInput
                style={styles.input}
                placeholder="Motif du transfert"
                placeholderTextColor="#6b7280"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Quick amounts */}
          <View style={styles.quickAmounts}>
            <Text style={styles.quickAmountsTitle}>Montants rapides</Text>
            <View style={styles.quickAmountsRow}>
              {[10, 25, 50, 100].map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountBtn}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={styles.quickAmountText}>{quickAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.sendBtn, isLoading && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.sendBtnText}>Envoyer</Text>
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
  form: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#374151',
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#fff',
  },
  amountInput: {
    fontSize: 24,
    fontWeight: '600',
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  currencyContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  currencyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
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
  quickAmounts: {
    marginTop: 32,
  },
  quickAmountsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
    marginBottom: 12,
  },
  quickAmountsRow: {
    flexDirection: 'row',
    gap: 12,
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  sendBtnDisabled: {
    opacity: 0.7,
  },
  sendBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
