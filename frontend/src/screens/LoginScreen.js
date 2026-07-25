import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import { AuthContext } from '../context/AuthContext';
import colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const emailScale = useRef(new Animated.Value(1)).current;
  const passwordScale = useRef(new Animated.Value(1)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleEmailFocus = () => {
    setEmailFocused(true);
    Animated.spring(emailScale, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
    Animated.spring(emailScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handlePasswordFocus = () => {
    setPasswordFocused(true);
    Animated.spring(passwordScale, {
      toValue: 1.02,
      useNativeDriver: true,
    }).start();
  };

  const handlePasswordBlur = () => {
    setPasswordFocused(false);
    Animated.spring(passwordScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.msg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Animated Background Shapes */}
      <Animatable.View
        animation="fadeInUp"
        duration={1000}
        style={[styles.shapeContainer, styles.shape1]}
      >
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={4000}
          style={styles.shape1Inner}
        />
      </Animatable.View>

      <Animatable.View
        animation="fadeInDown"
        duration={1200}
        delay={200}
        style={[styles.shapeContainer, styles.shape2]}
      >
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={5000}
          style={styles.shape2Inner}
        />
      </Animatable.View>

      <Animatable.View
        animation="fadeInLeft"
        duration={1100}
        delay={400}
        style={[styles.shapeContainer, styles.shape3]}
      >
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          duration={4500}
          style={styles.shape3Inner}
        />
      </Animatable.View>

      {/* Main Card Container */}
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            opacity: cardOpacity,
            transform: [
              {
                translateY: cardOpacity.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Animatable.View animation="zoomIn" duration={800} style={styles.card}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Animatable.View
              animation="bounceIn"
              duration={1000}
              style={styles.logoCircle}
            >
              <Text style={styles.logoIcon}>📚</Text>
            </Animatable.View>
            <Animatable.Text
              animation="fadeInDown"
              duration={800}
              style={styles.title}
            >
              EduQuest
            </Animatable.Text>
            <Animatable.Text
              animation="fadeInUp"
              duration={800}
              delay={200}
              style={styles.subtitle}
            >
              Learn. Compete. Win.
            </Animatable.Text>
          </View>

          {/* Input Section */}
          <View style={styles.inputSection}>
            <Animatable.View
              animation="fadeInLeft"
              duration={800}
              delay={300}
              style={[
                styles.inputWrapper,
                emailFocused && styles.inputWrapperFocused,
              ]}
            >
              <Animated.View
                style={[
                  styles.inputContainer,
                  { transform: [{ scale: emailScale }] },
                ]}
              >
                <Text style={styles.inputIcon}>✉️</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="#B8C5D6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={handleEmailFocus}
                  onBlur={handleEmailBlur}
                />
              </Animated.View>
            </Animatable.View>

            <Animatable.View
              animation="fadeInRight"
              duration={800}
              delay={400}
              style={[
                styles.inputWrapper,
                passwordFocused && styles.inputWrapperFocused,
              ]}
            >
              <Animated.View
                style={[
                  styles.inputContainer,
                  { transform: [{ scale: passwordScale }] },
                ]}
              >
                <Text style={styles.inputIcon}>🔐</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#B8C5D6"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  onFocus={handlePasswordFocus}
                  onBlur={handlePasswordBlur}
                />
              </Animated.View>
            </Animatable.View>
          </View>

          {/* Button Section */}
          <Animatable.View
            animation="fadeInUp"
            duration={800}
            delay={500}
            style={styles.buttonSection}
          >
            <TouchableOpacity
              onPressIn={handleButtonPressIn}
              onPressOut={handleButtonPressOut}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Animated.View
                style={[
                  styles.button,
                  loading && styles.buttonDisabled,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <Animatable.View animation="pulse" iterationCount="infinite">
                      <Text style={styles.buttonText}>⏳ Logging in...</Text>
                    </Animatable.View>
                  ) : (
                    <Text style={styles.buttonText}>Login →</Text>
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          </Animatable.View>

          {/* Footer Link */}
          <Animatable.View
            animation="fadeIn"
            duration={800}
            delay={600}
            style={styles.footerSection}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Register')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.link}>
                Don't have an account?{' '}
                <Text style={styles.linkBold}>Register here</Text>
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  // Background Shapes
  shapeContainer: {
    position: 'absolute',
    borderRadius: 999,
  },
  shape1: {
    width: 250,
    height: 250,
    top: -80,
    left: -60,
  },
  shape1Inner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  shape2: {
    width: 200,
    height: 200,
    bottom: 100,
    right: -50,
  },
  shape2Inner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  shape3: {
    width: 180,
    height: 180,
    bottom: -60,
    left: -40,
  },
  shape3Inner: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  // Card Styles
  cardWrapper: {
    width: '100%',
    maxWidth: 400,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 28,
    paddingVertical: 40,
    paddingHorizontal: 24,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 15,
    overflow: 'hidden',
  },

  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: '#1a202c',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Input Section
  inputSection: {
    marginBottom: 24,
    gap: 12,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputWrapperFocused: {
    transform: [{ scale: 1.02 }],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E2E8F0',
    minHeight: 56,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1a202c',
    paddingVertical: 16,
  },

  // Button Section
  buttonSection: {
    marginVertical: 24,
  },
  button: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 12,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Footer Section
  footerSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  link: {
    color: '#718096',
    fontSize: 14,
    fontWeight: '500',
  },
  linkBold: {
    color: '#667eea',
    fontWeight: '700',
  },
});