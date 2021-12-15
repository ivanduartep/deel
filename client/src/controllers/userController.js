import {
  GET_USER_FAIL,
  GET_USER_START,
  GET_USER_SUCCESS,
} from "../store/action/user";
import { getHttpClient } from "../utils/httpClient";

export const login = (id) => {
  return function (dispatch) {
    const client = getHttpClient();
    dispatch(GET_USER_START());

    client
      .post("/login", { id })
      .then((response) => {
        dispatch(
          GET_USER_SUCCESS({
            profile: response.data,
          })
        );
      })
      .catch((err) => {
        dispatch(
          GET_USER_FAIL({
            error: err.toString(),
          })
        );
      });
  };
};
