import {
  GET_CONTRACTS_FAIL,
  GET_CONTRACTS_START,
  GET_CONTRACTS_SUCCESS,
} from "../store/action/contract";
import { getHttpClient } from "../utils/httpClient";

export const getContracts = (id) => {
  return function (dispatch) {
    const client = getHttpClient(id);
    dispatch(GET_CONTRACTS_START());

    client
      .get("/contracts")
      .then((response) => {
        dispatch(
          GET_CONTRACTS_SUCCESS({
            contracts: response.data,
          })
        );
      })
      .catch((err) => {
        dispatch(
          GET_CONTRACTS_FAIL({
            error: err.toString(),
          })
        );
      });
  };
};
