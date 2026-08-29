import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Screens
import HomeScreen from '../screens/karyawan/HomeScreen';
import AbsensiScreen from '../screens/karyawan/AbsensiScreen';
import NasabahListScreen from '../screens/karyawan/NasabahListScreen';
import AddNasabahScreen from '../screens/karyawan/AddNasabahScreen';
import PaymentScreen from '../screens/karyawan/PaymentScreen';
import WithdrawalScreen from '../screens/karyawan/WithdrawalScreen';
import ProfileScreen from '../screens/karyawan/ProfileScreen';
import ReportScreen from '../screens/karyawan/ReportScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Home Stack
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{ title: 'Dashboard Karyawan' }}
      />
    </Stack.Navigator>
  );
};

// Absensi Stack
const AbsensiStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AbsensiMain"
        component={AbsensiScreen}
        options={{ title: 'Absensi' }}
      />
    </Stack.Navigator>
  );
};

// Nasabah Stack
const NasabahStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="NasabahListMain"
        component={NasabahListScreen}
        options={{ title: 'Daftar Nasabah' }}
      />
      <Stack.Screen
        name="AddNasabahModal"
        component={AddNasabahScreen}
        options={{
          title: 'Tambah Nasabah',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

// Payment Stack
const PaymentStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PaymentMain"
        component={PaymentScreen}
        options={{ title: 'Pembayaran' }}
      />
    </Stack.Navigator>
  );
};

// Withdrawal Stack
const WithdrawalStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="WithdrawalMain"
        component={WithdrawalScreen}
        options={{ title: 'Penarikan Dana' }}
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
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profil Saya' }}
      />
    </Stack.Navigator>
  );
};

// Report Stack
const ReportStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#3498db',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ReportMain"
        component={ReportScreen}
        options={{ title: 'Laporan' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const KaryawanNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Absensi') {
            iconName = focused ? 'checkbox-marked' : 'checkbox-blank-outline';
            return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Nasabah') {
            iconName = focused ? 'people' : 'people-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Payment') {
            iconName = focused ? 'card' : 'card-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Withdrawal') {
            iconName = focused ? 'cash' : 'cash-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Report') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }

          return <Ionicons name="ellipse" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3498db',
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
        name="Absensi"
        component={AbsensiStack}
        options={{
          tabBarLabel: 'Absensi',
        }}
      />
      <Tab.Screen
        name="Nasabah"
        component={NasabahStack}
        options={{
          tabBarLabel: 'Nasabah',
        }}
      />
      <Tab.Screen
        name="Payment"
        component={PaymentStack}
        options={{
          tabBarLabel: 'Pembayaran',
        }}
      />
      <Tab.Screen
        name="Withdrawal"
        component={WithdrawalStack}
        options={{
          tabBarLabel: 'Penarikan',
        }}
      />
      <Tab.Screen
        name="Report"
        component={ReportStack}
        options={{
          tabBarLabel: 'Laporan',
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

export default KaryawanNavigator;
