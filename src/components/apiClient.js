// src/apiClient.js
const API_BASE_URL = "http://localhost:4000"; // à adapter pour la prod

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include", // <-- IMPORTANT pour le cookie JWT
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  // Tu peux gérer les 401 ici si tu veux plus tard
  const contentType = res.headers.get("Content-Type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const message =
      data && data.message
        ? data.message
        : `Erreur API (${res.status}) sur ${path}`;
    throw new Error(message);
  }

  return data;
}
