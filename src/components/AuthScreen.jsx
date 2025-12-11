// src/AuthScreen.jsx
import React, { useState } from "react";
import { useAuth } from "./AuthContext";

export default function AuthScreen() {
  const { login, register, error, setError } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"

  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
  });

  function handleChange(e) {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (mode === "login") {
        await login({
          email: form.email,
          password: form.password,
        });
      } else {
        await register({
          email: form.email,
          password: form.password,
          displayName: form.displayName,
        });
      }
    } catch (err) {
      // l'erreur est déjà mise dans setError côté contexte
      console.error("Erreur auth :", err);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#1c1c1c",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          background: "rgba(255,248,220,0.95)",
          padding: "2rem",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "420px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          fontFamily: "Georgia, 'Times New Roman', serif",
        }}
      >
        <h1
          style={{
            textAlign: "center",
            marginBottom: "0.5rem",
            fontSize: "1.6rem",
          }}
        >
          Fiche Aria
        </h1>
        <p
          style={{
            textAlign: "center",
            marginBottom: "1.5rem",
            fontSize: "0.9rem",
            opacity: 0.8,
          }}
        >
          Connecte-toi pour créer et sauvegarder tes personnages.
        </p>

        <div
          style={{
            marginBottom: "1rem",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          <button
            type="button"
            onClick={() => setMode("login")}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "999px",
              cursor: "pointer",
              border: "none",
              background: mode === "login" ? "#8b4513" : "#d1d5db",
              color: mode === "login" ? "white" : "#111827",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            Connexion
          </button>

          <button
            type="button"
            onClick={() => setMode("register")}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "999px",
              cursor: "pointer",
              border: "none",
              background: mode === "register" ? "#8b4513" : "#d1d5db",
              color: mode === "register" ? "white" : "#111827",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div style={{ marginBottom: "0.75rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.25rem",
                  fontSize: "0.85rem",
                }}
              >
                Pseudo (nom affiché)
              </label>
              <input
                type="text"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.45rem 0.6rem",
                  borderRadius: "0.375rem",
                  border: "1px solid #d1d5db",
                  fontSize: "0.9rem",
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontSize: "0.85rem",
              }}
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.45rem 0.6rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
              required
            />
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <label
              style={{
                display: "block",
                marginBottom: "0.25rem",
                fontSize: "0.85rem",
              }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.45rem 0.6rem",
                borderRadius: "0.375rem",
                border: "1px solid #d1d5db",
                fontSize: "0.9rem",
              }}
              required
            />
          </div>

          {error && (
            <div
              style={{
                marginBottom: "0.75rem",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.375rem",
                background: "#b91c1c",
                color: "white",
                fontSize: "0.85rem",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.6rem",
              borderRadius: "999px",
              border: "none",
              marginTop: "0.25rem",
              background: "#8b4513",
              color: "white",
              fontWeight: "600",
              cursor: "pointer",
              fontSize: "0.95rem",
            }}
          >
            {mode === "login" ? "Se connecter" : "Créer mon compte"}
          </button>
        </form>
      </div>
    </div>
  );
}
