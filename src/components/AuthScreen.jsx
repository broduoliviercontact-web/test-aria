import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import "./AuthScreen.css"; // optionnel si tu veux styliser

export default function AuthScreen() {
  const { login, register, error, setError } = useAuth();
  const [mode, setMode] = useState("login"); // "login" ou "register"
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (mode === "login") {
      await login({ email, password });
    } else {
      await register({ email, password, displayName });
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Aria Sheet</h1>
        <h2>{mode === "login" ? "Connexion" : "Créer un compte"}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="auth-field">
              <label>Nom de joueur</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex : Zuber"
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
            />
          </div>

          <div className="auth-field">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 8 caractères"
              required
            />
          </div>

          {error && <div className="auth-error">{error}</div>}

          <button type="submit" className="auth-submit">
            {mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <button
          type="button"
          className="auth-switch"
          onClick={() =>
            setMode((m) => (m === "login" ? "register" : "login"))
          }
        >
          {mode === "login"
            ? "Pas de compte ? Créer un compte"
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </div>
  );
}
