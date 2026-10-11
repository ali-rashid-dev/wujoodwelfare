"use client";

import React, { createContext, useContext } from "react";

type Role = "admin" | "volunteer";

interface RoleContextType {
  role: Role;
  isAdmin: boolean;
  isVolunteer: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({
  children,
  role,
  userId: _userId,
  initialRole,
}: {
  children: React.ReactNode;
  role?: Role;
  userId?: string;
  initialRole?: Role;
}) {
  const activeRole: Role = role || initialRole || "volunteer";

  return (
    <RoleContext.Provider
      value={{
        role: activeRole,
        isAdmin: activeRole === "admin",
        isVolunteer: activeRole === "volunteer",
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole must be used within a RoleProvider");
  return context;
}
