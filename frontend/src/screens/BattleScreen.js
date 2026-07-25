import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import colors from '../constants/colors';

const SOCKET_URL = 'http://10.250.123.50:5000';

const SUBJECTS = ['Science', 'Maths', 'Physics', 'Chemistry', 'Biology'];

export default function BattleScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [selectedSubject, setSelectedSubject] = useState('Maths');
  const [status, setStatus] = useState('idle'); // idle | waiting | found
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('waiting', () => setStatus('waiting'));

    // ─── When opponent found, go to Ready screen instead of directly to quiz ───
    newSocket.on('match-found', ({ room, players, questions }) => {
      setStatus('found');
      navigation.navigate('BattleReady', {
        room,
        players,
        questions,
        socketId: newSocket.id,
      });
    });

    return () => newSocket.disconnect();
  }, []);

  const findMatch = () => {
    if (socket) {
      setStatus('waiting');
      socket.emit('find-match', {
        userId: user._id,
        board: user.board,
        classLevel: user.classLevel,
        subject: selectedSubject,
      });
    }
  };

  return (
    <LinearGradient colors={['#FFFFFF', '#DBEAFE', '#93C5FD']} style={styles.container}>
      <Text style={styles.title}>⚔️ Friend Battle</Text>

      {/* Subject Selector */}
      <Text style={styles.label}>Select Subject</Text>
      <View style={styles.subjectRow}>
        {SUBJECTS.map((subj) => (
          <TouchableOpacity
            key={subj}
            style={[styles.subjectChip, selectedSubject === subj && styles.subjectChipActive]}
            onPress={() => setSelectedSubject(subj)}
          >
            <Text style={[styles.subjectText, selectedSubject === subj && styles.subjectTextActive]}>
              {subj}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {status === 'idle' && (
        <TouchableOpacity style={styles.button} onPress={findMatch}>
          <Text style={styles.buttonText}>Find Match</Text>
        </TouchableOpacity>
      )}

      {status === 'waiting' && (
        <View style={styles.waitingBox}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={styles.waitingText}>Searching for opponent...</Text>
        </View>
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 28, fontWeight: '800', color: colors.darkBlue, marginBottom: 20 },
  label: { fontSize: 18, fontWeight: '700', color: colors.darkBlue, marginBottom: 12 },
  subjectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 30,
  },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.7)',
    margin: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  subjectChipActive: {
    backgroundColor: colors.primaryBlue,
    borderColor: colors.primaryBlue,
  },
  subjectText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  subjectTextActive: { color: '#FFFFFF' },
  button: {
    backgroundColor: colors.primaryBlue,
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 40,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  waitingBox: { alignItems: 'center', marginTop: 20 },
  waitingText: { marginTop: 12, fontSize: 16, color: colors.darkBlue },
});