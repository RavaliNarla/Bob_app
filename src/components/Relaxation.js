import React, { useState, useEffect } from "react";
import { Button, Form, Table, Card } from "react-bootstrap";
import { CATEGORY_LIST, TYPES } from "../utils/relaxationUtils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
// import { OverlayTrigger, Popover, Tooltip } from 'react-bootstrap';
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
    flat: "",
    values: CATEGORY_LIST.reduce((acc, c) => ({ ...acc, [c]: "" }), {}),
  };
}

function createInitialMain() {
  return TYPES.reduce((acc, t) => {
    acc[t] = CATEGORY_LIST.reduce((cAcc, c) => ({ ...cAcc, [c]: "" }), {});
    return acc;
  }, {});
}

function createInitialSpecials() {
  return TYPES.reduce((acc, t) => ({ ...acc, [t]: [] }), {});
}

const calculateAllocated = (main, specialsByType) => {
  let total = 0;
  for (let cat of CATEGORY_LIST) {
    total += Number(main["Vacancy"][cat] || 0);
  }
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

const Relaxation = ({ onRelaxationSave, selectedPolicy }) => {
  const [active, setActive] = useState(TYPES[0]);
  const [main, setMain] = useState(createInitialMain());
  const [specialsByType, setSpecialsByType] = useState(createInitialSpecials());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allocatedVacancies, setAllocatedVacancies] = useState(0);
  const [isDirty, setIsDirty] = useState(false);

  const availableCategories = SPECIAL_CATEGORIES.filter(
    (cat) => !specialsByType[active].some((s) => s.name === cat.special_category_name)
  );

  // Load or reset form when policy changes
  useEffect(() => {
    if (selectedPolicy?.relaxation) {
      const { main: policyMain, specialsByType: policySpecials, allocatedVacancies } =
        selectedPolicy.relaxation;

      const mergedMain = { ...createInitialMain(), ...policyMain };
      const mergedSpecials = { ...createInitialSpecials(), ...policySpecials };

      setMain(mergedMain);
      setSpecialsByType(mergedSpecials);
      setAllocatedVacancies(allocatedVacancies || calculateAllocated(mergedMain, mergedSpecials));
      setIsDirty(false); // reset dirty flag when switching
    } else {
      setMain(createInitialMain());
      setSpecialsByType(createInitialSpecials());
      setAllocatedVacancies(0);
      setIsDirty(false);
    }
  }, [selectedPolicy]);

  // Handlers
  const handleMainChange = (type, cat, val) => {
    setMain((prev) => ({
      ...prev,
      [type]: { ...prev[type], [cat]: val },
    }));
    setIsDirty(true);
  };

  const updateSpecial = (type, idx, field, value, cat = null) => {
    const arr = [...specialsByType[type]];
    const sp = { ...arr[idx] };

    if (field === "mode") sp.mode = value;
    if (field === "flat") sp.flat = value;
    if (field === "values" && cat) sp.values = { ...sp.values, [cat]: value };

    arr[idx] = sp;

    const updatedSpecials = { ...specialsByType, [type]: arr };
    setSpecialsByType(updatedSpecials);

    if (type === "Vacancy") {
      setAllocatedVacancies(calculateAllocated(main, updatedSpecials));
    }
    setIsDirty(true);
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
    setIsDirty(true);
  };

  const handleSave = () => {
    const payload = {
      relaxation: {
        main,
        specialsByType,
        allocatedVacancies,
      },
    };
    if (onRelaxationSave) onRelaxationSave(payload);
    setIsDirty(false);
  };

  return (
    <div className="relaxation-container p-4">
      {/* Vacancies Info */}
      {/* <div className="vacancies-info mb-4 p-3 bg-light rounded">
        <p className="mb-0">
          Total Vacancies: <strong>{allocatedVacancies}</strong>
        </p>
      </div> */}

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
                    const sp = createEmptySpecial(category.special_category_name, "flat");
                    const newSpecials = {
                      ...specialsByType,
                      [active]: [...specialsByType[active], sp],
                    };
                    setSpecialsByType(newSpecials);

                    if (active === "Vacancy") {
                      setAllocatedVacancies(calculateAllocated(main, newSpecials));
                    }
                    setSelectedCategory("");
                    setIsDirty(true);
                  }
                }
              }}
              className="form-select"
              style={{ width: "300px" }}
            >
              <option value="">Select Special Category</option>
              {availableCategories.map((cat) => (
                <option key={cat.special_category_id} value={cat.special_category_name}>
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
                          onChange={(e) => updateSpecial(active, i, "mode", e.target.value)}
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
                                updateSpecial(active, i, "values", e.target.value, c)
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
                            onChange={(e) => updateSpecial(active, i, "flat", e.target.value)}
                            className="form-input"
                          />
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                      <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => removeSpecial(active, i)}
                          title="Remove"
                        >
                          <FontAwesomeIcon icon={faTrash} />
                        </Button>
                        {/* <OverlayTrigger placement="top" overlay={<Tooltip>Delete Requisition</Tooltip>}>
                          <FontAwesomeIcon
                            icon={faTrash}
                            style={{ cursor: 'pointer' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeSpecial(active, i);
                            }}
                          />
                        </OverlayTrigger> */}
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
        <Button className="save-button" onClick={handleSave} disabled={!isDirty}>
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

export default Relaxation;
