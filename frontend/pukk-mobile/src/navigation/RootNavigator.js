import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import AdminNavigator from './AdminNavigator';
import KaryawanNavigator from './KaryawanNavigator';
import NasabahNavigator from './NasabahNavigator';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { userToken, user, userType, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  const resolvedUserType = userType || user?.type || user?.role;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {userToken == null ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : resolvedUserType === 'admin' ? (
          <Stack.Screen name="AdminApp" component={AdminNavigator} options={{ animationEnabled: false }} />
        ) : resolvedUserType === 'karyawan' ? (
          <Stack.Screen name="KaryawanApp" component={KaryawanNavigator} options={{ animationEnabled: false }} />
        ) : resolvedUserType === 'nasabah' ? (
          <Stack.Screen name="NasabahApp" component={NasabahNavigator} options={{ animationEnabled: false }} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
