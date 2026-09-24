import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function KYCScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const getStatusColor = () => {
    switch (user?.kyc_status) {
      case 'approved': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = () => {
    switch (user?.kyc_status) {
      case 'approved': return 'Vérifié';
      case 'pending': return 'En attente';
      case 'rejected': return 'Refusé';
      default: return 'Non vérifié';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Vérification KYC</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[styles.statusIcon, { backgroundColor: getStatusColor() + '20' }]}>
            <Ionicons 
              name={user?.kyc_status === 'approved' ? 'checkmark-circle' : 'shield-outline'} 
              size={40} 
              color={getStatusColor()} 
            />
          </View>
          <Text style={styles.statusTitle}>Statut: {getStatusText()}</Text>
          <Text style={styles.statusDesc}>
            {user?.kyc_status === 'approved' 
              ? 'Votre identité a été vérifiée avec succès.'
              : 'Complétez la vérification pour débloquer toutes les fonctionnalités.'}
          </Text>
        </View>

        {/* Benefits */}
        <Text style={styles.sectionTitle}>Avantages de la vérification</Text>
        
        <View style={styles.benefitItem}>
          <Ionicons name="trending-up-outline" size={24} color="#6366f1" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Limites augmentées</Text>
            <Text style={styles.benefitDesc}>Transferts jusqu'à 10,000$ par jour</Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="globe-outline" size={24} color="#6366f1" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Transferts internationaux</Text>
            <Text style={styles.benefitDesc}>Envoyez de l'argent dans le monde entier</Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="card-outline" size={24} color="#6366f1" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Cartes virtuelles premium</Text>
            <Text style={styles.benefitDesc}>Accès aux cartes avec limites élevées</Text>
          </View>
        </View>

        {user?.kyc_status !== 'approved' && (
          <TouchableOpacity style={styles.verifyBtn}>
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.verifyBtnText}>Commencer la vérification</Text>
          </TouchableOpacity>
        )}
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
  statusCard: {
    backgroundColor: '#1f2937',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  statusDesc: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 16,
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  benefitDesc: {
    fontSize: 13,
    color: '#9ca3af',
    marginTop: 2,
  },
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
  },
  verifyBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
