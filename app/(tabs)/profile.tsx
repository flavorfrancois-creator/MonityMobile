import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'person-outline',
      title: 'Informations personnelles',
      subtitle: 'Modifier votre profil',
      route: '/profile/edit',
    },
    {
      icon: 'shield-checkmark-outline',
      title: 'Vérification KYC',
      subtitle: user?.kyc_status === 'approved' ? 'Vérifié' : 'Compléter la vérification',
      route: '/profile/kyc',
      status: user?.kyc_status,
    },
    {
      icon: 'lock-closed-outline',
      title: 'Sécurité',
      subtitle: '2FA, mot de passe',
      route: '/profile/security',
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Gérer les alertes',
      route: '/profile/notifications',
    },
    {
      icon: 'gift-outline',
      title: 'Parrainage',
      subtitle: `Code: ${user?.referral_code || 'N/A'}`,
      route: '/profile/referral',
    },
    {
      icon: 'people-outline',
      title: 'Épargne & Cotisations',
      subtitle: 'Gérer vos groupes',
      route: '/profile/groups',
    },
    {
      icon: 'link-outline',
      title: 'Liens de paiement',
      subtitle: 'Créer et gérer',
      route: '/profile/payment-links',
    },
    {
      icon: 'help-circle-outline',
      title: 'Aide & Support',
      subtitle: 'FAQ, Contact',
      route: '/profile/help',
    },
    {
      icon: 'document-text-outline',
      title: 'Conditions d\'utilisation',
      subtitle: 'Politique de confidentialité',
      route: '/profile/terms',
    },
  ];

  const getKycStatusColor = (status?: string) => {
    switch (status) {
      case 'approved':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'rejected':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <LinearGradient
          colors={['#1f2937', '#374151']}
          style={styles.profileHeader}
        >
          <View style={styles.avatarContainer}>
            {user?.profile_image ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.name?.charAt(0).toUpperCase()}
                </Text>
              </View>
            ) : (
              <View style={styles.avatar}>
                <Ionicons name="person" size={40} color="#fff" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user?.name}</Text>
          <Text style={styles.userPhone}>{user?.phone}</Text>
          {user?.email && <Text style={styles.userEmail}>{user?.email}</Text>}

          <View style={styles.accountInfo}>
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>N° Compte</Text>
              <Text style={styles.accountValue}>{user?.account_number}</Text>
            </View>
            <View style={styles.accountDivider} />
            <View style={styles.accountItem}>
              <Text style={styles.accountLabel}>Pays</Text>
              <Text style={styles.accountValue}>{user?.country}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => router.push(item.route as any)}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={22} color="#6366f1" />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              {item.status && (
                <View
                  style={[
                    styles.statusIndicator,
                    { backgroundColor: getKycStatusColor(item.status) },
                  ]}
                />
              )}
              <Ionicons name="chevron-forward" size={20} color="#6b7280" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator color="#ef4444" />
          ) : (
            <>
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text style={styles.logoutText}>Déconnexion</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.version}>Version 1.0.0</Text>

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
  profileHeader: {
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#9ca3af',
  },
  accountInfo: {
    flexDirection: 'row',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  accountItem: {
    flex: 1,
    alignItems: 'center',
  },
  accountLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 4,
  },
  accountValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  accountDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuContainer: {
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ef4444',
  },
  version: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 24,
  },
});
