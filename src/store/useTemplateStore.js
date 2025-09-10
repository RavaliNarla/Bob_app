import { create } from 'zustand';
import defaultTemplate from "../components/template-studio/defaultTemplate.json";

export const useTemplateStore = create((set, get) => ({
  template: defaultTemplate,
  candidate: {
    full_name: "",
    address: "",
    address1: "",
    address2:"",
    location: ""
  },
    layout: "template1", // 🔹 default layout
  setLayout: (layout) => set({ layout }),
  job: {
    position: "",
    salary: ""
  },

  // mutations
  setTemplateName: (name) =>
    set((s) => ({ template: { ...s.template, templateName: name }})),
  setBranding: (patch) =>
    set((s) => ({ template: { ...s.template, branding: { ...s.template.branding, ...patch }}})),
  setSection: (key, value) =>
    set((s) => ({ template: { ...s.template, sections: { ...s.template.sections, [key]: value }}})),
  setField: (key, value) =>
    set((s) => ({ template: { ...s.template, fields: { ...s.template.fields, [key]: value }}})),
  setContent: (key, value) =>
    set((s) => ({ template: { ...s.template, content: { ...s.template.content, [key]: value }}})),
}));
