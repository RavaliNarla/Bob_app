import React, { useState, useEffect } from "react";
import { Button, Form, Table, Card } from "react-bootstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { apiService } from "../services/apiService";
import { faCheckCircle  } from "@fortawesome/free-solid-svg-icons";
import { createInitialRelaxations, createEmptySpecial, calculateAllocated } from "../utils/relaxationUtils";

const Relaxation = ({ onRelaxationSave, selectedPolicy,readOnly = false }) => {
  const [types, setTypes] = useState([]); // now stores objects { name, input }
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
        // console.log("typesResp", typesResp);
        // console.log("categoriesResp", categoriesResp);

        // 🔹 Map types to objects with name + input
        const typeObjs = typesResp.data.map(t => ({
          name: t.relaxation_type_name,
          input: t.input?.toLowerCase() || "number", // default to number if missing
        }));

        const categoryCodes = categoriesResp.data.map(c => c.category_code);

        setTypes(typeObjs);
        setCategories(categoryCodes);

        // create main object with type names
        //setMain(createInitialRelaxations(typeObjs.map(t => t.name), categoryCodes));
        setMain(createInitialRelaxations(typeObjs.map(t => t.name), categoryCodes,typeObjs));
        // initialize specials
        setSpecialsByType(typeObjs.reduce((acc, t) => ({ ...acc, [t.name]: [] }), {}));

        if (typeObjs.length > 0) setActive(typeObjs[0].name);
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
        const response = await apiService.getAllSpecialCategories();
        // console.log("response", response);
        const formatted = Array.isArray(response.data)
          ? response.data.map(cat => ({
              special_category_id: cat.special_category_id,
              special_category_name: cat.special_category_name || "",
              special_category_code: cat.special_category_code || "",
              special_category_desc: cat.special_category_desc || ""
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
      filteredMain[t.name] = {};
      categories.forEach(c => filteredMain[t.name][c] = policyMain?.[t.name]?.[c] ?? 0);
    });

    const filteredSpecials = {};
    types.forEach(t => {
      filteredSpecials[t.name] = (policySpecials?.[t.name] || []).map(s => ({
        name: s.name,
        mode: s.mode ?? "flat", // fallback to flat if mode missing
        flat: s.flat ?? 0,
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
    const activeType = types.find(t => t.name === type);
    if (activeType?.input === 'number') {
      const numVal = typeof val === 'string' ? parseFloat(val) || 0 : val;
      val = Math.max(0, numVal);
    }
  
    setMain(prev => {
      const updated = {
        ...prev,
        [type]: {
          ...prev[type],
          [cat]: val
        }
      };
  
      // ✅ If type is Vacancy, recalc allocatedVacancies
      if (type === "Vacancies") {
        setAllocatedVacancies(calculateAllocated(updated, specialsByType));
      }
  
      return updated;
    });
    setIsDirty(true);
  };

  // const updateSpecial = (type, idx, field, value, cat = null) => {
  //   const arr = [...specialsByType[type]];
  //   const sp = { ...arr[idx] };

  //   // Ensure values object exists
  //   if (!sp.values) sp.values = categories.reduce((cAcc, c) => ({ ...cAcc, [c]: 0 }), {});

  //   if (field === "mode") sp.mode = value;
  //   if (field === "flat") sp.flat = value;
  //   if (field === "values" && cat) sp.values[cat] = value;

  //   arr[idx] = sp;
  //   const updatedSpecials = { ...specialsByType, [type]: arr };
  //   setSpecialsByType(updatedSpecials);

  //   if (type === "Vacancy") setAllocatedVacancies(calculateAllocated(main, updatedSpecials));
  //   setIsDirty(true);
  // };

  const updateSpecial = (type, idx, field, value, cat = null) => {
    const arr = [...specialsByType[type]];
    const sp = { ...arr[idx] };
  
    const typeInfo = types.find(t => t.name === type);
    const isText = typeInfo?.input === "text";
  
    // Ensure values object exists
    if (!sp.values) {
      sp.values = categories.reduce((cAcc, c) => ({ ...cAcc, [c]: isText ? "" : 0 }), {});
    }
  
    if (field === "mode") sp.mode = value;
    if (field === "flat") sp.flat = isText ? value : Number(value) || 0;
    if (field === "values" && cat) {
      sp.values[cat] = isText ? value : Number(value) || 0;
    }
  
    arr[idx] = sp;
    const updatedSpecials = { ...specialsByType, [type]: arr };
    setSpecialsByType(updatedSpecials);
  
    if (type === "Vacancies") {
      setAllocatedVacancies(calculateAllocated(main, updatedSpecials));
    }
    setIsDirty(true);
  };

  const removeSpecial = (type, idx) => {
    const newSpecials = { ...specialsByType, [type]: specialsByType[type].filter((_, i) => i !== idx) };
    setSpecialsByType(newSpecials);
    if (type === "Vacancies") setAllocatedVacancies(calculateAllocated(main, newSpecials));
    setIsDirty(true);
  };

  const handleSave = () => {
    if (onRelaxationSave) onRelaxationSave({ relaxation: { main, specialsByType, allocatedVacancies } });
    setIsDirty(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  // 🔹 Get active type object
  const activeTypeObj = types.find(t => t.name === active);

  return (
    <div className="relaxation-container p-4">
      <div className="tabs mb-4">
        {types.map(t => (
          <Button key={t.name} className={`me-2 relax_change_btn ${active === t.name ? "active" : ""}`} onClick={() => setActive(t.name)}>
            {t.name}
          </Button>
        ))}
      </div>
       
      <Card className="mb-2">
        {/* <Card.Header>{active}</Card.Header> */}
        <Card.Body className="relaxation_table">
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
                      type={activeTypeObj?.input === "text" ? "text" : "number"}
                      min={activeTypeObj?.input === "number" ? "0" : undefined}
                      value={main[active][c]}
                      className="no-spin"
                      onChange={(e) => handleMainChange(active, c, activeTypeObj?.input === "number" ? parseFloat(e.target.value) || 0 : e.target.value)}
                    />
                  </td>
                ))}
              </tr>
            </tbody>
          </Table>

          {/* Special Categories */}
          <h5 class="special_category_title">Special Categories</h5>
          <div class="col-md-3" style={{ paddingLeft: '0px' }}>
          <Form.Select
            value={selectedCategory}
            onChange={(e) => {
              const catName = e.target.value;
              setSelectedCategory("");
              if (!catName) return;

              const cat = specialCategories.find(sc => sc.special_category_name === catName);
              if (!cat) return;

              //const sp = createEmptySpecial(cat.special_category_name, types.map(t => t.name), categories);
              const sp = createEmptySpecial(
                cat.special_category_name, // special name
                active,                    // ✅ current active type name
                categories,                // categories
                types                      // master types array
              );
              
              const updated = { ...specialsByType, [active]: [...specialsByType[active], sp] };
              setSpecialsByType(updated);

              if (active === "Vacancies") setAllocatedVacancies(calculateAllocated(main, updated));
              setIsDirty(true);
            }}
          >
            <option value="">Select Category</option>
            {availableCategories.map(c => (
              <option key={c.special_category_id} value={c.special_category_name}>
                {c.special_category_name}
              </option>
            ))}
          </Form.Select>
            </div>
          {specialsByType[active]?.length ? (
            <Table bordered className="mt-3">
              <thead>
                <tr>
                  <th class="name">Name</th>
                  <th class="mode">Mode</th>
                  {categories.map(c => <th class="caste_category" key={c}>{c}</th>)}
                  <th class="flatnumber">Flat</th>
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
                      <td class="caste_category" key={c}>
                        {s.mode === "category" ? (
                         <Form.Control
                         type={activeTypeObj?.input === "text" ? "text" : "number"}
                         min={activeTypeObj?.input === "number" ? "0" : undefined}
                         value={s.values?.[c] ?? (activeTypeObj?.input === "number" ? 0 : "")}
                         onChange={(e) => updateSpecial(
                           active,
                           i,
                           "values",
                           activeTypeObj?.input === "number"
                             ? parseFloat(e.target.value) || 0
                             : e.target.value,
                           c
                         )}
                         className="no-spin"
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
                          value={s.flat ?? 0}
                          className="no-spin"
                          onChange={(e) => updateSpecial(active, i, "flat", e.target.value)}
                        />
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <Button variant="outline-danger delete_btn" size="sm" onClick={() => removeSpecial(active, i)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-muted mt-3 blinking-text">*** No special categories added yet ***</p>
          )}
        </Card.Body>
      </Card>
      {!readOnly && (
      <div className="d-flex justify-content-end ">
        <Button className="save_btn" onClick={handleSave} disabled={!isDirty}> <FontAwesomeIcon icon={faCheckCircle } />&nbsp;Save</Button>
      </div>
      )}
    </div>
  );
};

export default Relaxation;
