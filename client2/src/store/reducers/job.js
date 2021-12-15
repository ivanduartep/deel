import { createReducer } from "@reduxjs/toolkit";

import {
  GET_JOBS_FAIL,
  GET_JOBS_START,
  GET_JOBS_SUCCESS,
} from "./../action/job";

const INITIAL_STATE = {
  loading: false,
  jobs: [],
  error: "",
};

export const jobReducer = createReducer(INITIAL_STATE, (builder) => {
  builder
    .addCase(GET_JOBS_START, (state, action) => {
      state.loading = true;
    })
    .addCase(GET_JOBS_FAIL, (state, action) => {
      state.loading = false;
      state.error = action.payload.error;
      state.jobs = [];
    })
    .addCase(GET_JOBS_SUCCESS, (state, action) => {
      state.loading = false;
      state.jobs = action.payload.jobs;
      state.error = "";
    });
});
