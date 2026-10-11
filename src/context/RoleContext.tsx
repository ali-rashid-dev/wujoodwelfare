"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useSyncExternalStore,
} from "react";
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
  userId,
  initialRole = "volunteer",
}: {
  children: React.ReactNode;
  userId: string;
  initialRole?: Role;
}) {
  const router = useRouter();
  const storageKey = `wujood_active_role:${userId}`;

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      const onStorageChange = (event: StorageEvent) => {
        if (event.key === storageKey) onStoreChange();
      };
      window.addEventListener("storage", onStorageChange);
      window.addEventListener("wujood-role-change", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStorageChange);
        window.removeEventListener("wujood-role-change", onStoreChange);
      };
    },
    [storageKey]
  );
  const getSnapshot = useCallback((): Role => {
    const saved = localStorage.getItem(storageKey);
    return saved === "admin" || saved === "volunteer" ? saved : initialRole;
  }, [initialRole, storageKey]);
  const getServerSnapshot = useCallback(() => initialRole, [initialRole]);
  const role = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setRole = (newRole: Role) => {
    localStorage.setItem(storageKey, newRole);
    window.dispatchEvent(new Event("wujood-role-change"));
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
