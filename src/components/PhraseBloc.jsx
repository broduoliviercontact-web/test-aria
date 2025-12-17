import React from "react";
import "./phrasebloc.css";

export default function PhraseBloc({ title, value, onChange }) {
  return (
    <div className="phrase-bloc">
      <h3 className="phrase-bloc-title">{title}</h3>
      <textarea
        className="phrase-bloc-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Écrivez ici..."
      />
    </div>
  );
}
