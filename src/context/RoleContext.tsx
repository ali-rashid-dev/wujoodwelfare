"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Role = "admin" | "volunteer";

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  isAdmin: boolean;
  isVolunteer: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({
  children,
  initialRole = "volunteer",
}: {
  children: React.ReactNode;
  initialRole?: Role;
}) {
  const router = useRouter();
  const [role, setRoleState] = useState<Role>(initialRole);

  useEffect(() => {
    // Prefer localStorage preview override, fall back to DB role
    const saved = localStorage.getItem("wujood_active_role") as Role | null;
    if (saved === "admin" || saved === "volunteer") {
      setRoleState(saved);
    } else {
      setRoleState(initialRole);
    }
  }, [initialRole]);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem("wujood_active_role", newRole);
    toast.info(
      `Switched to ${newRole === "admin" ? "Admin" : "Volunteer"} Dashboard`
    );
    router.refresh();
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isAdmin: role === "admin",
        isVolunteer: role === "volunteer",
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
