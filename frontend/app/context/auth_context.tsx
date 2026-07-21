"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const PUBLIC_PAGES = ["/", "/auth/login", "/auth/sign_up"];

interface Patient {
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  language: string;
  allergies: string[];
  medications: string[];
  conditions: string[];
}

interface Doctor {
  first_name: string;
  last_name: string;
  phone: string;
  gender: string;
  specialization: string;
  yearsExperience: number;
  location: string;
  bio: string;
  licenseNumber: string;
  hospital?: { name: string };
  rating: number;
  status: string;
  available: boolean;
  totalRatings: number;
}

interface Hospital {
  name: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  role: string;
  patient?: Patient;
  doctor?: Doctor;
  hospital?: Hospital;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  auth_fetch: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, set_user] = useState<User | null>(null);
  const [loading, set_loading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } finally {
      set_user(null);
      router.push("/auth/login");
    }
  }, [router]);

  const auth_fetch = useCallback(
    async (endpoint: string, options?: RequestInit): Promise<Response> => {
      let res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
      });

      if (res.status == 401) {
        const refresh_res = await fetch(`${API_URL}/api/auth/refresh_token`, {
          method: "POST",
          credentials: "include",
        });

        if (!refresh_res.ok) {
          await logout();
          return res;
        }
        return fetch(`${API_URL}${endpoint}`, {
          ...options,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...options?.headers,
          },
        });
      } else {
        return res;
      }
    },
    [logout],
  );

  const refresh_user = useCallback(async () => {
    try {
      const res = await auth_fetch("/api/auth/me");
      const data = await res.json();
      if (res.ok) {
        set_user(data.user);
      } else {
        set_user(null);
      }
    } catch (err) {
      console.log(err);
    }
  }, [auth_fetch]);

  useEffect(() => {
    const auth = async () => {
      if (!PUBLIC_PAGES.includes(pathname) && !user) {
        await refresh_user();
      }
      set_loading(false);
    };
    auth();
  }, [pathname, user, refresh_user]);

  useEffect(() => {
    if (!loading && !user && !PUBLIC_PAGES.includes(pathname)) {
      router.push("/auth/login");
    }
  }, [loading, user, pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        auth_fetch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
