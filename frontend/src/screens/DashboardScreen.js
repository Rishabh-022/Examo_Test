import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import colors from '../constants/colors';

const BOARDS = ['CBSE', 'ICSE'];
const CLASSES = ['6', '7', '8', '9', '10', '11', '12'];

export default function DashboardScreen({ navigation }) {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const [selectedBoard, setSelectedBoard] = useState(user?.board || 'CBSE');
  const [selectedClass, setSelectedClass] = useState(String(user?.classLevel || '10'));
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Daily reward states
  const [showDaily, setShowDaily] = useState(false);
  const [dailyReward, setDailyReward] = useState(null);

  // Refresh user data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [])
  );

  useEffect(() => {
    (async () => {
      try {
        const res = await api.post('/api/auth/claim-daily');
        setDailyReward(res.data);
        setShowDaily(true);
      } catch (err) {
        // Already claimed or error – simply don't show the modal
      }
    })();
  }, []);

  // Dynamic subjects based on class
  const getSubjectsForClass = (cls) => {
    const classNum = parseInt(cls);
    if (classNum >= 6 && classNum <= 10) {
      return ['Science', 'Maths'];
    } else {
      return ['Physics', 'Chemistry', 'Biology', 'Maths'];
    }
  };

  // Clear selected subject when class changes
  useEffect(() => {
    setSelectedSubject(null);
  }, [selectedClass]);

  const fetchChapters = useCallback(async () => {
    if (!selectedBoard || !selectedClass || !selectedSubject) return;
    setLoading(true);
    try {
      const res = await api.get('/api/chapters', {
        params: {
          board: selectedBoard,
          classLevel: selectedClass,
          subject: selectedSubject,
        },
      });
      setChapters(res.data);
    } catch (err) {
      Alert.alert('Error', 'Failed to load chapters');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedBoard, selectedClass, selectedSubject]);

  useEffect(() => {
    fetchChapters();
  }, [fetchChapters]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchChapters();
  };

  const startQuiz = (chapter) => {
    navigation.navigate('Quiz', { chapter });
  };

  return (
    <LinearGradient
      colors={['#FFFFFF', '#DBEAFE', '#93C5FD']}
      style={styles.container}
    >
      {/* Floating decorations */}
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        direction="alternate"
        style={[styles.circle, styles.circle1]}
      />
      <Animatable.View
        animation="pulse"
        iterationCount="infinite"
        direction="alternate"
        delay={700}
        style={[styles.circle, styles.circle2]}
      />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <Animatable.View animation="fadeInDown" style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>{user?.username || 'Student'}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Animatable.View>

        {/* Stats Cards */}
        <Animatable.View animation="fadeInUp" delay={200} style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
            <Text style={styles.statValue}>{user?.streak || 0} 🔥</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
            <Text style={styles.statValue}>{user?.coins || 0} 🪙</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
            <Text style={styles.statValue}>LVL {user?.level || 1}</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </Animatable.View>

        {/* XP Bar */}
        <Animatable.View animation="fadeInUp" delay={400} style={styles.xpContainer}>
          {/* THE ONLY LINE THAT CHANGED: show XP within current level */}
          <Text style={styles.xpText}>
            XP: {(user?.xp || 0) % 100} / 100
          </Text>
          <View style={styles.xpBar}>
            <View
              style={[
                styles.xpFill,
                { width: `${Math.min((user?.xp || 0) % 100, 100)}%` },
              ]}
            />
          </View>
        </Animatable.View>

        {/* AI Tutor Quick Access */}
        <Animatable.View animation="fadeInUp" delay={450}>
          <TouchableOpacity
            style={styles.tutorCard}
            onPress={() => navigation.navigate('AITutor')}
          >
            <LinearGradient
              colors={['#3B82F6', '#8B5CF6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.tutorGradient}
            >
              <Text style={styles.tutorEmoji}>🤖</Text>
              <View style={styles.tutorInfo}>
                <Text style={styles.tutorTitle}>AI Tutor</Text>
                <Text style={styles.tutorSubtitle}>Ask any doubt, get instant help</Text>
              </View>
              <Text style={styles.tutorArrow}>→</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        {/* Board Selector */}
        <Animatable.View animation="fadeInUp" delay={500} style={styles.section}>
          <Text style={styles.sectionTitle}>Board</Text>
          <View style={styles.chipRow}>
            {BOARDS.map((board) => (
              <TouchableOpacity
                key={board}
                style={[
                  styles.chip,
                  selectedBoard === board && styles.chipActive,
                ]}
                onPress={() => setSelectedBoard(board)}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedBoard === board && styles.chipTextActive,
                  ]}
                >
                  {board}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>

        {/* Class Selector */}
        <Animatable.View animation="fadeInUp" delay={600} style={styles.section}>
          <Text style={styles.sectionTitle}>Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {CLASSES.map((cls) => (
                <TouchableOpacity
                  key={cls}
                  style={[
                    styles.chip,
                    selectedClass === cls && styles.chipActive,
                  ]}
                  onPress={() => setSelectedClass(cls)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      selectedClass === cls && styles.chipTextActive,
                    ]}
                  >
                    Class {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Animatable.View>

        {/* Subject Selector */}
        <Animatable.View animation="fadeInUp" delay={700} style={styles.section}>
          <Text style={styles.sectionTitle}>Subject</Text>
          <View style={styles.subjectGrid}>
            {getSubjectsForClass(selectedClass).map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[
                  styles.subjectCard,
                  selectedSubject === subject && styles.subjectCardActive,
                ]}
                onPress={() => setSelectedSubject(subject)}
              >
                <Text style={styles.subjectEmoji}>
                  {subject === 'Physics'
                    ? '⚛️'
                    : subject === 'Chemistry'
                    ? '🧪'
                    : subject === 'Biology'
                    ? '🧬'
                    : subject === 'Maths'
                    ? '📐'
                    : subject === 'Science'
                    ? '🔬'
                    : '💻'}
                </Text>
                <Text
                  style={[
                    styles.subjectText,
                    selectedSubject === subject && styles.subjectTextActive,
                  ]}
                >
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animatable.View>

        {/* Chapters List */}
        {selectedSubject && (
          <Animatable.View animation="fadeInUp" delay={800} style={styles.section}>
            <Text style={styles.sectionTitle}>Chapters</Text>
            {loading ? (
              <Text style={styles.loadingText}>Loading chapters...</Text>
            ) : chapters.length === 0 ? (
              <Text style={styles.emptyText}>No chapters found. Add some via the AI pipeline!</Text>
            ) : (
              chapters.map((chapter, index) => (
                <Animatable.View
                  key={chapter._id}
                  animation="fadeInLeft"
                  delay={index * 100}
                >
                  <TouchableOpacity
                    style={styles.chapterCard}
                    onPress={() => startQuiz(chapter)}
                  >
                    <View style={styles.chapterInfo}>
                      <Text style={styles.chapterNumber}>
                        Chapter {chapter.chapterNumber}
                      </Text>
                      <Text style={styles.chapterName}>{chapter.chapterName}</Text>
                    </View>
                    <Text style={styles.playIcon}>▶️</Text>
                  </TouchableOpacity>
                </Animatable.View>
              ))
            )}
          </Animatable.View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Daily Reward Modal */}
      <Modal visible={showDaily} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animatable.View animation="bounceIn" style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎉 Daily Reward!</Text>
            <Text style={styles.modalSubtitle}>Streak: {dailyReward?.streak} days 🔥</Text>
            <Text style={styles.modalCoins}>+{dailyReward?.coinsAwarded} 🪙</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowDaily(false)}
            >
              <Text style={styles.modalButtonText}>Collect</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

// ─── Styles (unchanged) ───
const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingTop: 10 },
  circle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  circle1: { width: 180, height: 180, top: -40, right: -40 },
  circle2: { width: 120, height: 120, bottom: -20, left: -20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 20,
  },
  greeting: { fontSize: 16, color: '#6B7280' },
  username: { fontSize: 24, fontWeight: '800', color: colors.darkBlue },
  logoutBtn: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  logoutText: { color: colors.red, fontWeight: '700' },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.darkBlue },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  xpContainer: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  xpText: { fontSize: 14, fontWeight: '600', color: colors.darkBlue, marginBottom: 8 },
  xpBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: 4,
  },
  tutorCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  tutorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tutorEmoji: { fontSize: 32, marginRight: 12 },
  tutorInfo: { flex: 1 },
  tutorTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  tutorSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  tutorArrow: { fontSize: 22, color: '#FFFFFF', marginLeft: 8 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 12,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  chipActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  chipText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  chipTextActive: { color: colors.white },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  subjectCard: {
    width: '30%',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  subjectCardActive: {
    borderColor: colors.primaryBlue,
    backgroundColor: colors.lightBlue,
  },
  subjectEmoji: { fontSize: 28 },
  subjectText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  subjectTextActive: { color: colors.primaryBlue },
  chapterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  chapterInfo: { flex: 1 },
  chapterNumber: { fontSize: 12, color: '#9CA3AF', fontWeight: '600' },
  chapterName: { fontSize: 16, fontWeight: '700', color: colors.darkBlue, marginTop: 2 },
  playIcon: { fontSize: 24 },
  loadingText: { color: '#6B7280', fontSize: 14, textAlign: 'center', marginTop: 20 },
  emptyText: { color: '#9CA3AF', fontSize: 14, textAlign: 'center', marginTop: 20 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: { fontSize: 24, fontWeight: '800', color: colors.darkBlue, marginBottom: 8 },
  modalSubtitle: { fontSize: 16, color: '#6B7280', marginBottom: 16 },
  modalCoins: { fontSize: 48, fontWeight: '800', color: colors.gold, marginBottom: 24 },
  modalButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  modalButtonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
});