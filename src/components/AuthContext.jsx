// src/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, displayName }
  const [loading, setLoading] = useState(true); // chargement initial /auth/me
  const [error, setError] = useState(null);

  // Au chargement : vérifier si on a déjà un cookie valide
  useEffect(() => {
    let isMounted = true;

    async function fetchMe() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // <--- IMPORTANT pour le cookie JWT
        });

        if (!res.ok) {
          // Pas connecté ou token invalide
          if (isMounted) setUser(null);
          return;
        }

        const data = await res.json();
        if (isMounted) setUser(data);
      } catch (err) {
        if (isMounted) {
          console.error("Erreur /auth/me :", err);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchMe();

    return () => {
      isMounted = false;
    };
  }, []);

  async function login({ email, password }) {
    setError(null);
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data && data.message ? data.message : "Erreur de connexion";
      setError(message);
      throw new Error(message);
    }

    setUser(data); // { id, email, displayName }
    return data;
  }

  async function register({ email, password, displayName }) {
    setError(null);
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await res.json();

    if (!res.ok) {
      const message = data && data.message ? data.message : "Erreur d'inscription";
      setError(message);
      throw new Error(message);
    }

    setUser(data);
    return data;
  }

  async function logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.warn("Erreur /auth/logout :", err);
    }
    setUser(null);
  }

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  }
  return ctx;
}
