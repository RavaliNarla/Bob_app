import React, { useState, useEffect } from "react";
import { Button, Form, Table, Card } from "react-bootstrap";
import { CATEGORY_LIST, TYPES } from "../utils/relaxationUtils";
import "./Relaxation.css";

// Special categories data
const SPECIAL_CATEGORIES = [
  { special_category_id: 1, special_category_code: "PWD", special_category_name: "Persons with Disability", special_category_desc: "Reserved for PWD" },
  { special_category_id: 2, special_category_code: "EXS", special_category_name: "Ex-Servicemen", special_category_desc: "Reserved for Ex-Servicemen" },
  { special_category_id: 7, special_category_code: "SPORTS", special_category_name: "Sports Quota", special_category_desc: "Reserved for Outstanding Sportspersons" },
  { special_category_id: 8, special_category_code: "MARTYRS", special_category_name: "Children/Family of Martyrs", special_category_desc: "Reserved for Children/Family of Martyrs" },
  { special_category_id: 10, special_category_code: "DEF", special_category_name: "Defense Personnel Quota", special_category_desc: "Reserved for Defense Personnel Quota" },
];

function createEmptySpecial(name = "", mode = "flat") {
  return {
    name,
    mode,
    flat: 0,
    values: CATEGORY_LIST.reduce((acc, c) => ({ ...acc, [c]: 0 }), {}),
  };
}

function createInitialMain() {
  return TYPES.reduce((acc, t) => {
    acc[t] = CATEGORY_LIST.reduce((cAcc, c) => ({ ...cAcc, [c]: 0 }), {});
    return acc;
  }, {});
}

function createInitialSpecials() {
  return TYPES.reduce((acc, t) => ({ ...acc, [t]: [] }), {});
}

// 🔹 Central calculation (Vacancy only)
const calculateAllocated = (main, specialsByType) => {
  let total = 0;

  // Main vacancies
  for (let cat of CATEGORY_LIST) {
    total += Number(main["Vacancy"][cat] || 0);
  }

  // Special vacancies
  for (let sp of specialsByType["Vacancy"]) {
    if (sp.mode === "flat") {
      total += Number(sp.flat || 0);
    } else if (sp.mode === "category") {
      for (let cat of CATEGORY_LIST) {
        total += Number(sp.values[cat] || 0);
      }
    }
  }

  return total;
};

const Relaxationnew = ({ vacancies = 10, onRelaxationSave }) => {
  const [active, setActive] = useState(TYPES[0]);
  const [main, setMain] = useState(createInitialMain());
  const [specialsByType, setSpecialsByType] = useState(createInitialSpecials());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allocatedVacancies, setAllocatedVacancies] = useState(0);

  const availableCategories = SPECIAL_CATEGORIES.filter(
    (cat) =>
      !specialsByType[active].some((s) => s.name === cat.special_category_name)
  );

  const getRemainingVacancies = () => {
    if (active !== "Vacancy") return "-";
    return Math.max(0, vacancies - allocatedVacancies);
  };

  // 🔹 Run allocation only in Vacancy tab
  useEffect(() => {
    if (active === "Vacancy") {
      const totalAllocated = calculateAllocated(main, specialsByType);
      setAllocatedVacancies(totalAllocated);
    }
  }, [main, specialsByType, active]);

  // 🔹 Handle main input change
  const handleMainChange = (type, cat, val) => {
    if (type === "Vacancy") {
      setMain((prev) => ({
        ...prev,
        [type]: { ...prev[type], [cat]: Number(val) || 0 },
      }));
    } else {
      setMain((prev) => ({
        ...prev,
        [type]: { ...prev[type], [cat]: val }, // text/raw values
      }));
    }
  };

  // 🔹 Update special
  const updateSpecial = (type, idx, field, value, cat = null) => {
    const arr = [...specialsByType[type]];
    const sp = { ...arr[idx] };

    if (field === "mode") sp.mode = value;
    if (field === "flat") sp.flat = Number(value) || 0;
    if (field === "values" && cat)
      sp.values = { ...sp.values, [cat]: Number(value) || 0 };

    arr[idx] = sp;

    const newSpecials = { ...specialsByType, [type]: arr };

    if (type === "Vacancy") {
      const newAllocated = calculateAllocated(main, newSpecials);
      if (newAllocated > vacancies) {
        alert("Allocation exceeds total vacancies!");
        return;
      }
      setAllocatedVacancies(newAllocated);
    }

    setSpecialsByType(newSpecials);
  };

  const removeSpecial = (type, idx) => {
    const newSpecials = {
      ...specialsByType,
      [type]: specialsByType[type].filter((_, i) => i !== idx),
    };

    setSpecialsByType(newSpecials);

    if (type === "Vacancy") {
      setAllocatedVacancies(calculateAllocated(main, newSpecials));
    }
  };

  const handleSave = async () => {
    const payload = { main, specialsByType };
    // console.log("RELAXATION PAYLOAD:", payload);
    alert("Saved!");
    if (onRelaxationSave) onRelaxationSave(payload);
  };

  return (
    <div className="relaxation-container p-4">
      {/* Vacancies Info */}
      <div className="vacancies-info mb-4 p-3 bg-light rounded">
        <div
          className="d-flex justify-content-between align-items-center"
          style={{ float: "right" }}
        >
          <div>
            <p className="mb-0">
              Total Vacancies: <strong>{vacancies}</strong>
            </p>
            <p className="mb-0">
              Allocated:{" "}
              <strong>{active === "Vacancy" ? allocatedVacancies : "-"}</strong>
            </p>
            <p className="mb-0">
              Remaining:{" "}
              <strong>{active === "Vacancy" ? getRemainingVacancies() : "-"}</strong>
            </p>
          </div>
          {active === "Vacancy" && getRemainingVacancies() < 0 && (
            <div className="text-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>
              Warning: You have overallocated vacancies!
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-4">
        {TYPES.map((t) => (
          <Button
            key={t}
            className={`tab-button me-2 ${active === t ? "active" : ""}`}
            onClick={() => setActive(t)}
          >
            {t}
          </Button>
        ))}
      </div>

      {/* Tab Panel */}
      <Card className="mb-4 relaxation-card">
        <Card.Header className="card-header">{active} Relaxation</Card.Header>
        <Card.Body>
          {/* Main category table */}
          <Table bordered className="mb-4 relaxation-table">
            <thead>
              <tr>
                {CATEGORY_LIST.map((c) => (
                  <th key={c} className="text-center table-header">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {CATEGORY_LIST.map((c) => (
                  <td key={c} className="p-2">
                    <Form.Control
                      type={active === "Education" ? "text" : "number"}
                      value={main[active][c]}
                      onChange={(e) => handleMainChange(active, c, e.target.value)}
                      className="text-center form-input"
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>

          <h5 className="section-title">Special Categories</h5>

          <div className="d-flex gap-2 mb-3">
            <Form.Select
              value={selectedCategory}
              onChange={(e) => {
                const categoryName = e.target.value;
                setSelectedCategory(categoryName);

                if (categoryName) {
                  const category = SPECIAL_CATEGORIES.find(
                    (cat) => cat.special_category_name === categoryName
                  );
                  if (category) {
                    const sp = createEmptySpecial(
                      category.special_category_name,
                      "flat"
                    );
                    const newSpecials = {
                      ...specialsByType,
                      [active]: [...specialsByType[active], sp],
                    };
                    setSpecialsByType(newSpecials);

                    if (active === "Vacancy") {
                      setAllocatedVacancies(calculateAllocated(main, newSpecials));
                    }
                    setSelectedCategory("");
                  }
                }
              }}
              className="form-select"
              style={{ width: "300px" }}
            >
              <option value="">Select Special Category</option>
              {availableCategories.map((cat) => (
                <option
                  key={cat.special_category_id}
                  value={cat.special_category_name}
                >
                  {cat.special_category_name}
                </option>
              ))}
            </Form.Select>
          </div>

          {specialsByType[active].length === 0 ? (
            <p className="text-muted">No special categories added yet</p>
          ) : (
            <div className="table-responsive">
              <Table bordered className="relaxation-table">
                <thead>
                  <tr>
                    <th className="table-header">Name</th>
                    <th className="table-header">Mode</th>
                    {CATEGORY_LIST.map((c) => (
                      <th key={c} className="table-header">
                        {c}
                      </th>
                    ))}
                    <th className="table-header">Flat</th>
                    <th className="table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {specialsByType[active].map((s, i) => (
                    <tr key={i}>
                      <td>{s.name}</td>
                      <td>
                        <Form.Select
                          value={s.mode}
                          onChange={(e) =>
                            updateSpecial(active, i, "mode", e.target.value)
                          }
                          className="form-select"
                        >
                          <option value="flat">Flat</option>
                          <option value="category">Category-wise</option>
                        </Form.Select>
                      </td>
                      {CATEGORY_LIST.map((c) => (
                        <td key={c}>
                          {s.mode === "category" ? (
                            <Form.Control
                              type="number"
                              value={s.values[c]}
                              onChange={(e) =>
                                updateSpecial(
                                  active,
                                  i,
                                  "values",
                                  e.target.value,
                                  c
                                )
                              }
                              className="form-input"
                            />
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      ))}
                      <td>
                        {s.mode === "flat" ? (
                          <Form.Control
                            type="number"
                            value={s.flat}
                            onChange={(e) =>
                              updateSpecial(active, i, "flat", e.target.value)
                            }
                            className="form-input"
                          />
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        <Button
                          className="danger-button"
                          size="sm"
                          onClick={() => removeSpecial(active, i)}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end">
        <Button className="save-button" onClick={handleSave}>
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default Relaxationew;
