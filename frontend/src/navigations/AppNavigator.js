import React, { useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import QuizScreen from '../screens/QuizScreen';
import ResultsScreen from '../screens/ResultsScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import ProfileScreen from '../screens/ProfileScreen';
import BattleScreen from '../screens/BattleScreen';
import BattleQuizScreen from '../screens/BattleQuizScreen';
import BattleReadyScreen from '../screens/BattleReadyScreen';   // NEW
import AITutorScreen from '../screens/AITutorScreen';

import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ──────────────────────────────────────
// Bottom Tab Navigator for logged‑in area
// ──────────────────────────────────────
function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 10,
          shadowOpacity: 0.1,
          backgroundColor: '#FFFFFF',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarLabel: 'Home', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{ tabBarLabel: 'Ranks', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Battle"
        component={BattleScreen}
        options={{ tabBarLabel: 'Battle', tabBarIcon: () => null }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Profile', tabBarIcon: () => null }}
      />
    </Tab.Navigator>
  );
}

// ──────────────────────────────────────
// Main App Navigator
// ──────────────────────────────────────
export default function AppNavigator() {
  const { token, isLoading } = useContext(AuthContext);

  // Show spinner while checking stored token
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <>
      {token == null ? (
        // ──────── Not logged in ────────
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      ) : (
        // ──────── Logged in ────────
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {/* Tabs as the main home screen */}
          <Stack.Screen name="HomeTabs" component={HomeTabs} />

          {/* Quiz flow (pushed over tabs) */}
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />

          {/* Battle flow */}
          <Stack.Screen name="BattleReady" component={BattleReadyScreen} />
          <Stack.Screen name="BattleQuiz" component={BattleQuizScreen} />

          {/* AI Tutor */}
          <Stack.Screen name="AITutor" component={AITutorScreen} />
        </Stack.Navigator>
      )}
    </>
  );
}