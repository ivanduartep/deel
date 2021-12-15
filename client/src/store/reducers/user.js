import { createReducer } from "@reduxjs/toolkit";

import {
  GET_USER_FAIL,
  GET_USER_START,
  GET_USER_SUCCESS,
} from "./../action/user";

const INITIAL_STATE = {
  authenticated: false,
  loading: false,
  user: null,
  error: "",
};

export const userReducer = createReducer(INITIAL_STATE, (builder) => {
  builder
    .addCase(GET_USER_START, (state, action) => {
      state.loading = true;
    })
    .addCase(GET_USER_FAIL, (state, action) => {
      state.loading = false;
      state.error = action.payload.error;
      state.user = {};
      state.authenticated = false;
    })
    .addCase(GET_USER_SUCCESS, (state, action) => {
      state.loading = false;
      state.user = action.payload.profile;
      state.error = "";
      state.authenticated = true;
    });
});
