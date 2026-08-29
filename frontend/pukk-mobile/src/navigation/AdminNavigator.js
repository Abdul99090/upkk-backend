import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Screens - akan dibuat next
import AdminDashboard from '../screens/admin/AdminDashboard';
import AdminKaryawanScreen from '../screens/admin/AdminKaryawanScreen';
import AdminNasabahScreen from '../screens/admin/AdminNasabahScreen';
import AdminPaymentScreen from '../screens/admin/AdminPaymentScreen';
import AdminWithdrawalScreen from '../screens/admin/AdminWithdrawalScreen';
import AdminSettingsScreen from '../screens/admin/AdminSettingsScreen';
import AdminReportScreen from '../screens/admin/AdminReportScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Dashboard Stack
const DashboardStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="DashboardMain"
        component={AdminDashboard}
        options={{ title: 'Admin Dashboard' }}
      />
    </Stack.Navigator>
  );
};

// Karyawan Management Stack
const KaryawanStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="KaryawanListMain"
        component={AdminKaryawanScreen}
        options={{ title: 'Manajemen Karyawan' }}
      />
    </Stack.Navigator>
  );
};

// Nasabah Management Stack
const NasabahStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="NasabahListMain"
        component={AdminNasabahScreen}
        options={{ title: 'Manajemen Nasabah' }}
      />
    </Stack.Navigator>
  );
};

// Payment Management Stack
const PaymentStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="PaymentMain"
        component={AdminPaymentScreen}
        options={{ title: 'Manajemen Pembayaran' }}
      />
    </Stack.Navigator>
  );
};

// Withdrawal Approval Stack
const WithdrawalStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="WithdrawalMain"
        component={AdminWithdrawalScreen}
        options={{ title: 'Persetujuan Penarikan' }}
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
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="ReportMain"
        component={AdminReportScreen}
        options={{ title: 'Laporan & Analytics' }}
      />
    </Stack.Navigator>
  );
};

// Settings Stack
const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#2c3e50',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="SettingsMain"
        component={AdminSettingsScreen}
        options={{ title: 'Pengaturan Sistem' }}
      />
    </Stack.Navigator>
  );
};

// Main Tab Navigator
const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Karyawan') {
            iconName = focused ? 'people' : 'people-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Nasabah') {
            iconName = focused ? 'contacts' : 'contacts-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Payment') {
            iconName = focused ? 'card' : 'card-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Withdrawal') {
            iconName = focused ? 'checkmark-circle' : 'checkmark-circle-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Report') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          }

          return <Ionicons name="ellipse" size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c3e50',
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
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="Karyawan"
        component={KaryawanStack}
        options={{
          tabBarLabel: 'Karyawan',
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
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarLabel: 'Pengaturan',
        }}
      />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
