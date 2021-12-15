import React from "react";
import { useSelector } from "react-redux";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { JobsScreen } from "../screens/Jobs";
import { ContractsScreen } from "../screens/Contracts";
import { LoginScreen } from "../screens/Login";
import { ErrorScreen } from "../screens/ErrorScreen";

export const Navigator = () => {
  const { authenticated } = useSelector((state) => state.user);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginScreen />} />
        <Route
          path="jobs"
          element={
            authenticated ? (
              <JobsScreen />
            ) : (
              <ErrorScreen message="401 - You don't have permissions to visit this page" />
            )
          }
        />
        <Route
          path="contracts"
          element={
            authenticated ? (
              <ContractsScreen />
            ) : (
              <ErrorScreen message="401 - You don't have permissions to visit this page" />
            )
          }
        />
        <Route path="*" element={<ErrorScreen />} />
      </Routes>
    </BrowserRouter>
  );
};
