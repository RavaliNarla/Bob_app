/**
 * Utilities for relaxation policies
 */

// Create initial main relaxation object
export function createInitialRelaxations(typesArr, categoriesArr, types = []) {
  return typesArr.reduce((acc, type) => {
    const typeInfo = types.find(t => t.name === type);
    const defaultValue = typeInfo?.input === 'text' ? '' : 0;
    
    acc[type] = categoriesArr.reduce((catAcc, cat) => {
      catAcc[cat] = defaultValue;
      return catAcc;
    }, {});
    return acc;
  }, {});
}

// Create empty special relaxation
export function createEmptySpecial(name = "", typeName = "", categoriesArr = [], types = []) {
  const typeInfo = types.find(t => t.name === typeName);
  const isText = typeInfo?.input === "text";

  return {
    name,
    mode: "flat",
    flat: isText ? "" : 0,
    values: categoriesArr.reduce((acc, c) => ({ ...acc, [c]: isText ? "" : 0 }), {}),
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

  // Only consider Vacancy from mainObj
  if (mainObj["Vacancies"]) {
    Object.values(mainObj["Vacancies"]).forEach(v => total += Number(v || 0));
  }

  // Only consider Vacancy specials
  if (specialsObj["Vacancies"]) {
    specialsObj["Vacancies"].forEach(sp => {
      if (sp.mode === "flat") total += Number(sp.flat || 0);
      else if (sp.mode === "category") {
        Object.values(sp.values).forEach(v => total += Number(v || 0));
      }
    });
  }

  return total;
}