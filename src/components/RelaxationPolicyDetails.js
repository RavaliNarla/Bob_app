import React, { useState, useMemo } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faMinusCircle } from "@fortawesome/free-solid-svg-icons";

const RelaxationTable = ({ policy }) => {
  const [openRow, setOpenRow] = useState(null);

  const toggleRow = (rowId) => {
    setOpenRow(openRow === rowId ? null : rowId);
  };

  // ✅ Build rows dynamically from policy.relaxation.main
  const rows = useMemo(() => {
    if (!policy?.relaxation?.main) return [];
    return Object.entries(policy.relaxation.main).map(([label, values], idx) => ({
      id: idx + 1,
      label,
      sc: values.SC ?? "-",
      st: values.ST ?? "-",
      ews: values.EWS ?? "-",
      obc: values.OBC ?? "-",
      gen: values.GEN ?? "-",
    }));
  }, [policy]);

  // ✅ Build specials mapping by type
  const specialsByType = useMemo(() => {
    if (!policy?.relaxation?.specialsByType) return {};
    const specials = {};
    Object.entries(policy.relaxation.specialsByType).forEach(([type, list]) => {
      specials[type] = list.map((cat, idx) => ({
        id: idx + 1,
        category: cat.name,
        mode: cat.mode === "flat" ? "Flat" : "Category-Wise",
        sc: cat.values.SC ?? "-NA-",
        st: cat.values.ST ?? "-NA-",
        ews: cat.values.EWS ?? "-NA-",
        obc: cat.values.OBC ?? "-NA-",
        gen: cat.values.GEN ?? "-NA-",
        flat: cat.flat ?? "-NA-",
      }));
    });
    return specials;
  }, [policy]);

  // Extract category keys dynamically
const categoryKeys = useMemo(() => {
  const main = policy?.relaxation?.main;
  if (!main) return [];
  const firstValues = Object.values(main)[0] || {};
  return Object.keys(firstValues); // ["SC","ST","EWS","GEN","OBC"]
}, [policy]);

  return (
    <div className="table-responsive">
      <div className="col-12 col-md-6 col-lg-3 mb-4 formSpace">
        <label htmlFor="probation_period" className="form-label">Relaxation Policy No</label>
        <input
          type="text"
          className="form-control"
          value={policy?.relaxation_policy_number || ""}
          disabled
        />
      </div>

      <table className="req_table table table-hover relaxation_table">
      <thead className="table-header-orange">
        <tr>
          <th></th>
          <th>Relaxation Details</th>
          {categoryKeys.map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
        <tbody className="table-body-orange">
          {rows.map((row) => (
            <React.Fragment key={row.id}>
              <tr onClick={() => toggleRow(row.id)} style={{ cursor: "pointer" }}>
                <td>
                  {openRow === row.id ? (
                    <FontAwesomeIcon icon={faMinusCircle} className="text-danger toggle-icon" />
                  ) : (
                    <FontAwesomeIcon icon={faPlusCircle} className="text-primary toggle-icon faPlusCircle" />
                  )}
                </td>
                <td className="relaxationName">{row.label}</td>
                <td>{row.sc}</td>
                <td>{row.st}</td>
                <td>{row.ews}</td>
                <td>{row.obc}</td>
                <td>{row.gen}</td>
              </tr>

              {/* Expanded row → show special categories if available */}
              {openRow === row.id && specialsByType[row.label] && (
                <tr>
                  <td colSpan="7">
                    <div className="table-responsive">
                      <table className="req_table table table-sm table-bordered specialCat_table">
                      <thead className="table-header-orange">
                          <tr>
                            <th>Special Categories</th>
                            <th>Mode</th>
                            {categoryKeys.map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                            <th>Flat</th>
                          </tr>
                        </thead>
                        <tbody className="table-body-orange">
                          {specialsByType[row.label].map((cat) => (
                            <tr key={cat.id}>
                              <td>{cat.category}</td>
                              <td>{cat.mode}</td>
                              <td>{cat.sc}</td>
                              <td>{cat.st}</td>
                              <td>{cat.ews}</td>
                              <td>{cat.obc}</td>
                              <td>{cat.gen}</td>
                              <td>{cat.flat}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RelaxationTable;
