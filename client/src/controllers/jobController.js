import {
  GET_JOBS_FAIL,
  GET_JOBS_START,
  GET_JOBS_SUCCESS,
} from "../store/action/job";
import { getHttpClient } from "../utils/httpClient";

export const getJobs = (id) => {
  return function (dispatch) {
    const client = getHttpClient(id);
    dispatch(GET_JOBS_START());

    client
      .get("/jobs/unpaid")
      .then((response) => {
        dispatch(
          GET_JOBS_SUCCESS({
            jobs: response.data,
          })
        );
      })
      .catch((err) => {
        dispatch(
          GET_JOBS_FAIL({
            error: err.toString(),
          })
        );
      });
  };
};
