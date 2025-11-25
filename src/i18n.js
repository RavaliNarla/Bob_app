import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import jobEn from "./i18n/requisition.en.json";
import jobHi from "./i18n/requisition.hi.json";
import jobpostingsEn from "./i18n/jobpostings.en.json";
import jobpostingsHi from "./i18n/jobpostings.hi.json";
import jobcreationsEn from "./i18n/jobcreation.en.json";
import jobcreationsHi from "./i18n/jobcreation.hi.json";
import registerEn from "./i18n/register.en.json";
import registerHi from "./i18n/register.hi.json";
import departmentEn from "./i18n/department.en.json";
import departmentHi from "./i18n/department.hi.json";
import skillEn from "./i18n/skill.en.json";
import skillHi from "./i18n/skill.hi.json";
import locationEn from "./i18n/location.en.json";
import locationHi from "./i18n/location.hi.json"; 
import jobgradeEn from "./i18n/jobgrade.en.json";
import jobgradeHi from "./i18n/jobgrade.hi.json";
import positionHi from "./i18n/position.hi.json";
import positionEn from "./i18n/position.en.json";
import categoryHi from "./i18n/category.hi.json";
import categoryEn from "./i18n/category.en.json";
import specialcategoryHi from "./i18n/specialcategory.hi.json";
import specialcategoryEn from "./i18n/specialcategory.en.json";
import relaxationtypeHi from "./i18n/relaxationtype.hi.json";
import relaxationtypeEn from "./i18n/relaxationtype.en.json";
import documentHi from "./i18n/document.hi.json";
import documentEn from "./i18n/document.en.json";
import interviewpanelHi from "./i18n/interviewpanel.hi.json";
import interviewpanelEn from "./i18n/interviewpanel.en.json";
import offerletterHi from "./i18n/offerletter.hi.json";
import offerletterEn from "./i18n/offerletter.en.json";
import relaxationPolicyHi from "./i18n/relaxationPolicy.hi.json";
import relaxationPolicyEn from "./i18n/relaxationPolicy.en.json";
import approvalEn from "./i18n/approval.en.json";
import approvalHi from "./i18n/approval.hi.json";
import bulkuploadEn from "./i18n/bulkupload.en.json";
import bulkuploadHi from "./i18n/bulkupload.hi.json";
import sidebarEn from "./i18n/sidebar.en.json";
import sidebarHi from "./i18n/sidebar.hi.json";
import dashboardEn from "./i18n/dashboard.en.json";
import dashboardHi from "./i18n/dashboard.hi.json";

// ⬅ Read persisted Redux value
let savedLang = "en";
try {
  const root = localStorage.getItem("persist:root");
  if (root) {
    const parsed = JSON.parse(root);
    const langState = JSON.parse(parsed.language);
    savedLang = langState.lang || "en";
  }
} catch (e) {
  console.log("Language parse error:", e);
}

i18n.use(initReactI18next).init({
  resources: {
    en: {
      job: jobEn ,
      jobpostings: jobpostingsEn,
      jobcreation: jobcreationsEn,
      register: registerEn,
      department: departmentEn,
      skill: skillEn,
      location: locationEn,
      jobgrade: jobgradeEn,
      position: positionEn,
      category: categoryEn,
      specialcategory: specialcategoryEn,
      relaxationtype: relaxationtypeEn,
      document: documentEn,
      interviewpanel: interviewpanelEn,
      offerletter: offerletterEn,
      relaxationPolicy: relaxationPolicyEn,
      approval: approvalEn,
      bulkupload: bulkuploadEn,
      sidebar: sidebarEn,
      dashboard: dashboardEn
    },
    hi: {
     job: jobHi ,
     jobpostings: jobpostingsHi,
    jobcreation: jobcreationsHi,
    register: registerHi,
    department: departmentHi,
    skill: skillHi,
    location: locationHi,
    jobgrade: jobgradeHi,
    position: positionHi,
    category: categoryHi,
    specialcategory: specialcategoryHi,
    relaxationtype: relaxationtypeHi,
    document: documentHi,
    interviewpanel: interviewpanelHi,
    offerletter: offerletterHi,
    relaxationPolicy: relaxationPolicyHi,
    approval: approvalHi,
    bulkupload: bulkuploadHi,
    sidebar: sidebarHi,
    dashboard: dashboardHi
    }
  },
  lng: savedLang,       // 👈 use persisted value
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
