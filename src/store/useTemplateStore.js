import { create } from 'zustand';
import defaultTemplate from "../components/OfferTemplate/defaultTemplate";

export const useTemplateStore = create((set, get) => ({
  // template: defaultTemplate,
  template: { ...defaultTemplate, templateName: "" },
  candidate: {
    full_name: "",
    address: "",
    address1: "",
    address2: "",
    location: ""
  },
  layout: "",   // ✅ dropdown initially shows "Select Template"
  templateName: "",

  job: {
    position: "",
    salary: ""
  },

  // Mutations
  setLayout: (layout) => set({ layout }),

  // ✅ Update top-level templateName
  // setTemplateName: (name) => set({ templateName: name }),
  setTemplateName: (name) =>
    set((s) => ({ template: { ...s.template, templateName: name } })),
  setBranding: (patch) =>
    set((s) => ({ template: { ...s.template, branding: { ...s.template.branding, ...patch } } })),
  setSection: (key, value) =>
    set((s) => ({ template: { ...s.template, sections: { ...s.template.sections, [key]: value } } })),
  setField: (key, value) =>
    set((s) => ({ template: { ...s.template, fields: { ...s.template.fields, [key]: value } } })),
  setContent: (key, value) =>
    set((s) => ({ template: { ...s.template, content: { ...s.template.content, [key]: value } } })),
  setTemplate: (templateData) => set({ template: templateData }),
}));
