// src/pages/CharactersPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import BookCharacterGallery from "../components/BookCharacterGallery";
import "./CharactersPage.css";

export default function MyCharactersPage({
  user,
  onBackToHome,
  onCreateNew,
  onLoadCharacter,
}) {
  const [myChars, setMyChars] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setMyChars([]);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/characters`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("fetch /characters failed");

        const data = await res.json();
        if (!cancelled) setMyChars(Array.isArray(data) ? data : []);
      } catch (e) {
        console.warn("Impossible de charger mes personnages:", e);
        if (!cancelled) setMyChars([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const myCharsForGallery = useMemo(() => {
    return (myChars || []).map((ch) => {
      const competenceOverrides = {};
      (ch.competences || []).forEach((c) => {
        if (c?.id && typeof c?.score === "number") competenceOverrides[c.id] = c.score;
      });

      const portrait =
        ch.portraitDataUrl ||
        ch.portraitUrl ||
        ch.portrait ||
        "/aria-background.webp";

      return {
        id: ch._id,
        name: ch.name || "Sans nom",
        description: ch.profession || "",
        frontImage: portrait,
        backImage: "/aria-background2.webp",

        age: typeof ch.age === "number" ? ch.age : undefined,
        profession: ch.profession || "",
        stats: Array.isArray(ch.stats) ? ch.stats : [],
        competenceOverrides,
        specialCompetences: Array.isArray(ch.specialCompetences) ? ch.specialCompetences : [],
        inventory: Array.isArray(ch.inventory) ? ch.inventory : [],
        weapons: Array.isArray(ch.weapons) ? ch.weapons : [],
        isAlchemist: !!ch.isAlchemist,
        isMage: !!(ch.magic?.isMage || ch.isMage),
        mageType: ch.magic?.mageType || "outsider",
        phraseGenial: ch.phraseGenial || "",
        phraseSociete: ch.phraseSociete || "",
      };
    });
  }, [myChars]);

const handleOpenInEditor = (template) => {
  try {
    // ✅ on garde juste l'id d'édition (utile pour PUT)
    localStorage.setItem("aria_edit_character_id", String(template?.id || ""));
    // ✅ IMPORTANT : on enlève le prefill sinon ça écrase les données du backend
    localStorage.removeItem("aria_prefill_character");
  } catch (e) {
    console.warn("localStorage error:", e);
  }

  if (template?.id) onLoadCharacter(template.id);
};



const handleDelete = async (ch) => {
  if (!ch?.id) return;

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/characters/${ch.id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) throw new Error("DELETE /characters/:id failed");

    // retire de la liste locale
    setMyChars((prev) => prev.filter((x) => x._id !== ch.id));

    // si on était en train d’éditer ce perso → cleanup
    const editingId = localStorage.getItem("aria_edit_character_id");
    if (editingId && String(editingId) === String(ch.id)) {
      localStorage.removeItem("aria_edit_character_id");
      localStorage.removeItem("aria_prefill_character");
    }
  } catch (e) {
    console.warn("Erreur suppression personnage:", e);
    alert("Impossible de supprimer le personnage.");
  }
};

  return (
    <div className="characters-page">
      <div className="characters-page__topbar">
        <button
          type="button"
          className="btn-secondary characters-page__btn"
          onClick={onBackToHome}
        >
          ← Retour à l’accueil
        </button>

        <button
          type="button"
          className="btn-primary characters-page__btn"
          onClick={onCreateNew}
        >
          + Nouveau personnage
        </button>
      </div>

      <div className="characters-page__content">
        <BookCharacterGallery
          title="Mes personnages"
          subtitle={
            loading
              ? "Chargement..."
              : "Survole pour retourner la carte. Clique pour ouvrir dans l’éditeur."
          }
          characters={myCharsForGallery}
          onOpenInEditor={handleOpenInEditor}
          itemsPerPage={4}
            onDeleteCharacter={handleDelete}
  canDeleteCharacter={() => true}

        />
      </div>
    </div>
  );
}
