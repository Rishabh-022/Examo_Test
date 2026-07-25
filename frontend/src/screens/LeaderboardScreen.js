import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import colors from '../constants/colors';

export default function LeaderboardScreen() {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/leaderboard');
        setUsers(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const renderItem = ({ item, index }) => {
    const isMe = item._id === user._id;
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 50}
        style={[styles.row, isMe && styles.myRow]}
      >
        <Text style={styles.rank}>#{index + 1}</Text>
        <Text style={styles.name}>{item.username}</Text>
        <View style={styles.stats}>
          <Text style={styles.xp}>{item.xp} XP</Text>
          <Text style={styles.level}>Lv.{item.level}</Text>
        </View>
      </Animatable.View>
    );
  };

  if (loading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#DBEAFE']} style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#FFFFFF', '#DBEAFE', '#93C5FD']} style={styles.container}>
      <Text style={styles.title}>🏆 Leaderboard</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '800', color: colors.darkBlue, marginBottom: 20, textAlign: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  myRow: { borderWidth: 2, borderColor: colors.gold },
  rank: { fontSize: 16, fontWeight: '700', color: colors.primaryBlue, width: 40 },
  name: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.darkBlue },
  stats: { flexDirection: 'row', gap: 12 },
  xp: { fontSize: 14, color: colors.green, fontWeight: '600' },
  level: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
});