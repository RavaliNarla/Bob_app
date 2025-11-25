// src/pages/BulkTiles.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { useTranslation } from 'react-i18next';

export default function BulkTiles() {
  const { t } = useTranslation("bulkupload");
  const items = [
    { to: "/bulk-upload", label: t("bulkUpload")  },
    { to: "/candidate-assign", label: t("candidateAssign") },
  ];

  return (
    <nav className="top-tabs mb-3" role="navigation" aria-label="Bulk actions">
      <ul className="top-tabs__list">
        {items.map((it) => (
          <li key={it.to} className="top-tabs__item">
            <NavLink
              to={it.to}
              end
              className={({ isActive }) =>
                "top-tabs__link" + (isActive ? " active" : "")
              }
            >
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
