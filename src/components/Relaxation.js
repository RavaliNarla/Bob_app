import React, { useState, useEffect } from "react";
import { Button, Form, Table, Card } from 'react-bootstrap';
import { CATEGORY_LIST, TYPES } from "../utils/relaxationUtils";
import "./Relaxation.css";

// Special categories data
const SPECIAL_CATEGORIES = [
  {
    "special_category_id": 1,
    "special_category_code": "PWD",
    "special_category_name": "Persons with Disability",
    "special_category_desc": "Reserved for PWD"
  },
  {
    "special_category_id": 2,
    "special_category_code": "EXS",
    "special_category_name": "Ex-Servicemen",
    "special_category_desc": "Reserved for Ex-Servicemen"
  },
  {
    "special_category_id": 7,
    "special_category_code": "SPORTS",
    "special_category_name": "Sports Quota",
    "special_category_desc": "Reserved for Outstanding Sportspersons"
  },
  {
    "special_category_id": 8,
    "special_category_code": "MARTYRS",
    "special_category_name": "Children/Family of Martyrs",
    "special_category_desc": "Reserved for Children/Family of Martyrs"
  },
  {
    "special_category_id": 10,
    "special_category_code": "DEF",
    "special_category_name": "Defense Personnel Quota",
    "special_category_desc": "Reserved for Defense Personnel Quota"
  }
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

const Relaxation = () => {
  const [active, setActive] = useState(TYPES[0]);
  const [main, setMain] = useState(createInitialMain());
  const [specialsByType, setSpecialsByType] = useState(createInitialSpecials());
  const [selectedCategory, setSelectedCategory] = useState("");
  const [newMode, setNewMode] = useState("flat");

  const availableCategories = SPECIAL_CATEGORIES.filter(
    cat => !specialsByType[active].some(s => s.name === cat.special_category_name)
  );

  const handleMainChange = (type, cat, val) => {
    const n = Number(val) || 0;
    setMain((prev) => ({ ...prev, [type]: { ...prev[type], [cat]: n } }));
  };

  const addSpecial = (type) => {
    if (!selectedCategory) return alert("Please select a special category");
    
    const category = SPECIAL_CATEGORIES.find(cat => 
      cat.special_category_name === selectedCategory
    );
    
    const sp = createEmptySpecial(category.special_category_name, newMode);
    setSpecialsByType(prev => ({ 
      ...prev, 
      [type]: [...prev[type], sp] 
    }));
    setSelectedCategory("");
    setNewMode("flat");
  };

  const updateSpecial = (type, idx, field, value, cat = null) => {
    setSpecialsByType((prev) => {
      const arr = [...prev[type]];
      const sp = { ...arr[idx] };
      if (field === "name") sp.name = value;
      if (field === "mode") sp.mode = value;
      if (field === "flat") sp.flat = Number(value) || 0;
      if (field === "values" && cat)
        sp.values = { ...sp.values, [cat]: Number(value) || 0 };
      arr[idx] = sp;
      return { ...prev, [type]: arr };
    });
  };

  const removeSpecial = (type, idx) => {
    setSpecialsByType((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    const payload = { main, specialsByType };
    console.log("RELAXATION PAYLOAD:", payload);
    alert("Saved!");
  };

  return (
    <div className="relaxation-container p-4">
      {/* Tabs */}
      <div className="tabs mb-4">
        {TYPES.map((t) => (
          <Button
            key={t}
            className={`tab-button me-2 ${active === t ? 'active' : ''}`}
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
                  <th key={c} className="text-center table-header">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                {CATEGORY_LIST.map((c) => (
                  <td key={c} className="p-2">
                    <Form.Control
                      type="number"
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
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="form-select"
              style={{ width: '300px' }}
            >
              <option value="">Select Special Category</option>
              {availableCategories.map(cat => (
                <option key={cat.special_category_id} value={cat.special_category_name}>
                  {cat.special_category_name}
                </option>
              ))}
            </Form.Select>
            <Form.Select
              value={newMode}
              onChange={(e) => setNewMode(e.target.value)}
              className="form-select"
              style={{ width: '150px' }}
            >
              <option value="flat">Flat</option>
              <option value="category">Category-wise</option>
            </Form.Select>
            <Button 
              className="primary-button"
              onClick={() => addSpecial(active)}
              disabled={!selectedCategory}
            >
              Add
            </Button>
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
                      <th key={c} className="table-header">{c}</th>
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

export default Relaxation;