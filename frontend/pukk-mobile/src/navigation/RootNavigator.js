import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/auth/LoginScreen';
import AdminNavigator from './AdminNavigator';
import KaryawanNavigator from './KaryawanNavigator';
import NasabahNavigator from './NasabahNavigator';
import { AuthContext } from '../context/AuthContext';
import { resolveRoute } from '../services/navigationAssistant';

const Stack = createNativeStackNavigator();

export const RootNavigator = () => {
  const { userToken, user, userType, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return null;
  }

  const resolvedRoute = resolveRoute({ userToken, userType, user });

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        {resolvedRoute === 'Login' && <Stack.Screen name="Login" component={LoginScreen} />}
        {resolvedRoute === 'AdminApp' && (
          <Stack.Screen name="AdminApp" component={AdminNavigator} options={{ animationEnabled: false }} />
        )}
        {resolvedRoute === 'KaryawanApp' && (
          <Stack.Screen name="KaryawanApp" component={KaryawanNavigator} options={{ animationEnabled: false }} />
        )}
        {resolvedRoute === 'NasabahApp' && (
          <Stack.Screen name="NasabahApp" component={NasabahNavigator} options={{ animationEnabled: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
