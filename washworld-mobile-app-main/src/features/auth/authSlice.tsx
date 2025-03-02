import { User } from '@models/User';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from 'src/app/store';
import * as SecureStore from 'expo-secure-store';
import axios, { setTokenInAxiosHeaders } from 'src/app/axios';

// SECURE STORE TOKEN HANDLING

const saveToken = async (token: string) => {
  console.log('[saveToken] Saving token:', token);
  await SecureStore.setItemAsync('token', token);
};


export async function saveItemAsync(key: string, value: string) {
  try {
    await SecureStore.setItemAsync(key, value);
    console.log(`Saved ${key}:`, value);
  } catch (error) {
    console.error('Error saving to SecureStore:', error);
  }
}



const getToken = async () => {
  console.log('[getToken] Retrieving token...');
  await saveItemAsync('userToken', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1haWxAYWRtaW4uY29tIiwiaWQiOjEsImZpcnN0TmFtZSI6IkFkbWluIiwibGFzdE5hbWUiOiJBZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0MDcyMjc1NH0.mihs1e_6l_qlRW9-eOLc_2hM37-dIEZH0AOOOh-MhnY');
  const token = await SecureStore.getItemAsync('userToken');
  console.log('[getToken] Retrieved token:', token);
  return token;
};

const deleteToken = async () => {
  console.log('[deleteToken] Deleting token...');
  await SecureStore.deleteItemAsync('userToken');
  await new Promise(res => setTimeout(res, 500)); // Add delay

  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    console.warn('[deleteToken] Token still exists:', token);
  } else {
    console.log('[deleteToken] Token successfully deleted');
  }
};




export interface AuthState {
  isSignedIn: boolean;
  user: User | null;
  status: 'idle' | 'loading' | 'success' | 'failure';
}

// PAYLOAD TYPES
type SignInPayloadType = {
  email: string;
  password: string;
};

type SignUpPayloadType = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const initialState: AuthState = {
  isSignedIn: false,
  user: null,
  status: 'idle',
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type SignupResponse = {
  createdAt: string;
  email: string;
  firstName: string;
  lastName: string;
  id: number;
  isActive: boolean;
  password: string;
  role: string;
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    idle: (state: AuthState) => {
      console.log('[authSlice] Setting status to idle');
      state.status = 'idle';
    },
    request: (state: AuthState) => {
      console.log('[authSlice] Setting status to loading');
      state.status = 'loading';
    },
    signupSuccess: (state: AuthState) => {
      console.log('[authSlice] Signup success');
      state.status = 'success';
    },
    signinSuccess: (state: AuthState, action: PayloadAction<User>) => {
      console.log('[authSlice] Signin success:', action.payload);
      state.user = action.payload;
      state.isSignedIn = true;
      state.status = 'success';
    },
    signoutSuccess: (state: AuthState) => {
      console.log('[authSlice] Signout success');
      state.user = null;
      state.isSignedIn = false;
      state.status = 'success';
    },
    failure: (state: AuthState) => {
      console.log('[authSlice] Authentication failure');
      state.user = null;
      state.isSignedIn = false;
      state.status = 'failure';
    },
  },
});

export const signIn = (payload: SignInPayloadType) => async (dispatch: AppDispatch) => {
  console.log('[signIn] Signing in with:', payload);
  dispatch(authSlice.actions.request());

  try {
    const response = await axios.post<AuthResponse>('/auth/login', payload);
    console.log('[signIn] Response received:', response.data);

    const { user, token } = response.data;
    if (user && token) {
      await saveToken(token);
      setTokenInAxiosHeaders(token);
      dispatch(authSlice.actions.signinSuccess(user));
    } else {
      throw new Error('Invalid response from server while authenticating user');
    }
  } catch (error: any) {
    console.error('[signIn] Error:', error);
    dispatch(authSlice.actions.failure());
  } finally {
    dispatch(authSlice.actions.idle());
  }
};

export const signUp = (payload: SignUpPayloadType) => async (dispatch: AppDispatch) => {
  console.log('[signUp] Signing up with:', payload);
  dispatch(authSlice.actions.request());

  try {
    const response = await axios.post<SignupResponse>('/auth/signup', payload);
    console.log('[signUp] Response received:', response.data);

    if (response.data.id) {
      dispatch(authSlice.actions.signupSuccess());
      return response.data;
    } else {
      throw new Error('Invalid response from server while creating user');
    }
  } catch (error) {
    console.error('[signUp] Error:', error);
    dispatch(authSlice.actions.failure());
  } finally {
    dispatch(authSlice.actions.idle());
  }
};

export const signOut = () => async (dispatch: AppDispatch) => {
  console.log('[signOut] Signing out...');
  dispatch(authSlice.actions.request());

  try {
    await deleteToken();
    setTokenInAxiosHeaders('');
    dispatch(authSlice.actions.signoutSuccess());

    const token = await getToken();
    // if (token?.length) {
    //   console.warn('[signOut] Token was not deleted properly');
    //   dispatch(authSlice.actions.failure());
    // }
  } catch (error) {
    console.error('[signOut] Error:', error);
    dispatch(authSlice.actions.failure());
  } finally {
    dispatch(authSlice.actions.idle());
  }
};

export const autoSignIn = () => async (dispatch: AppDispatch) => {
  console.log('[autoSignIn] Auto sign-in triggered');
  dispatch(authSlice.actions.request());

  setTimeout(async () => {
    try {
      const storedToken = await getToken();

    
      console.log('[autoSignIn] Stored token:', storedToken);

      if (storedToken) {
        const res = await axios.get<AuthResponse>('/auth/verify', {
          headers: { authorization: `${storedToken}` },
        });
        console.log('[autoSignIn] Token verification response:', res.data);

        const { user, token } = res.data;
        if (user && token) {
          await saveToken(token);
          setTokenInAxiosHeaders(token);
          dispatch(authSlice.actions.signinSuccess(user));
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        throw new Error('No token found');
      }
    } catch (error) {
      console.error('[autoSignIn] Error:', error);
      dispatch(authSlice.actions.failure());
    } finally {
      dispatch(authSlice.actions.idle());
    }
  }, 2000);
};

export const { idle, request, signupSuccess, signinSuccess, signoutSuccess, failure } = authSlice.actions;

export default authSlice.reducer;
