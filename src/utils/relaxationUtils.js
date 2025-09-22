/**
 * Utilities for relaxation policies
 */

// Create initial main relaxation object
export function createInitialRelaxations(typesArr, categoriesArr) {
  return typesArr.reduce((acc, type) => {
    acc[type] = categoriesArr.reduce((catAcc, cat) => {
      catAcc[cat] = 0;
      return catAcc;
    }, {});
    return acc;
  }, {});
}

// Create empty special relaxation
export function createEmptySpecial(name = "", typesArr = [], categoriesArr = []) {
  return {
    name,
    mode: "flat", // default mode
    flat: 0,
    values: categoriesArr.reduce((acc, c) => ({ ...acc, [c]: 0 }), {}),
  };
}

// Load saved relaxation payload and map to current master data
export function loadFromPayload(payload, typesArr, categoriesArr) {
  const mainDefaults = createInitialRelaxations(typesArr, categoriesArr);
  const main = { ...mainDefaults };

  if (payload?.main) {
    for (const t of Object.keys(payload.main)) {
      if (!typesArr.includes(t)) continue;
      for (const c of Object.keys(payload.main[t])) {
        if (!categoriesArr.includes(c)) continue;
        main[t][c] = Number(payload.main[t][c] ?? 0);
      }
    }
  }

  const specialsByType = typesArr.reduce((acc, t) => ({ ...acc, [t]: [] }), {});
  if (payload?.specialsByType) {
    for (const t of Object.keys(payload.specialsByType)) {
      if (!typesArr.includes(t)) continue;
      const arr = payload.specialsByType[t] ?? [];
      specialsByType[t] = arr.map(sRaw => {
        const name = sRaw.name ?? "";
        const mode = sRaw.mode === "category" ? "category" : "flat";
        const flat = Number(sRaw.flat ?? 0);
        const filteredValues = {};
        categoriesArr.forEach(c => {
          filteredValues[c] = Number(sRaw.values?.[c] ?? 0);
        });
        return { name, mode, flat, values: filteredValues };
      });
    }
  }

  return { main, specialsByType };
}

// Calculate total allocated vacancies
export function calculateAllocated(mainObj, specialsObj) {
  let total = 0;
  Object.keys(mainObj).forEach(type => {
    Object.values(mainObj[type]).forEach(v => total += Number(v || 0));
  });

  Object.keys(specialsObj).forEach(type => {
    specialsObj[type].forEach(sp => {
      if (sp.mode === "flat") total += Number(sp.flat || 0);
      else if (sp.mode === "category")
        Object.values(sp.values).forEach(v => total += Number(v || 0));
    });
  });

  return total;
}
