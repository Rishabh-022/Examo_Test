import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import colors from '../constants/colors';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const [badges, setBadges] = useState([]);
  const [loadingBadges, setLoadingBadges] = useState(true);

  // Fetch dynamic badges
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/achievements');
        setBadges(res.data);
      } catch (err) {
        console.error('Failed to fetch achievements:', err);
      } finally {
        setLoadingBadges(false);
      }
    })();
  }, []);

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#DBEAFE', '#93C5FD']} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.username[0].toUpperCase()}</Text>
          </View>
          <Text style={styles.username}>{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </Animatable.View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.xp || 0}</Text>
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.level || 1}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.coins || 0}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{user.streak || 0}🔥</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>🏅 Achievements</Text>

        {loadingBadges ? (
          <ActivityIndicator size="large" color={colors.primaryBlue} style={{ marginVertical: 20 }} />
        ) : (
          <View style={styles.badgeGrid}>
            {badges.map((badge) => (
              <View
                key={badge.name}
                style={[styles.badgeCard, !badge.earned && styles.badgeLocked]}
              >
                <Text style={styles.badgeIcon}>{badge.icon}</Text>
                <Text style={[styles.badgeName, !badge.earned && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
                <Text style={styles.badgeDesc}>{badge.description}</Text>
                {!badge.earned && (
                  <View style={styles.lockOverlay}>
                    <Text style={styles.lockIcon}>🔒</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 30 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: { fontSize: 32, color: '#fff', fontWeight: '700' },
  username: { fontSize: 24, fontWeight: '800', color: colors.darkBlue },
  email: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.darkBlue },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: colors.darkBlue, marginBottom: 16 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  badgeCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  badgeLocked: {
    opacity: 0.6,
    backgroundColor: 'rgba(229,231,235,0.6)',
  },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontSize: 14, fontWeight: '700', color: colors.darkBlue, marginTop: 8 },
  badgeNameLocked: { color: '#9CA3AF' },
  badgeDesc: { fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' },
  lockOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 4,
  },
  lockIcon: { fontSize: 16 },
  logoutBtn: {
    backgroundColor: colors.red,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});