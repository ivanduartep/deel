import { combineReducers } from "redux";
import { userReducer } from "./user";
import { jobReducer } from "./job";
import { contractReducer } from "./contract";

export const rootReducer = combineReducers({
  user: userReducer,
  job: jobReducer,
  contract: contractReducer,
});
