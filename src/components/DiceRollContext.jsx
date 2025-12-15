import React, { createContext, useContext, useMemo, useState } from "react";

/**
 * rollRequest:
 *  {
 *    id: string,
 *    mode: "special",
 *    entityKey: string,    // id de la row (specialCompetence.id)
 *    label: string,        // nom compétence
 *    target: number,       // score %
 *    notation: string,     // ex: "d100"
 *  }
 *
 * resultsByKey:
 *  {
 *    [entityKey]: {
 *      total: number,
 *      rolls: number[],
 *      target: number,
 *      success: boolean,
 *      label: string,
 *      at: number
 *    }
 *  }
 */

const DiceRollContext = createContext(null);

export function DiceRollProvider({ children }) {
  const [rollRequest, setRollRequest] = useState(null);
  const [resultsByKey, setResultsByKey] = useState({});

  const requestRoll = (payload) => {
    const id =
      (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
      `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    setRollRequest({ id, ...payload });
  };

  const setRollResult = (entityKey, result) => {
    setResultsByKey((prev) => ({ ...prev, [entityKey]: result }));
  };

  const value = useMemo(
    () => ({ rollRequest, resultsByKey, requestRoll, setRollResult }),
    [rollRequest, resultsByKey]
  );

  return <DiceRollContext.Provider value={value}>{children}</DiceRollContext.Provider>;
}

export function useDiceRoll() {
  const ctx = useContext(DiceRollContext);
  if (!ctx) {
    throw new Error("useDiceRoll must be used within DiceRollProvider");
  }
  return ctx;
}
