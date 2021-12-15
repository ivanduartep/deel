import { createReducer } from "@reduxjs/toolkit";

import {
  GET_CONTRACTS_FAIL,
  GET_CONTRACTS_START,
  GET_CONTRACTS_SUCCESS,
} from "../action/contract";

const INITIAL_STATE = {
  loading: false,
  contracts: [],
  error: "",
};

export const contractReducer = createReducer(INITIAL_STATE, (builder) => {
  builder
    .addCase(GET_CONTRACTS_START, (state, action) => {
      state.loading = true;
    })
    .addCase(GET_CONTRACTS_FAIL, (state, action) => {
      state.loading = false;
      state.error = action.payload.error;
      state.contracts = [];
    })
    .addCase(GET_CONTRACTS_SUCCESS, (state, action) => {
      state.loading = false;
      state.contracts = action.payload.contracts;
      state.error = "";
    });
});
