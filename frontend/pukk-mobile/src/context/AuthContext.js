import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  // Restore token on app launch
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const user = await AsyncStorage.getItem('user');

        if (token && user) {
          dispatch({ type: 'RESTORE_TOKEN', payload: { token, user: JSON.parse(user) } });
        }
      } catch (e) {
        console.log('Failed to restore session', e);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    signIn: async (email, password, userType = 'karyawan') => {
      try {
        const endpoint = userType === 'admin' ? '/auth/admin/login' : '/auth/karyawan/login';
        const response = await api.post(endpoint, { email, password });

        const { token, user } = response.data;

        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('user', JSON.stringify({ ...user, type: userType }));

        dispatch({ type: 'SIGN_IN', payload: { token, user: { ...user, type: userType } } });

        return { success: true, data: user };
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed';
        return { success: false, message };
      }
    },

    signUp: async (email, password, name, phone, userType = 'karyawan') => {
      try {
        const response = await api.post('/auth/register', {
          email,
          password,
          name,
          phone,
          userType
        });

        const { token, user } = response.data;

        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('user', JSON.stringify({ ...user, type: userType }));

        dispatch({ type: 'SIGN_IN', payload: { token, user: { ...user, type: userType } } });

        return { success: true, data: user };
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        return { success: false, message };
      }
    },

    signOut: async () => {
      try {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('user');
        dispatch({ type: 'SIGN_OUT' });
        return { success: true };
      } catch (error) {
        return { success: false, message: 'Logout failed' };
      }
    },

    signUp: async (data) => {
      try {
        const response = await api.post('/auth/register', data);
        const { token, user } = response.data;

        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));

        dispatch({ type: 'SIGN_IN', payload: { token, user } });

        return { success: true, data: user };
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        return { success: false, message };
      }
    },

    changePassword: async (oldPassword, newPassword) => {
      try {
        await api.post('/auth/change-password', { oldPassword, newPassword, confirmPassword: newPassword });
        return { success: true };
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to change password';
        return { success: false, message };
      }
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, ...authContext, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

const initialState = {
  isSignout: false,
  userToken: null,
  user: null,
};

const authReducer = (prevState, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...prevState,
        userToken: action.payload.token,
        user: action.payload.user,
        isSignout: false,
      };
    case 'SIGN_IN':
      return {
        ...prevState,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        user: null,
      };
    case 'SIGN_UP':
      return {
        ...prevState,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
      };
  }
};
