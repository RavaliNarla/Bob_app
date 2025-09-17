// src/utils/relaxationUtils.js
export const CATEGORY_LIST = ["SC", "ST", "OBC", "EWS", "GEN"];
export const TYPES = ["Age", "Vacancy", "Education", "Experience", "Marks","Marks111"];

export function createInitialRelaxations() {
  return TYPES.reduce((acc, type) => {
    acc[type] = CATEGORY_LIST.reduce((catAcc, cat) => {
      catAcc[cat] = 0;
      return catAcc;
    }, {});
    return acc;
  }, {});
}

/**
 * Create an empty special object for a given name.
 * perType contains entries for each type with mode/flat/values.
 */
export function createEmptySpecial(name = "") {
  const perType = TYPES.reduce((acc, t) => {
    acc[t] = {
      mode: "flat", // "flat" or "category"
      flat: 0,
      values: CATEGORY_LIST.reduce((cAcc, c) => ({ ...cAcc, [c]: 0 }), {}),
    };
    return acc;
  }, {});
  return { name, perType };
}

/**
 * loadFromPayload
 * Accepts payload saved in DB (the shape you posted) and returns:
 * { main, specialsByType } suitable to set into React state.
 *
 * main => { Age: {SC:0,...}, ... }
 * specialsByType => { Age: [ {name, mode, flat, values}, ... ], ... }
 */
export function loadFromPayload(payload) {
  const mainDefaults = createInitialRelaxations();
  const main = { ...mainDefaults };

  if (payload && payload.main && typeof payload.main === "object") {
    for (const t of TYPES) {
      if (payload.main[t] && typeof payload.main[t] === "object") {
        for (const c of CATEGORY_LIST) {
          const v = payload.main[t][c];
          main[t][c] = typeof v === "number" ? v : Number(v ?? 0);
        }
      }
    }
  }

  const specialsByType = TYPES.reduce((acc, t) => ({ ...acc, [t]: [] }), {});
  if (payload && payload.specialsByType && typeof payload.specialsByType === "object") {
    for (const t of TYPES) {
      const arr = Array.isArray(payload.specialsByType[t]) ? payload.specialsByType[t] : [];
      specialsByType[t] = arr.map((sRaw) => {
        // sRaw might be { name, mode, flat, values } OR might have perType object
        const name = sRaw.name ?? "";
        const mode = sRaw.mode === "category" ? "category" : "flat";
        const flat = Number(sRaw.flat ?? 0);
        const values = CATEGORY_LIST.reduce((acc, c) => {
          acc[c] = Number((sRaw.values && sRaw.values[c]) ?? 0);
          return acc;
        }, {});
        // If sRaw has perType and perType[t], prefer that (backwards compat)
        if (sRaw.perType && sRaw.perType[t]) {
          const per = sRaw.perType[t];
          return {
            name,
            mode: per.mode === "category" ? "category" : mode,
            flat: Number(per.flat ?? flat),
            values: CATEGORY_LIST.reduce((acc, c) => {
              acc[c] = Number((per.values && per.values[c]) ?? values[c]);
              return acc;
            }, {}),
          };
        }
        return { name, mode, flat, values };
      });
    }
  }

  return { main, specialsByType };
}
