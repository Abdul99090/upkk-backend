import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AuthContext = createContext();

const initialState = {
  isSignout: false,
  userToken: null,
  user: null,
  userType: null,
};

const authReducer = (prevState, action) => {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...prevState,
        userToken: action.payload.token,
        user: action.payload.user,
        userType: action.payload.userType,
        isSignout: false,
      };
    case 'SIGN_IN':
      return {
        ...prevState,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
        userType: action.payload.userType,
      };
    case 'SIGN_OUT':
      return {
        ...prevState,
        isSignout: true,
        userToken: null,
        user: null,
        userType: null,
      };
    case 'SIGN_UP':
      return {
        ...prevState,
        isSignout: false,
        userToken: action.payload.token,
        user: action.payload.user,
        userType: action.payload.userType,
      };
    default:
      return prevState;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialState);
  const [isLoading, setIsLoading] = useState(true);

  const restoreSession = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const user = await AsyncStorage.getItem('user');
      const userType = await AsyncStorage.getItem('userType');

      if (token && user) {
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: {
            token,
            user: JSON.parse(user),
            userType,
          },
        });
      }
    } catch (error) {
      console.log('Failed to restore session', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const signIn = async (email, password, userType = 'karyawan') => {
    try {
      const endpoint = userType === 'admin' ? '/auth/admin/login' : '/auth/karyawan/login';
      const response = await api.post(endpoint, { email, password });
      const { token, user } = response.data;
      const normalizedUser = { ...user, type: userType };

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
      await AsyncStorage.setItem('userType', userType);

      dispatch({ type: 'SIGN_IN', payload: { token, user: normalizedUser, userType } });
      return { success: true, data: normalizedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  };

  const signUp = async (data) => {
    try {
      const response = await api.post('/auth/register', data);
      const { token, user } = response.data;
      const normalizedUser = { ...user, type: data.userType || 'karyawan' };

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(normalizedUser));
      await AsyncStorage.setItem('userType', normalizedUser.type);

      dispatch({ type: 'SIGN_UP', payload: { token, user: normalizedUser, userType: normalizedUser.type } });
      return { success: true, data: normalizedUser };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      return { success: false, message };
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('userType');
      dispatch({ type: 'SIGN_OUT' });
      return { success: true };
    } catch (error) {
      return { success: false, message: 'Logout failed' };
    }
  };

  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.post('/auth/change-password', {
        oldPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, isLoading, signIn, signOut, signUp, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
