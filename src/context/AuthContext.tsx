// src/context/AuthContext.tsx

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import { getUserData } from "../services/authService";
import { User } from "../types";

interface AuthContextType {
  userId: string | null;
  userData: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  userId: null,
  userData: null,
  loading: true
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUserId(firebaseUser.uid);
        const data = await getUserData(firebaseUser.uid);
        setUserData(data);
      } else {
        setUserId(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ userId, userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);