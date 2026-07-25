import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import colors from '../constants/colors';

const SOCKET_URL = 'http://10.250.123.50:5000';

export default function BattleQuizScreen({ route, navigation }) {
  const { user } = useContext(AuthContext);
  const {
    room,
    players,
    questions: sharedQuestions,
    socketId,
  } = route.params;

  const [questions] = useState(sharedQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [opponentProgress, setOpponentProgress] = useState(
    new Array(sharedQuestions.length).fill(false)
  );
  const [battleEnded, setBattleEnded] = useState(false);
  const [winner, setWinner] = useState(null);

  // Store user's answers for later review
  const [userAnswers, setUserAnswers] = useState(
    new Array(sharedQuestions.length).fill(null)
  );

  const socketRef = useRef(null);

  // ─── Connect and listen ───────────────────
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join-room', room);

    socket.on('opponent-answer', (data) => {
      if (data.isCorrect) {
        setOpponentScore((prev) => prev + 10);
      }
      setOpponentProgress((prev) => {
        const updated = [...prev];
        updated[data.questionIndex] = true;
        return updated;
      });
    });

    socket.on('battle-end', (data) => {
      setOpponentScore(data.score);
      setBattleEnded(true);
    });

    return () => socket.disconnect();
  }, [room]);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  // 🛡️ SAFETY NET: show loading if questions aren't ready yet
  if (!currentQuestion) {
    return (
      <LinearGradient colors={['#FFFFFF', '#DBEAFE']} style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={{ marginTop: 10, color: colors.darkBlue, fontWeight: 'bold' }}>
          Loading battle data...
        </Text>
      </LinearGradient>
    );
  }

  // ─── Selection ────────────────────────────
  const handleSelectOption = (option) => {
    if (submitted) return;
    setSelectedOption(option);
  };

  // ─── Submit answer (no immediate feedback) ──
  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore((prev) => prev + 10);

    // Save this answer
    const updated = [...userAnswers];
    updated[currentIndex] = {
      selectedOption,
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      questionText: currentQuestion.questionText,
    };
    setUserAnswers(updated);

    // Notify opponent
    socketRef.current?.emit('answer', {
      room,
      answer: selectedOption,
      isCorrect,
      questionIndex: currentIndex,
    });
  };

  // ─── Next question or end battle ──────────
  const handleNext = () => {
    if (isLast) {
      socketRef.current?.emit('end-battle', {
        room,
        score,
      });
      setBattleEnded(true);
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setSubmitted(false);
    }
  };

  // ─── Determine winner when battle ends ────
  useEffect(() => {
    if (battleEnded && opponentScore !== null) {
      if (score > opponentScore) setWinner('You');
      else if (score < opponentScore) setWinner('Opponent');
      else setWinner('Draw');
    }
  }, [battleEnded, opponentScore, score]);

  // ─── Result screen (after battle) ─────────
  if (battleEnded) {
    return (
      <LinearGradient colors={['#FFFFFF', '#DBEAFE', '#93C5FD']} style={styles.centered}>
        <ScrollView contentContainerStyle={styles.resultContainer}>
          <Animatable.View animation="bounceIn" style={styles.resultCard}>
            <Text style={styles.resultTitle}>Battle Over!</Text>
            <Text style={styles.resultScore}>You: {score} pts</Text>
            <Text style={styles.resultScore}>Opponent: {opponentScore} pts</Text>
            <Text style={styles.winnerText}>
              {winner === 'Draw' ? "It's a tie! 🤝" : `Winner: ${winner} 🏆`}
            </Text>

            <Text style={styles.reviewTitle}>Review Your Answers</Text>

            {userAnswers.map((ans, idx) => {
              if (!ans) return null;
              return (
                <View key={idx} style={styles.reviewItem}>
                  <Text style={styles.reviewQuestion}>
                    Q{idx + 1}: {ans.questionText}
                  </Text>
                  <Text style={styles.reviewYourAnswer}>
                    Your answer: <Text style={{ fontWeight: '700' }}>{ans.selectedOption}</Text>
                  </Text>
                  <Text style={styles.reviewCorrectAnswer}>
                    Correct answer: <Text style={{ fontWeight: '700', color: '#10B981' }}>{ans.correctAnswer}</Text>
                  </Text>
                  <Text style={[styles.reviewIcon, ans.isCorrect ? styles.correctIcon : styles.wrongIcon]}>
                    {ans.isCorrect ? '✔ Correct' : '✘ Wrong'}
                  </Text>
                </View>
              );
            })}

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('HomeTabs')}
            >
              <Text style={styles.buttonText}>Back to Dashboard</Text>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
    );
  }

  // ─── Main battle UI ───────────────────────
  return (
    <LinearGradient colors={['#FFFFFF', '#DBEAFE', '#93C5FD']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Opponent progress dots */}
        <View style={styles.opponentRow}>
          {opponentProgress.map((done, idx) => (
            <View key={idx} style={[styles.dot, done && styles.dotDone]} />
          ))}
        </View>
        <Text style={styles.opponentLabel}>Opponent's progress</Text>

        {/* Your progress */}
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

        {/* Question card */}
        <Animatable.View animation="fadeInUp" style={styles.questionCard}>
          <Text style={styles.difficultyBadge}>
            {currentQuestion.difficulty?.toUpperCase() || 'MEDIUM'}
          </Text>
          <Text style={styles.questionText}>{currentQuestion.questionText}</Text>
        </Animatable.View>

        {/* Options - no correct/wrong colors during battle */}
        {currentQuestion.options.map((option, idx) => {
          let optionStyle = styles.option;
          if (submitted && option === selectedOption) {
            optionStyle = { ...optionStyle, borderColor: colors.primaryBlue, borderWidth: 3 };
          } else if (!submitted && option === selectedOption) {
            optionStyle = { ...optionStyle, borderColor: colors.primaryBlue, borderWidth: 3 };
          }
          return (
            <TouchableOpacity
              key={idx}
              style={optionStyle}
              onPress={() => handleSelectOption(option)}
              disabled={submitted}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Submit / Next buttons */}
        {!submitted ? (
          <TouchableOpacity
            style={[styles.submitButton, !selectedOption && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!selectedOption}
          >
            <Text style={styles.submitButtonText}>Submit Answer</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {isLast ? 'Finish Battle' : 'Next Question'}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// ─── Styles (unchanged, includes review styles) ───
const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { padding: 20, paddingBottom: 40 },
  resultContainer: { padding: 20, paddingBottom: 40, alignItems: 'center' },
  opponentRow: { flexDirection: 'row', justifyContent: 'center', marginBottom: 4 },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 3,
  },
  dotDone: { backgroundColor: '#10B981' },
  opponentLabel: { textAlign: 'center', color: '#6B7280', fontSize: 12, marginBottom: 12 },
  progressBar: { height: 8, backgroundColor: '#E5E7EB', borderRadius: 4, marginBottom: 8 },
  progressFill: { height: '100%', backgroundColor: colors.primaryBlue, borderRadius: 4 },
  progressText: { color: '#6B7280', textAlign: 'right', marginBottom: 20 },
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
  questionText: { fontSize: 20, fontWeight: '700', color: colors.darkBlue, lineHeight: 28 },
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
  submitButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  nextButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  nextButtonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  resultCard: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    marginTop: 40,
  },
  resultTitle: { fontSize: 28, fontWeight: '800', color: colors.darkBlue, marginBottom: 10, textAlign: 'center' },
  resultScore: { fontSize: 20, color: colors.darkBlue, marginBottom: 6, textAlign: 'center' },
  winnerText: { fontSize: 22, fontWeight: '700', color: colors.gold, marginTop: 12, marginBottom: 20, textAlign: 'center' },
  reviewTitle: { fontSize: 20, fontWeight: '700', color: colors.darkBlue, marginVertical: 15, textAlign: 'center' },
  reviewItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  reviewQuestion: { fontSize: 16, fontWeight: '600', color: colors.darkBlue, marginBottom: 6 },
  reviewYourAnswer: { fontSize: 15, color: colors.darkBlue },
  reviewCorrectAnswer: { fontSize: 15, color: colors.darkBlue, marginTop: 4 },
  reviewIcon: { fontSize: 15, fontWeight: '700', marginTop: 6 },
  correctIcon: { color: '#10B981' },
  wrongIcon: { color: '#EF4444' },
  button: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: '700' },
});