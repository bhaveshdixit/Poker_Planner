import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { login, logout } from '@services/backend';

const initialState = {
  token: '',
  isLoading: false,
  has_jira_credentials: false,
  error: '',
  first_name: '',
  last_name: '',
  email: '',
};

export const loginUser = createAsyncThunk(
  'login/loginUser',
  async ({ email, password }: { email: string; password: string }) => {
    const response = await login({ email, password });
    if (response.status === 200) return response.data;
    else if (Object.keys(response.data)[0])
      throw new Error(response.data[Object.keys(response.data)[0]][0]);
    throw new Error('Authentication failed');
  }
);

export const logoutUser = createAsyncThunk(
  'logout/logoutUser',
  async (token: string) => {
    await logout(token);
  }
);

export const loginSlice = createSlice({
  name: 'login',
  initialState,
  reducers: {
    setAuthToken: (state, action) => {
      state.token = action.payload;
    },
    unsetAuthToken: (state) => {
      return initialState;
    },
    setIsLoading: (state) => {
      state.isLoading = true;
    },
    unsetIsLoading: (state) => {
      state.isLoading = false;
    },
    resetError: (state) => {
      state.error = initialState.error;
    },
    addJira: (state) => {
      state.has_jira_credentials = true;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      return {
        ...action.payload,
        isLoading: false,
        error: '',
      };
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.error.message || 'Authentication failed';
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      return initialState;
    });
    builder.addCase(logoutUser.rejected, (state) => {
      return initialState;
    });
  },
});

export const {
  setAuthToken,
  unsetAuthToken,
  setIsLoading,
  unsetIsLoading,
  resetError,
  addJira,
} = loginSlice.actions;

export default loginSlice.reducer;
