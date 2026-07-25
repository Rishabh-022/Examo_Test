import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { io } from 'socket.io-client';
import colors from '../constants/colors';

const SOCKET_URL = 'http://10.250.123.50:5000';

export default function BattleReadyScreen({ route, navigation }) {
  const { room, players, questions, socketId } = route.params;
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join-room', room);

    // When both are ready, server tells us to start
    socket.on('both-ready', () => {
      navigation.navigate('BattleQuiz', {
        room,
        players,
        questions,
        socketId,
      });
    });

    // Optional: you could also listen for an opponent-ready event if you want to show
    // a visual indicator that the other player has pressed Ready.
    // For simplicity, we just wait for both-ready.

    return () => socket.disconnect();
  }, [room, players, questions, socketId]);

  const handleReady = () => {
    if (isReady) return;
    setIsReady(true);
    socketRef.current?.emit('player-ready', { room });
    setOpponentReady(false);   // we don't know yet, but we can show a waiting spinner
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#DBEAFE', '#93C5FD']} style={styles.container}>
      <Animatable.View animation="fadeInUp" style={styles.card}>
        <Text style={styles.title}>⚔️ Battle Ready</Text>

        <View style={styles.rules}>
          <Text style={styles.rule}>• You will answer {questions.length} questions</Text>
          <Text style={styles.rule}>• Each correct answer gives you 10 XP</Text>
          <Text style={styles.rule}>• The player with the most XP wins</Text>
          <Text style={styles.rule}>• You cannot change your answer after submitting</Text>
        </View>

        {!isReady ? (
          <TouchableOpacity style={styles.readyButton} onPress={handleReady}>
            <Text style={styles.readyButtonText}>I'm Ready</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.waitingBox}>
            <ActivityIndicator size="small" color={colors.primaryBlue} />
            <Text style={styles.waitingText}>Waiting for opponent...</Text>
          </View>
        )}
      </Animatable.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    alignItems: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', color: colors.darkBlue, marginBottom: 20 },
  rules: { alignSelf: 'stretch', marginBottom: 30 },
  rule: { fontSize: 16, color: colors.darkBlue, marginBottom: 10, lineHeight: 22 },
  readyButton: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 48,
  },
  readyButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  waitingBox: { alignItems: 'center', marginTop: 10 },
  waitingText: { marginTop: 10, fontSize: 16, color: colors.darkBlue },
});