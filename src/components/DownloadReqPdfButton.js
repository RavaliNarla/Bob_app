// DownloadReqPdfButton.jsx
import React from "react";
import dayjs from "dayjs";
// eslint-disable-next-line
import * as html2pdf from "html2pdf.js";
import { apiService } from "../services/apiService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const fmt = (d) => (d ? dayjs(d).format("DD.MM.YYYY") : undefined);
const ORANGE = "#FF6F00";

export default function DownloadReqPdfButton(props) {
  const { requisition_id, requisition: requisitionFromParent } = props;

  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState(null);
  const [fetchedPositions, setFetchedPositions] = React.useState(null);
  const [requisition, setRequisition] = React.useState(requisitionFromParent || null);
  const printRef = React.useRef(null);

  // keep local state in sync with parent prop
  React.useEffect(() => {
    if (requisitionFromParent) setRequisition(requisitionFromParent);
  }, [requisitionFromParent]);

  const fileName = `${requisition_id || "notice"}.pdf`;

  const loadDataIfNeeded = async () => {
    // If we already have both, return immediately
    if (fetchedPositions !== null && (requisitionFromParent || requisition) !== null) {
      return { positions: fetchedPositions, req: requisitionFromParent || requisition };
    }

    setLoading(true);
    setErr(null);
    try {
      // 1) positions for this requisition
      const posRes = await apiService.getByRequisitionId(requisition_id);
      const posArr = posRes?.data || [];
      setFetchedPositions(posArr);

      // 2) requisition meta: prefer parent prop, else fetch list and find
      let reqObj = requisitionFromParent || null;
      if (!reqObj) {
        const reqListRes = await apiService.getReqData();
        const reqList = reqListRes?.data || [];
        reqObj = reqList.find((r) => r.requisition_id === requisition_id) || null;
      }
      setRequisition(reqObj);

      return { positions: posArr, req: reqObj };
    } catch (e) {
      setErr(e?.message || "Failed to load requisition data");
      return { positions: [], req: requisitionFromParent || null };
    } finally {
      setLoading(false);
    }
  };

  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => r()));
  const waitForDom = async (predicate, tries = 8) => {
    for (let i = 0; i < tries; i++) {
      await nextFrame(); // let React commit
      await nextFrame(); // let layout paint
      if (predicate()) return true;
    }
    return false;
  };

  async function handleDownload(e) {
    e?.stopPropagation?.();

    // Fetch (if needed)
    const { positions } = await loadDataIfNeeded();

    if (!Array.isArray(positions) || positions.length === 0) {
      // console.log("No positions data yet for this requisition.");
    //  setErr("No position data yet for this requisition.");
    toast.info("No position data yet for this requisition.");
      return;
    }

    // Wait until the hidden area has rendered with rows
    const ok = await waitForDom(
      () =>
        printRef.current &&
        printRef.current.querySelectorAll("tbody tr").length >= positions.length
    );
    if (!ok) {
      setErr("Failed to render content for PDF. Please try again.");
      return;
    }

    setLoading(true);
    setErr(null);
    try {
      const opts = {
        margin: 0,
        filename: fileName,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["css", "legacy"] },
      };
      const h2p = (html2pdf && html2pdf.default) ? html2pdf.default : html2pdf;
      await h2p().set(opts).from(printRef.current).save();
    } catch (e2) {
      setErr(e2?.message || "Failed to generate PDF");
    } finally {
      setLoading(false);
    }
  }

  // ---- Helpers ----
  const safe = (v) => (v === null || v === undefined ? "—" : v);
  const years = (n) => (Number.isFinite(n) ? `${n}` : "—");

  // Table layout (rebalanced widths, border-box)
  const tbl = {
    wrap: { marginTop: "6mm" },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      tableLayout: "fixed",
      fontSize: "10.5pt",
      boxSizing: "border-box",
      maxWidth: "100%",
    },
    thead: { display: "table-header-group" },
    tfoot: { display: "table-footer-group" },
    th: {
      border: "0.3mm solid #bbb",
      padding: "3mm 2mm",
      textAlign: "left",
      background: "#FF6F00",
      color: "#fff",
      fontWeight: 700,
      whiteSpace: "nowrap",
      boxSizing: "border-box",
    },
    td: {
      border: "0.3mm solid #ddd",
      padding: "2.5mm 2mm",
      verticalAlign: "top",
      whiteSpace: "pre-wrap", // keep Title flexible; short cols override to nowrap inline
      wordBreak: "break-word",
      boxSizing: "border-box",
    },
    zebra: { background: "#fafafa" },
    w: {
      sno: { width: "8mm" },
      code: { width: "18mm" },
      emp: { width: "16mm" },
      grade: { width: "12mm" },
      vac: { width: "12mm", textAlign: "right" },
      age: { width: "16mm" },
      exp: { width: "18mm" },
      salary: { width: "20mm" },
      // Title has no fixed width -> it will get the remaining space
    },
  };

  // Header values
  const orgName = "Bank of Baroda";
  const logoUrl = "/assets/bob-logo.png";

  const req = requisitionFromParent || requisition;
  const advtCode =
    req?.requisition_title?.match(/BOB\/HRM\/REC\/ADVT\/\S+/)?.[0] || undefined;
  const registrationStart = req?.registration_start_date;
  const registrationEnd = req?.registration_end_date;
  const positions = Array.isArray(fetchedPositions) ? fetchedPositions : [];

  return (
    <>
      <FontAwesomeIcon
        className="iconhover"
        onClick={handleDownload}
        disabled={loading}
        title="Download"
        icon={faDownload}
        style={{ color: '#717178' }}
      />
        {/* {loading ? "Preparing…" : "Download"}
      </button> */}
      {/* {err && <span style={{ color: "crimson", marginLeft: 8 }}>{err}</span>} */}

      {/* Hidden render area */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          opacity: 0,
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        {positions.length > 0 && (
          <div ref={printRef} style={page.a4}>
            <section style={page.boxFirst}>
              <header style={st.header}>
                {logoUrl ? (
                  <img
                    style={st.logo}
                    src={logoUrl}
                    alt="Logo"
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div style={{ ...st.logo, ...st.logoPh }}>LOGO</div>
                )}
                <div style={st.headRight}>
                  <div style={st.org}>{orgName}</div>
                  {advtCode && <div style={st.smallText}>{advtCode}</div>}
                  {(registrationStart || registrationEnd) && (
                    <div style={{ marginTop: "2mm" }}>
                      {registrationStart && (
                        <div>
                          Online Registration of Application starts from:{" "}
                          <b>{fmt(registrationStart)}</b>
                        </div>
                      )}
                      {registrationEnd && (
                        <div>
                          Last date for Submission of Application &amp; Payment
                          of fees: <b>{fmt(registrationEnd)}</b>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </header>

              <h1 style={st.title}>Positions Summary</h1>

              {/* Requisition meta block */}
              {req && (
                <div style={{ marginBottom: "6mm", fontSize: "11pt" }}>
                  {req.requisition_code && (
                    <div>
                      <b>Requisition Code:</b> {req.requisition_code}
                    </div>
                  )}
                  {req.requisition_title && (
                    <div>
                      <b>Title:</b> {req.requisition_title}
                    </div>
                  )}
                  {req.requisition_status && (
                    <div>
                      <b>Status:</b> {req.requisition_status}
                    </div>
                  )}
                  {req.requisition_description && (
                    <div style={{ marginTop: "3mm" }}>
                      <b>Description:</b>
                      <div style={st.para}>{req.requisition_description}</div>
                    </div>
                  )}
                </div>
              )}

              <div style={tbl.wrap}>
                <table style={tbl.table}>
                  <thead style={tbl.thead}>
                    <tr>
                      <th style={{ ...tbl.th, ...tbl.w.sno }}>#</th>
                      <th style={tbl.th}>Position Title</th>
                      <th style={{ ...tbl.th, ...tbl.w.code }}>Code</th>
                      <th style={{ ...tbl.th, ...tbl.w.emp }}>Employment</th>
                      <th style={{ ...tbl.th, ...tbl.w.grade }}>Grade</th>
                      <th style={{ ...tbl.th, ...tbl.w.vac, textAlign: "right" }}>
                        Vac.
                      </th>
                      <th style={{ ...tbl.th, ...tbl.w.age }}>Age (yrs)</th>
                      <th style={{ ...tbl.th, ...tbl.w.exp }}>Experience (yrs)</th>
                      <th style={{ ...tbl.th, ...tbl.w.salary }}>Salary (CTC)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((p, i) => {
                      const zebra = i % 2 === 1 ? tbl.zebra : null;
                      const age =
                        (Number.isFinite(p.eligibility_age_min)
                          ? p.eligibility_age_min
                          : "—") +
                        " - " +
                        (Number.isFinite(p.eligibility_age_max)
                          ? p.eligibility_age_max
                          : "—");

                      const exp =
                        years(p.mandatory_experience) +
                        (Number.isFinite(p.preferred_experience)
                          ? ` (pref ${p.preferred_experience})`
                          : "");

                      const salary =
                        (p.min_salary
                          ? `₹${Number(p.min_salary).toLocaleString()}`
                          : "—") +
                        (p.max_salary
                          ? ` - ₹${Number(p.max_salary).toLocaleString()}`
                          : "");

                      return (
                        <tr key={p.position_id || i} style={zebra}>
                          <td
                            style={{ ...tbl.td, ...tbl.w.sno, whiteSpace: "nowrap" }}
                          >
                            {i + 1}
                          </td>
                          <td style={tbl.td}>
                            <div style={{ fontWeight: 600 }}>
                              {safe(p.position_title)}
                            </div>
                            <div
                              style={{
                                opacity: 0.85,
                                fontSize: "9.8pt",
                                marginTop: "2mm",
                              }}
                            >
                              <b>Qualification:</b>{" "}
                              {safe(p.mandatory_qualification)}
                              {p.preferred_qualification
                                ? ` (Pref: ${p.preferred_qualification})`
                                : ""}
                              {p.roles_responsibilities ? (
                                <>
                                  <br />
                                  <b>R&amp;R:</b> {p.roles_responsibilities}
                                </>
                              ) : null}
                              {p.selection_procedure ? (
                                <>
                                  <br />
                                  <b>Selection:</b> {p.selection_procedure}
                                </>
                              ) : null}
                              {p.documents_required ? (
                                <>
                                  <br />
                                  <b>Docs:</b> {p.documents_required}
                                </>
                              ) : null}
                            </div>
                          </td>
                          <td
                            style={{ ...tbl.td, ...tbl.w.code, whiteSpace: "nowrap" }}
                          >
                            {safe(p.position_code)}
                          </td>
                          <td
                            style={{ ...tbl.td, ...tbl.w.emp, whiteSpace: "nowrap" }}
                          >
                            {safe(p.employment_type)}
                          </td>
                          <td
                            style={{ ...tbl.td, ...tbl.w.grade, whiteSpace: "nowrap" }}
                          >
                            {Number.isFinite(p.grade_id) ? p.grade_id : "—"}
                          </td>
                          <td
                            style={{
                              ...tbl.td,
                              ...tbl.w.vac,
                              textAlign: "right",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {Number.isFinite(p.no_of_vacancies)
                              ? p.no_of_vacancies
                              : "—"}
                          </td>
                          <td
                            style={{ ...tbl.td, ...tbl.w.age, whiteSpace: "nowrap" }}
                          >
                            {age}
                          </td>
                          <td style={{ ...tbl.td, ...tbl.w.exp }}>{exp}</td>
                          <td style={{ ...tbl.td, ...tbl.w.salary }}>{salary}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot style={tbl.tfoot}>
                    <tr>
                      <td style={{ ...tbl.td, fontWeight: 700 }} colSpan={9}>
                        Total Positions: {positions.length}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </>
  );
}

/* Page frame: precise A4 with inner box */
const page = {
  a4: { width: "210mm", minHeight: "297mm" },
  boxFirst: {
    width: "176mm", // was 180mm
    minHeight: "277mm",
    margin: "10mm 15mm",
    boxSizing: "border-box",
    position: "relative",
    pageBreakAfter: "always",
  },
  boxMiddle: {
    width: "180mm",
    minHeight: "277mm",
    margin: "10mm 15mm",
    boxSizing: "border-box",
    position: "relative",
    pageBreakAfter: "always",
  },
  boxLast: {
    width: "180mm",
    minHeight: "277mm",
    margin: "10mm 15mm",
    boxSizing: "border-box",
    position: "relative",
  },
};

const st = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "6mm",
  },
  logo: { width: "42mm", height: "14mm", objectFit: "contain" },
  logoPh: {
    display: "grid",
    placeItems: "center",
    border: "1px solid #bbb",
    color: "#666",
  },
  headRight: { textAlign: "right", fontSize: "10.5pt" },
  org: {
    fontWeight: 700,
    marginBottom: "1.5mm",
    color: ORANGE,
    textTransform: "uppercase",
  },
  smallText: { fontSize: "10pt" },

  title: {
    margin: "5mm 0 4mm",
    fontSize: "16pt",
    fontWeight: 700,
    borderLeft: `4mm solid ${ORANGE}`,
    paddingLeft: "5mm",
    textTransform: "uppercase",
    letterSpacing: "0.2px",
  },
  section: {
    margin: "6mm 0 2.5mm",
    fontSize: "13pt",
    fontWeight: 700,
    borderBottom: `1.5px solid ${ORANGE}`,
    paddingBottom: "1.5mm",
  },

  gridTwo: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "2.5mm 10mm",
    margin: "1.5mm 0 3mm",
    fontSize: "11.25pt",
  },

  kv: { marginTop: "2.5mm" },

  para: {
    margin: "1.5mm 0 0",
    textAlign: "justify",
    hyphens: "auto",
    lineHeight: 1.35,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  blockAvoid: {
    breakInside: "avoid",
    pageBreakInside: "avoid",
    WebkitColumnBreakInside: "avoid",
    MozPageBreakInside: "avoid",
  },
  sectionTight: {
    margin: "4mm 0 2mm",
  },

  footer: {
    position: "absolute",
    bottom: "8mm",
    left: 0,
    right: 0,
    display: "flex",
    justifyContent: "space-between",
    fontSize: "10pt",
    borderTop: "1px solid " + "#aaa",
    paddingTop: "2mm",
  },
  footerL: { opacity: 0.85 },
  footerR: { opacity: 0.85 },
};
