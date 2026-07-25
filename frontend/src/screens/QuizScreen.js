import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import api from '../services/api';
import colors from '../constants/colors';

export default function QuizScreen({ route, navigation }) {
  const { chapter } = route.params;
  const chapterId = chapter?._id;
  const chapterName = chapter?.chapterName || 'Quiz';

  // ─── States ───────────────────────────
  const [phase, setPhase] = useState('instructions'); // 'instructions' | 'quiz'
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  // Live explanation
  const [liveExplanation, setLiveExplanation] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // ─── Timer states ─────────────────────
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const quizStartedRef = useRef(false);

  // Fetch questions once
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await api.get(`/api/questions?chapterId=${chapterId}`);
        if (!res.data || res.data.length === 0) {
          Alert.alert('No Questions', 'This chapter has no questions yet.', [
            { text: 'Go Back', onPress: () => navigation.goBack() },
          ]);
          return;
        }
        setQuestions(res.data);
      } catch (err) {
        Alert.alert('Error', 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    if (chapterId) fetchQuestions();
    else {
      Alert.alert('Error', 'No chapter selected!');
      navigation.goBack();
    }
  }, [chapterId]);

  // ─── Start the quiz ───────────────────
  const startQuiz = () => {
    setPhase('quiz');
  };

  // ─── Global timer effect (runs only once when quiz starts) ───
  useEffect(() => {
    if (phase === 'quiz' && !quizStartedRef.current) {
      quizStartedRef.current = true;
      const totalSeconds = questions.length * 30;   // 30s per question
      setTimeLeft(totalSeconds);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);   // only re‑run when phase changes

  // ─── Called when time runs out ────────
  const handleTimeUp = () => {
    // If current question hasn't been answered, lock it without awarding points
    if (!submitted) {
      setSubmitted(true);
    }
    // Immediately navigate to results with current score
    navigation.navigate('Results', {
      score,
      total: questions.length,
      chapter,
      timeUp: true,      // can be used to show a special message later
    });
  };

  // ─── Helpers ──────────────────────────
  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelectOption = (option) => {
    if (submitted) return;
    setSelectedOption(option);
  };

  // Smart scoring & explanation (unchanged)
  const handleSubmit = async () => {
    if (!selectedOption) {
      Alert.alert('Select an option', 'Please choose an answer first.');
      return;
    }
    setSubmitted(true);
    setIsExplaining(true);

    const selectedIdx = currentQuestion.options.indexOf(selectedOption);
    const selectedLetter = ['A', 'B', 'C', 'D'][selectedIdx] || '';

    const isCorrect =
      selectedOption === currentQuestion.correctAnswer ||
      selectedLetter === currentQuestion.correctAnswer;

    if (isCorrect) setScore((prev) => prev + 10);

    try {
      const res = await api.post('/api/questions/explain', {
        questionText: currentQuestion.questionText,
        options: currentQuestion.options,
        selectedAnswer: selectedOption,
        correctAnswer: currentQuestion.correctAnswer,
      });
      setLiveExplanation(res.data.explanation);
    } catch (err) {
      setLiveExplanation(
        `The correct answer is "${currentQuestion.correctAnswer}". (Live explanation unavailable.)`
      );
    } finally {
      setIsExplaining(false);
    }
  };

  const handleNext = async () => {
  if (isLast) {
    // Stop the timer if running
    if (timerRef.current) clearInterval(timerRef.current);

    // Save the earned XP to the database
    try {
      await api.post('/api/auth/update-progress', { earnedXP: score });
    } catch (err) {
      console.log('Failed to save XP');
    }

    navigation.navigate('Results', {
      score,
      total: questions.length,
      chapter,
    });
  } else {
    setCurrentIndex((prev) => prev + 1);
    setSelectedOption(null);
    setSubmitted(false);
    setLiveExplanation(null);
  }
};

  // ─── Format time as mm:ss ──────────────
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // ─── Loading State ────────────────────
  if (loading) {
    return (
      <LinearGradient colors={['#FFFFFF', '#DBEAFE']} style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
      </LinearGradient>
    );
  }

  // ─── Instructions Screen ──────────────
  if (phase === 'instructions') {
    return (
      <LinearGradient
        colors={['#FFFFFF', '#DBEAFE', '#93C5FD']}
        style={styles.centered}
      >
        <Animatable.View animation="fadeInUp" style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>📋 {chapterName}</Text>
          <Text style={styles.instructionSubtitle}>
            {questions.length} Questions • 10 XP per correct answer • {questions.length * 30}s total time
          </Text>

          <View style={styles.ruleList}>
            <Text style={styles.ruleItem}>
              ⏱️ A global timer will start when you tap <Text style={styles.bold}>Start Test</Text>
            </Text>
            <Text style={styles.ruleItem}>
              ✅ Select an answer and tap <Text style={styles.bold}>Submit</Text>
            </Text>
            <Text style={styles.ruleItem}>
              🔒 Once submitted, you can't change your answer
            </Text>
            <Text style={styles.ruleItem}>
              💡 After each question, you'll get a live AI explanation
            </Text>
            <Text style={styles.ruleItem}>
              🏆 Your score will be shown when the test ends
            </Text>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Start Test ▶️</Text>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>
    );
  }

  // ─── Main Quiz UI ─────────────────────
  return (
    <LinearGradient
      colors={['#FFFFFF', '#DBEAFE', '#93C5FD']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Timer bar */}
        <View style={styles.timerBar}>
          <View
            style={[
              styles.timerFill,
              { width: `${(timeLeft / (questions.length * 30)) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.timerText}>⏳ {formatTime(timeLeft)} remaining</Text>

        {/* Progress */}
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / questions.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentIndex + 1} / {questions.length}
        </Text>

        {/* Question Card */}
        <Animatable.View animation="fadeInUp" style={styles.questionCard}>
          <Text style={styles.difficultyBadge}>
            {currentQuestion.difficulty?.toUpperCase() || 'MEDIUM'}
          </Text>
          <Text style={styles.questionText}>
            {currentQuestion.questionText}
          </Text>
        </Animatable.View>

        {/* Options (smart highlight) */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, idx) => {
            let optionStyle = styles.option;
            const letter = ['A', 'B', 'C', 'D'][idx];
            const isCorrectOption =
              option === currentQuestion.correctAnswer ||
              currentQuestion.correctAnswer === letter;
            const isSelectedOption = option === selectedOption;

            if (submitted) {
              if (isCorrectOption) {
                optionStyle = { ...optionStyle, backgroundColor: '#D1FAE5', borderColor: '#10B981' };
              } else if (isSelectedOption) {
                optionStyle = { ...optionStyle, backgroundColor: '#FEE2E2', borderColor: '#EF4444' };
              }
            } else {
              if (isSelectedOption) {
                optionStyle = { ...optionStyle, borderColor: colors.primaryBlue, borderWidth: 3 };
              }
            }

            return (
              <TouchableOpacity
                key={idx}
                style={optionStyle}
                onPress={() => handleSelectOption(option)}
                disabled={submitted}
              >
                <Text style={styles.optionText}>{option}</Text>
                {submitted && isCorrectOption && (
                  <Text style={styles.icon}>✓</Text>
                )}
                {submitted && isSelectedOption && !isCorrectOption && (
                  <Text style={styles.icon}>✗</Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Submit / Next Buttons */}
        {!submitted ? (
          <TouchableOpacity
            style={[styles.submitButton, !selectedOption && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={!selectedOption}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        ) : (
          <View>
            {/* Explanation Card with live AI */}
            <Animatable.View animation="fadeInUp" style={styles.explanationCard}>
              <Text style={styles.explanationTitle}>💡 Live AI Tutor</Text>
              {isExplaining ? (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={colors.primaryBlue} style={{ marginRight: 10 }} />
                  <Text style={styles.explanationText}>AI is analyzing your answer...</Text>
                </View>
              ) : (
                <Text style={styles.explanationText}>{liveExplanation}</Text>
              )}
            </Animatable.View>

            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {isLast ? 'Finish Quiz 🏆' : 'Next Question ➡️'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Score */}
        <Text style={styles.scoreText}>Score: {score} XP</Text>
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles ──────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 20, paddingBottom: 40 },

  // ── Instructions ──
  instructionCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    alignItems: 'center',
  },
  instructionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.darkBlue,
    marginBottom: 8,
    textAlign: 'center',
  },
  instructionSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
  },
  ruleList: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  ruleItem: {
    fontSize: 15,
    color: colors.darkBlue,
    marginBottom: 10,
    lineHeight: 22,
  },
  bold: { fontWeight: '700' },
  startButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 48,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // ── Timer ──
  timerBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    marginBottom: 8,
  },
  timerFill: {
    height: '100%',
    backgroundColor: '#EF4444',
    borderRadius: 3,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.darkBlue,
    textAlign: 'center',
    marginBottom: 12,
  },

  // ── Progress ──
  progressBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primaryBlue,
    borderRadius: 4,
  },
  progressText: {
    color: '#6B7280',
    textAlign: 'right',
    marginBottom: 20,
  },

  // ── Question ──
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
  },
  difficultyBadge: {
    color: '#F59E0B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.darkBlue,
    lineHeight: 28,
  },

  // ── Options ──
  optionsContainer: { marginBottom: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionText: { fontSize: 16, color: colors.darkBlue, flex: 1 },
  icon: { fontSize: 18, fontWeight: '700', marginLeft: 8 },

  // ── Buttons ──
  submitButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: { opacity: 0.5 },
  submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  nextButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },

  // ── Explanation ──
  explanationCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primaryBlue,
  },
  explanationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.darkBlue,
    marginBottom: 8,
  },
  explanationText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  // ── Score ──
  scoreText: {
    textAlign: 'center',
    color: colors.green,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});