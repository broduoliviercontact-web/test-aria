// src/components/PhraseDeSynthese.jsx
import React from "react";
import "./phrasedeSynthese.css";
import PhraseBloc from "./PhraseBloc";

export default function PhraseDeSynthese({
  phraseGenial,
  setPhraseGenial,
  phraseSociete,
  setPhraseSociete,
}) {
  return (
    <section className="phrase-synthese-section">
      <h2 className="phrase-synthese-title">PHRASE DE SYNTHÈSE</h2>

      <div className="phrase-synthese-grid">
        <PhraseBloc
          title="Je suis génial parce que…"
          value={phraseGenial}
          onChange={setPhraseGenial}
        />

        <PhraseBloc
          title="Mais la société a des problèmes avec moi parce que…"
          value={phraseSociete}
          onChange={setPhraseSociete}
        />
      </div>
    </section>
  );
}
