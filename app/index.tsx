import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

const logoMonity = require('../assets/images/logo-monity.png');

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, isLoading]);

  return (
    <LinearGradient colors={['#0a0a0f', '#1a1a2e', '#0a0a0f']} style={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logoMonity} style={styles.logoImage} resizeMode="contain" />
        <Text style={styles.title}>Monity World</Text>
        <Text style={styles.subtitle}>Votre portefeuille digital</Text>
      </View>
      <ActivityIndicator size="large" color="#6366f1" style={styles.loader} />
      <Text style={styles.version}>Version 1.0.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
  },
  loader: {
    marginTop: 40,
  },
  version: {
    position: 'absolute',
    bottom: 40,
    color: '#6b7280',
    fontSize: 12,
  },
});
