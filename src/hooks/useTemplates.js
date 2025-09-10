import { useEffect, useMemo, useState } from "react";
import apiService from "../services/apiService";

export function useTemplates(apiBase) {
  // const TEMPLATE_API = `${apiBase}/api/offer-templates`;
  const [list, setList] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  const [errorList, setErrorList] = useState("");

  const [selectedId, setSelectedId] = useState("");
  const [htmlById, setHtmlById] = useState({});
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [errorHtml, setErrorHtml] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoadingList(true);
        setErrorList("");
        // const res = await fetch(TEMPLATE_API, { credentials: "include" });
        // const data = await res.json();
        const { data } = await apiService.getTemplates();
        // if (!res.ok) throw new Error(data?.error || `List failed (${res.status})`);
        setList(Array.isArray(data) ? data : []);
      } catch (e) {
        setErrorList(e.message || "Failed to load templates");
        setList([]);
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedId || htmlById[selectedId]) return;
    (async () => {
      try {
        setLoadingHtml(true);
        setErrorHtml("");
        // const url = `${TEMPLATE_API}/${encodeURIComponent(selectedId)}/content`;
        // const res = await fetch(url, { credentials: "include" });
        // const text = await res.text();
        // if (!res.ok) throw new Error(`Fetch template failed (${res.status})`);
        // setHtmlById(prev => ({ ...prev, [selectedId]: text || "" }));
        const { data: text } = await apiService.getTemplateContent(selectedId);
        setHtmlById(prev => ({ ...prev, [selectedId]: text || "" }));
      } catch (e) {
        setErrorHtml(e.message || "Failed to fetch template HTML");
      } finally {
        setLoadingHtml(false);
      }
    })();
  }, [selectedId, htmlById]);

  const selectedHtml = useMemo(
    () => (selectedId ? htmlById[selectedId] || "" : ""),
    [selectedId, htmlById]
  );

  return {
    list, loadingList, errorList,
    selectedId, setSelectedId,
    selectedHtml, loadingHtml, errorHtml
  };
}
