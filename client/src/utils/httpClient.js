import axios from "axios";

export const getHttpClient = (id = 0) => {
  const client = axios.create({
    baseURL: "http://localhost:3001",
  });

  client.defaults.headers.common["profile_id"] = id;

  return client;
};
