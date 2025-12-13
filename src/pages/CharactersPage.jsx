import React from "react";
import MyCharacters from "../components/MyCharacters";

export default function MyCharactersPage({
  user,
  onBackToHome,
  onCreateNew,
  onLoadCharacter,
}) {
  return (
    <MyCharacters
      user={user}
      onBackToHome={onBackToHome}
      onCreateNew={onCreateNew}
      onLoadCharacter={onLoadCharacter}
    />
  );
}
