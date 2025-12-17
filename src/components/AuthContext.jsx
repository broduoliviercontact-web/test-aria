import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";
const AUTH_ME_TIMEOUT_MS = 4000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id, email, displayName }
  const [loading, setLoading] = useState(true); // chargement initial
  const [error, setError] = useState(null);

  // Au chargement de l'app : vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AUTH_ME_TIMEOUT_MS);

    async function fetchMe() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/auth/me`, {
          method: "GET",
          credentials: "include", // 🔑 important pour envoyer le cookie
          signal: controller.signal,
        });

        if (!res.ok) {
          setUser(null);
          return;
        }

        const data = await res.json();
        // data = { email, displayName, _id } (selon ton back)
        setUser({
          id: data._id || data.id,
          email: data.email,
          displayName: data.displayName,
        });
      } catch (err) {
        if (err?.name === "AbortError") {
          setUser(null);
          return;
        }
        console.error("Erreur /auth/me :", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    fetchMe();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // 👉 Inscription
  async function register({ email, password, displayName }) {
    try {
      setError(null);

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔑 pour recevoir le cookie
        body: JSON.stringify({ email, password, displayName }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Erreur d'inscription");
      }

      const data = await res.json();

      setUser({
        id: data.id,
        email: data.email,
        displayName: data.displayName,
      });
      return true;
    } catch (err) {
      console.error("Erreur register :", err);
      setError(err.message);
      return false;
    }
  }

  // 👉 Connexion
  async function login({ email, password }) {
    try {
      setError(null);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // 🔑 pour recevoir le cookie
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Identifiants invalides");
      }

      const data = await res.json();

      setUser({
        id: data.id,
        email: data.email,
        displayName: data.displayName,
      });
      return true;
    } catch (err) {
      console.error("Erreur login :", err);
      setError(err.message);
      return false;
    }
  }

  // 👉 Déconnexion
  async function logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Erreur logout :", err);
    } finally {
      setUser(null);
    }
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
    throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  }
  return ctx;
}
