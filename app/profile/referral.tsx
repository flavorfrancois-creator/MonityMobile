import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const copyCode = async () => {
    if (user?.referral_code) {
      await Clipboard.setStringAsync(user.referral_code);
      Alert.alert('Copié!', 'Code de parrainage copié dans le presse-papier');
    }
  };

  const shareCode = async () => {
    try {
      await Share.share({
        message: `Rejoins Monity World et gagne 5$ à l'inscription avec mon code de parrainage: ${user?.referral_code}\n\nTélécharge l'app: https://monityworld.com/download`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Parrainage</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Ionicons name="gift" size={48} color="#6366f1" />
          <Text style={styles.cardTitle}>Gagnez 5$ par parrainage!</Text>
          <Text style={styles.cardText}>
            Partagez votre code avec vos amis et gagnez 5$ pour chaque inscription réussie.
          </Text>
        </View>

        <Text style={styles.label}>Votre code de parrainage</Text>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{user?.referral_code || 'N/A'}</Text>
          <TouchableOpacity style={styles.copyBtn} onPress={copyCode}>
            <Ionicons name="copy-outline" size={24} color="#6366f1" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.shareBtn} onPress={shareCode}>
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.shareBtnText}>Partager mon code</Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Filleuls</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0$</Text>
            <Text style={styles.statLabel}>Gains totaux</Text>
          </View>
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
  card: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  code: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366f1',
    letterSpacing: 2,
  },
  copyBtn: {
    padding: 8,
  },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  shareBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
});
