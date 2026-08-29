import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Screens - akan dibuat
import NasabahHomeScreen from '../screens/nasabah/NasabahHomeScreen';
import NasabahPaymentHistoryScreen from '../screens/nasabah/NasabahPaymentHistoryScreen';
import NasabahProfileScreen from '../screens/nasabah/NasabahProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#27ae60',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="NasabahHomeMain"
        component={NasabahHomeScreen}
        options={{ title: 'Dashboard Nasabah' }}
      />
    </Stack.Navigator>
  );
};

// Payment History Stack
const PaymentHistoryStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#27ae60',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PaymentHistoryMain"
        component={NasabahPaymentHistoryScreen}
        options={{ title: 'Riwayat Pembayaran' }}
      />
    </Stack.Navigator>
  );
};

// Profile Stack
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#27ae60',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="NasabahProfileMain"
        component={NasabahProfileScreen}
        options={{ title: 'Profil Saya' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const NasabahNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'PaymentHistory') {
            iconName = focused ? 'receipt' : 'receipt-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }

          return <Ionicons name="ellipse" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#27ae60',
        tabBarInactiveTintColor: '#95a5a6',
        tabBarStyle: {
          borderTopColor: '#ecf0f1',
          borderTopWidth: 1,
          backgroundColor: '#fff',
          paddingBottom: 5,
          paddingTop: 5,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="PaymentHistory"
        component={PaymentHistoryStack}
        options={{
          tabBarLabel: 'Pembayaran',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profil',
        }}
      />
    </Tab.Navigator>
  );
};

export default NasabahNavigator;
