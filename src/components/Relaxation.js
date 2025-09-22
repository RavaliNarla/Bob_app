import React, { useState, useEffect } from "react";
import { Button, Form, Table, Card } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { apiService } from "../services/apiService";
import { createInitialRelaxations, createEmptySpecial, calculateAllocated } from "../utils/relaxationUtils";

const Relaxation = ({ onRelaxationSave, selectedPolicy }) => {
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [specialCategories, setSpecialCategories] = useState([]);
  const [main, setMain] = useState({});
  const [specialsByType, setSpecialsByType] = useState({});
  const [active, setActive] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [allocatedVacancies, setAllocatedVacancies] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch master data
  useEffect(() => {
    const fetchMasterData = async () => {
      setLoading(true);
      try {
        const [typesResp, categoriesResp] = await Promise.all([
          apiService.getAllRelaxationType(),
          apiService.getAllCategories(),
        ]);

        const typeNames = typesResp.data.map(t => t.relaxation_type_name);
        const categoryCodes = categoriesResp.data.map(c => c.category_code);
console.log("typeNames", typeNames);
console.log("categoryCodes", categoryCodes);
        setTypes(typeNames);
        setCategories(categoryCodes);
        setMain(createInitialRelaxations(typeNames, categoryCodes));
        setSpecialsByType(typeNames.reduce((acc, t) => ({ ...acc, [t]: [] }), {}));

        if (typeNames.length > 0) setActive(typeNames[0]);
      } catch (err) {
        console.error(err);
        setError("Failed to load relaxation types or categories");
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  // Fetch special categories
  useEffect(() => {
    const fetchSpecialCategories = async () => {
      setLoading(true);
      try {
        const response = await apiService.getAllCategories();
        const formatted = Array.isArray(response.data) 
          ? response.data.map(cat => ({
              special_category_id: cat.reservation_categories_id,
              special_category_name: cat.category_name || "",
              special_category_code: cat.category_code || "",
              special_category_desc: cat.category_desc || ""
            }))
          : [];
        setSpecialCategories(formatted);
      } catch (err) {
        console.error(err);
        setError("Failed to load special categories");
        setSpecialCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSpecialCategories();
  }, []);

  // Load selected policy
  useEffect(() => {
    if (!selectedPolicy?.relaxation || !types.length || !categories.length) return;
    const { main: policyMain, specialsByType: policySpecials } = selectedPolicy.relaxation;

    const filteredMain = {};
    types.forEach(t => {
      filteredMain[t] = {};
      categories.forEach(c => filteredMain[t][c] = policyMain?.[t]?.[c] ?? 0);
    });

    const filteredSpecials = {};
    types.forEach(t => {
      filteredSpecials[t] = (policySpecials?.[t] || []).map(s => ({
        name: s.name,
        mode: s.mode,
        flat: s.flat,
        values: categories.reduce((acc, c) => ({ ...acc, [c]: s.values?.[c] ?? 0 }), {}),
      }));
    });

    setMain(filteredMain);
    setSpecialsByType(filteredSpecials);
    setAllocatedVacancies(calculateAllocated(filteredMain, filteredSpecials));
    setIsDirty(false);
  }, [selectedPolicy, types, categories]);

  const availableCategories = specialCategories.filter(
    cat => !specialsByType[active]?.some(s => s.name === cat.special_category_name)
  );

  // Handlers
  const handleMainChange = (type, cat, val) => {
    setMain(prev => ({ ...prev, [type]: { ...prev[type], [cat]: val } }));
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

    if (type === "Vacancy") setAllocatedVacancies(calculateAllocated(main, updatedSpecials));
    setIsDirty(true);
  };

  const removeSpecial = (type, idx) => {
    const newSpecials = { ...specialsByType, [type]: specialsByType[type].filter((_, i) => i !== idx) };
    setSpecialsByType(newSpecials);
    if (type === "Vacancy") setAllocatedVacancies(calculateAllocated(main, newSpecials));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (onRelaxationSave) onRelaxationSave({ relaxation: { main, specialsByType, allocatedVacancies } });
    setIsDirty(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div className="relaxation-container p-4">
      <div className="tabs mb-4">
        {types.map(t => (
          <Button key={t} className={`me-2 ${active === t ? "active" : ""}`} onClick={() => setActive(t)}>
            {t}
          </Button>
        ))}
      </div>

      <Card className="mb-4">
        <Card.Header>{active}</Card.Header>
        <Card.Body>
          {/* Main Table */}
          <Table bordered className="mb-4">
            <thead>
              <tr>{categories.map(c => <th key={c}>{c}</th>)}</tr>
            </thead>
            <tbody>
              <tr>
                {categories.map(c => (
                  <td key={c}>
                    <Form.Control
                      type={active === "Education" ? "text" : "number"}
                      value={main[active][c]}
                      onChange={(e) => handleMainChange(active, c, e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>

          {/* Special Categories */}
          <h5>Special Categories</h5>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => {
              const catName = e.target.value;
              setSelectedCategory("");
              if (!catName) return;

              const cat = specialCategories.find(sc => sc.special_category_name === catName);
              if (!cat) return;

              const sp = createEmptySpecial(cat.special_category_name, types, categories);
              const updated = { ...specialsByType, [active]: [...specialsByType[active], sp] };
              setSpecialsByType(updated);

              if (active === "Vacancy") setAllocatedVacancies(calculateAllocated(main, updated));
              setIsDirty(true);
            }}
          >
            <option value="">Select Special Category</option>
            {availableCategories.map(c => (
              <option key={c.special_category_id} value={c.special_category_name}>
                {c.special_category_name}
              </option>
            ))}
          </Form.Select>

          {specialsByType[active]?.length ? (
            <Table bordered className="mt-3">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Mode</th>
                  {categories.map(c => <th key={c}>{c}</th>)}
                  <th>Flat</th>
                  <th>Actions</th>
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
                      >
                        <option value="flat">Flat</option>
                        <option value="category">Category-wise</option>
                      </Form.Select>
                    </td>
                    {categories.map(c => (
                      <td key={c}>
                        {s.mode === "category" ? (
                          <Form.Control
                            type="number"
                            value={s.values[c]}
                            onChange={(e) => updateSpecial(active, i, "values", e.target.value, c)}
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
                        />
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Button variant="outline-danger" size="sm" onClick={() => removeSpecial(active, i)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted mt-3">No special categories added yet</p>
          )}
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-end">
        <Button onClick={handleSave} disabled={!isDirty}>Save All Changes</Button>
      </div>
    </div>
  );
};

export default Relaxation;
