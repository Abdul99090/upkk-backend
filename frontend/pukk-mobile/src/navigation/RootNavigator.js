import React, { useEffect, useReducer } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

import LoginScreen from '../screens/auth/LoginScreen';
import AdminNavigator from './AdminNavigator';
import KaryawanNavigator from './KaryawanNavigator';
import NasabahNavigator from './NasabahNavigator';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export const RootNavigator = () => {
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.payload.token,
            userType: action.payload.userType,
            user: action.payload.user,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload.token,
            userType: action.payload.userType,
            user: action.payload.user,
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            userType: null,
            user: null,
          };
        case 'SIGN_UP':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload.token,
            userType: action.payload.userType,
            user: action.payload.user,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      userType: null,
      user: null,
    }
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Restore token + fetch user data
        const token = await AsyncStorage.getItem('authToken');
        const userType = await AsyncStorage.getItem('userType');
        const user = await AsyncStorage.getItem('userData');

        if (token && userType) {
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: {
              token,
              userType,
              user: user ? JSON.parse(user) : null,
            },
          });
        }
      } catch (e) {
        console.error('Failed to restore token:', e);
      } finally {
        await SplashScreen.hideAsync();
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      signIn: async (email, password, userType) => {
        try {
          // Call API
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/${userType}/login`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || 'Login failed');
          }

          // Store token
          await AsyncStorage.setItem('authToken', data.data.token);
          await AsyncStorage.setItem('userType', userType);
          await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));

          dispatch({
            type: 'SIGN_IN',
            payload: {
              token: data.data.token,
              userType,
              user: data.data.user,
            },
          });

          return data.data;
        } catch (error) {
          throw error;
        }
      },
      signOut: async () => {
        try {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('userType');
          await AsyncStorage.removeItem('userData');
          dispatch({ type: 'SIGN_OUT' });
        } catch (error) {
          console.error('Sign out error:', error);
        }
      },
      signUp: async (email, password, userType) => {
        try {
          const response = await fetch(
            `${process.env.REACT_APP_API_URL}/auth/register`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email, password, userType }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error?.message || 'Signup failed');
          }

          await AsyncStorage.setItem('authToken', data.data.token);
          await AsyncStorage.setItem('userType', userType);
          await AsyncStorage.setItem('userData', JSON.stringify(data.data.user));

          dispatch({
            type: 'SIGN_UP',
            payload: {
              token: data.data.token,
              userType,
              user: data.data.user,
            },
          });

          return data.data;
        } catch (error) {
          throw error;
        }
      },
    }),
    []
  );

  if (state.isLoading) {
    return null; // Splash screen shown
  }

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            animationEnabled: true,
          }}
        >
          {state.userToken == null ? (
            // Auth Stack
            <Stack.Group
              screenOptions={{
                animationEnabled: false,
              }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
            </Stack.Group>
          ) : (
            // App Stack - Conditional based on user type
            <>
              {state.userType === 'admin' && (
                <Stack.Screen
                  name="AdminApp"
                  component={AdminNavigator}
                  options={{ animationEnabled: false }}
                />
              )}
              {state.userType === 'karyawan' && (
                <Stack.Screen
                  name="KaryawanApp"
                  component={KaryawanNavigator}
                  options={{ animationEnabled: false }}
                />
              )}
              {state.userType === 'nasabah' && (
                <Stack.Screen
                  name="NasabahApp"
                  component={NasabahNavigator}
                  options={{ animationEnabled: false }}
                />
              )}
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
};

export default RootNavigator;
