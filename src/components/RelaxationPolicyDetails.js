import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faMinusCircle  } from "@fortawesome/free-solid-svg-icons";


const RelaxationTable = () => {
  // ✅ Default open row is 1
  const [openRow, setOpenRow] = useState(0);

  const toggleRow = (rowId) => {
    setOpenRow(openRow === rowId ? null : rowId);
  };

  const rows = [
    { id: 1, label: "Age Relaxation", sc: "05", st: "05", ews: "15", obc: "05", gen: "05" },
    { id: 2, label: "Fee Relaxation", sc: "05", st: "05", ews: "15", obc: "05", gen: "05" },
    { id: 3, label: "Qualification", sc: "05", st: "05", ews: "15", obc: "05", gen: "05" },
    { id: 4, label: "Vacancies", sc: "05", st: "05", ews: "15", obc: "05", gen: "05" },
    { id: 5, label: "Experience Relaxation", sc: "05", st: "05", ews: "15", obc: "05", gen: "05" },
  ];

  const specialCategories = [
    { category: "Person with Disability", mode: "Flat", sc: "05", st: "05", ews: "15", obc: "05", gen: "05", flat: "-NA-" },
    { category: "Ex-Servicemen", mode: "Category-Wise", sc: "-NA-", st: "-NA-", ews: "-NA-", obc: "-NA-", gen: "-NA-", flat: "05" },
    { category: "Children/Family of Martyrs", mode: "Flat", sc: "05", st: "05", ews: "15", obc: "05", gen: "05", flat: "-NA-" },
    { category: "Hearing Impaired", mode: "Category-Wise", sc: "-NA-", st: "-NA-", ews: "-NA-", obc: "-NA-", gen: "-NA-", flat: "05" },
    { category: "Mentally Retarted", mode: "Flat", sc: "05", st: "05", ews: "15", obc: "05", gen: "05", flat: "-NA-" },
  ];
  
  return (
    
    <div className="table-responsive">
      <div class="col-12 col-md-6 col-lg-3 mb-4 formSpace">
        <label for="probation_period" class="form-label">Relaxation Policy No</label>
        <input type="text" class="form-control" value="RP-0003" disabled />
    </div>
      <table className="req_table table table-hover relaxation_table">
        <thead className="table-header-orange">
          <tr>
            <th></th>
            <th>Relaxation Details</th>
            <th>SC</th>
            <th>ST</th>
            <th>EWS</th>
            <th>OBC</th>
            <th>GEN</th>
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
                    <FontAwesomeIcon icon={faPlusCircle} className="text-primary toggle-icon" />
                  )}
                </td>
                <td className="relaxationName">{row.label}</td>
                <td>{row.sc}</td>
                <td>{row.st}</td>
                <td>{row.ews}</td>
                <td>{row.obc}</td>
                <td>{row.gen}</td>
              </tr>

              {openRow === row.id && (
                <tr>
                  <td colSpan="7">
                    <div className="table-responsive">
                      <table className="req_table table table-sm table-bordered specialCat_table">
                        <thead className="table-header-orange">
                          <tr>
                            <th>Special Categories</th>
                            <th>Mode</th>
                            <th>SC</th>
                            <th>ST</th>
                            <th>EWS</th>
                            <th>OBC</th>
                            <th>GEN</th>
                            <th>Flat</th>
                          </tr>
                        </thead>
                        <tbody className="table-body-orange">
                          {specialCategories.map((cat, idx) => (
                            <tr key={idx}>
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

