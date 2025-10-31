import React from "react";
import { theme } from "../styles/theme";

interface AppShellProps {
  background: React.ReactNode;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ background, children }) => {
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: theme.colors.appBgSolid,
        color: theme.colors.textPrimary,
        fontFamily: theme.typography.ui,
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {background}
      </div>
      <main
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          padding: theme.layout.contentPadding,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
};
