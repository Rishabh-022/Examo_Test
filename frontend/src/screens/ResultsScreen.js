import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import colors from '../constants/colors';

export default function ResultsScreen({ route, navigation }) {
  const { score, total, chapter } = route.params;

  const maxScore = total * 10;
  const percentage = Math.round((score / maxScore) * 100);

  return (
    <LinearGradient
      colors={['#FFFFFF', '#DBEAFE', '#93C5FD']}
      style={styles.container}
    >
      <Animatable.View animation="bounceIn" style={styles.card}>
        <Text style={styles.title}>Quiz Complete! 🎉</Text>

        {chapter?.chapterName && (
          <Text style={styles.chapter}>{chapter.chapterName}</Text>
        )}

        <View style={styles.scoreBox}>
          <Text style={styles.score}>{score}</Text>
          <Text style={styles.outOf}> / {maxScore} coins</Text>
        </View>

        <Text style={styles.percentage}>{percentage}%</Text>

        <Text style={styles.message}>
          {percentage >= 80
            ? '🏆 Excellent! You are a champion!'
            : percentage >= 50
            ? '👍 Good effort! Keep practicing.'
            : '💪 Keep learning, you will improve!'}
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('HomeTabs')}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.outlineButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.outlineButtonText}>Review Questions</Text>
        </TouchableOpacity>
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.darkBlue,
    marginBottom: 8,
  },
  chapter: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  scoreBox: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  score: {
    fontSize: 64,
    fontWeight: '800',
    color: colors.primaryBlue,
  },
  outOf: {
    fontSize: 20,
    color: '#6B7280',
    marginLeft: 4,
  },
  percentage: {
    fontSize: 18,
    color: colors.green,
    fontWeight: '600',
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: colors.darkBlue,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  button: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 40,
    width: '100%',
    alignItems: 'center',
  },
  outlineButtonText: {
    color: colors.primaryBlue,
    fontSize: 18,
    fontWeight: '700',
  },
});