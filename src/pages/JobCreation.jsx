import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Form, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faFileAlt, faCheck, faDownload, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import JobCreationForm from './../components/JobCreationForm';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { jobSchema } from './../components/validationSchema';
import '../css/JobCreation.css';

const staticPositions = [
  {
      // "requisition_id": "22b12a66-f1f2-46b4-8064-6dd529e03071",
      "position_title": "Local Bank Section Officer",
      "position_code": "JPOS-0001",
      "dept_id": "11",
      "country_id": "1",
      "state_id": "1",
      "city_id": "1",
      "location_id": "1",
      "description": "Join one of India’s Largest Banks for a Challenging Assignment - Local Bank Section Officer",
      "roles_responsibilities": "Drive New-to-Bank (NTB) customer acquisition aggressively across all verticals – liabilities (CASA, deposits), retail assets (loans), wealth products, digital banking etc. Source new retail and other customers through field-level canvassing, direct sales, lead conversion, and tie-ups. Conduct door-to-door, workplace, and market-based sales activities to generate new business. Act as Relationship Manager for acquired customers to ensure product penetration, servicing, and retention. Achieve strict monthly and quarterly sales targets for all assigned product categories. Cross-sell bundled products such as debit cards, credit cards, insurance, SIPs, and digital onboarding at the time of acquisition. Promote Bank’s digital products and platforms, ensuring full activation and usage by customers. Continuously scout for high-potential prospects and local market opportunities to boost outreach. Collaborate with branch and backend teams for processing, documentation, and issue resolution Undertake regular follow-ups and field visits to close leads, collect documents, and enhance wallet share. Maintain comprehensive sales MIS, customer profiling, and performance dashboards. Comply with Bank’s internal control, KYC, AML, and regulatory guidelines during sourcing and onboarding. Participate in marketing campaigns, outreach drives, and third-party product activations. Perform any other duties and responsibilities as may be assigned by the Bank from time to time, including operational or administrative roles based on business needs.",
      "grade_id": "0",
      "employment_type": "Full-Time",
      "eligibility_age_min": "21",
      "eligibility_age_max": "30",
      "mandatory_qualification": "be",
      "preferred_qualification": "",
      "mandatory_experience": "5.5",
      "preferred_experience": "",
      "probation_period": 6,
      "documents_required": "The following documents in original together with a self-attested photocopy in support of the candidate’s eligibility and identity are to be invariably submitted at the time of interview failing which the candidate may not be permitted to appear for the interview. Non submission of requisite documents by the candidate at the time of interview will debar his candidature from further participation in the recruitment process. Printout of the valid GD/ Interview Call Letter Valid system generated printout of the online application form. Proof of Date of Birth (Birth Certificate issued by the Competent Municipal Authority or SSLC/ Std. X Certificate with DOB) Photo Identify Proof as indicated above. Individual Semester/Year wise Mark sheets & certificates for educational qualifications including the final degree/diploma certificate. Proper document from Board/ University for having declared the result has to be submitted. Caste Certificate issued by competent authority, strictly in the prescribed format as stipulated by Government of India, in case of SC/ ST/OBC/EWS category candidates. (as enclosed in the Annexure III) In case of candidates belonging to OBC category, certificate should specifically contain a clause that the candidate does not belong to creamy layer section excluded from the benefits of reservation for Other Backward Classes in Civil post & services under Government of India. OBC caste certificate containing the Non-creamy layer clause should be valid as on the date of interview if called for (issued within one year as on the date of advertisement). Caste Name mentioned in certificate should tally letter by letter with Central Government list / notification. Disability certificate in prescribed format issued by the District Medical Board in case of Persons with Benchmark Disability category. If the candidate has used the services of a Scribe at the time of online examination, then the duly filled in details of the scribe in the prescribed format. An Ex-serviceman candidate has to produce a copy of the Service or Discharge Book along with pension payment order and documentary proof of rank last / presently held (substantive as well as acting) at the time of interview. x. Person eligible for age relaxation under para 3.1 must produce a certificate from the District Magistrate to the effect that they are eligible for relief in terms of the Rehabilitation Package for 1984 Riot Affected Persons sanctioned by the Government and communicated vide Ministry of Finance, Dept. of Financial Services communication No.F.No.9/21/2006-IR dated 27.07.2007. Candidates serving in Government / Quasi Govt offices/ Public Sector Undertakings (including Nationalised Banks and Financial Institutions) are required to produce a “No Objection Certificate” from their employer at the time of interview, in the absence of which their candidature will not be considered and travelling expenses, if any, otherwise admissible, will not be paid. Persons falling in categories (ii), (iii), (iv) and (v) of Para 12 should produce a certificate of eligibility issued by the Govt. of India. Relevant documents in support of the work experience declared, including appointment letter, salary slip, relieving letter (wherever applicable), etc. Any other relevant documents in support of eligibility.",
      "min_credit_score": "",
      "no_of_vacancies": "15",
      "selection_procedure": "",
      "max_salary": "2500000",
      "min_salary": "2000000"
  },
  {
    // "requisition_id": "replace_with_generated_uuid_if_needed",
    "position_title": "Local Bank Officer",
    "position_code": "JPOS-0002",
    "dept_id": "2",
    "country_id": "1",
    "state_id": "1",
    "city_id": "1",
    "location_id": "1",
    "description": "Join one of India’s Largest Banks for a Challenging Assignment - Local Bank Officer",
    "roles_responsibilities": "Drive New-to-Bank (NTB) customer acquisition aggressively across all verticals – liabilities (CASA, deposits), retail assets (loans), wealth products, digital banking etc. Source new retail and other customers through field-level canvassing, direct sales, lead conversion, and tie-ups. Conduct door-to-door, workplace, and market-based sales activities to generate new business. Act as Relationship Manager for acquired customers to ensure product penetration, servicing, and retention. Achieve strict monthly and quarterly sales targets for all assigned product categories. Cross-sell bundled products such as debit cards, credit cards, insurance, SIPs, and digital onboarding at the time of acquisition. Promote Bank’s digital products and platforms, ensuring full activation and usage by customers. Continuously scout for high-potential prospects and local market opportunities to boost outreach. Collaborate with branch and backend teams for processing, documentation, and issue resolution Undertake regular follow-ups and field visits to close leads, collect documents, and enhance wallet share. Maintain comprehensive sales MIS, customer profiling, and performance dashboards. Comply with Bank’s internal control, KYC, AML, and regulatory guidelines during sourcing and onboarding. Participate in marketing campaigns, outreach drives, and third-party product activations. Perform any other duties and responsibilities as may be assigned by the Bank from time to time, including operational or administrative roles based on business needs.",
    "grade_id": "0",
    "employment_type": "Full-Time",
    "eligibility_age_min": "21",
    "eligibility_age_max": "30",
    "mandatory_qualification": "Graduation in any discipline from a recognized University / Institute {including Integrated Dual Degree (IDD)}. Professional qualifications in Chartered Accountant, Cost Accountant, Engineering, or Medical are also eligible.",
    "preferred_qualification": "Minimum 1 year of post-qualification experience as an officer in any Scheduled Commercial Bank or any Regional Rural Bank as listed in Second Schedule of Reserve Bank of India only. Experience in NBFCs, cooperative banks, Payment Banks, Small Finance Banks or fintechs will not be considered.",
    "mandatory_experience": "1",
    "preferred_experience": "1",
    "probation_period": 6,
    "documents_required": "The following documents in original together with a self-attested photocopy in support of the candidate’s eligibility and identity are to be invariably submitted at the time of interview failing which the candidate may not be permitted to appear for the interview. Non submission of requisite documents by the candidate at the time of interview will debar his candidature from further participation in the recruitment process. i. Printout of the valid GD/ Interview Call Letter ii. Valid system generated printout of the online application form iii. Proof of Date of Birth (Birth Certificate issued by the Competent Municipal Authority or SSLC/ Std. X Certificate with DOB) iv. Photo Identify Proof as indicated above. v. Individual Semester/Year wise Mark sheets & certificates for educational qualifications including the final degree/diploma certificate. Proper document from Board/ University for having declared the result has to be submitted. vi. Caste Certificate issued by competent authority, strictly in the prescribed format as stipulated by Government of India, in case of SC/ ST/OBC/EWS category candidates. (as enclosed in the Annexure III) vii. In case of candidates belonging to OBC category, certificate should specifically contain a clause that the candidate does not belong to creamy layer section excluded from the benefits of reservation for Other Backward Classes in Civil post & services under Government of India. OBC caste certificate containing the Non-creamy layer clause should be valid as on the date of interview if called for (issued within one year as on the date of advertisement). Caste Name mentioned in certificate should tally letter by letter with Central Government list / notification. viii. Disability certificate in prescribed format issued by the District Medical Board in case of Persons with Benchmark Disability category. If the candidate has used the services of a Scribe at the time of online examination, then the duly filled in details of the scribe in the prescribed format. ix. An Ex-serviceman candidate has to produce a copy of the Service or Discharge Book along with pension payment order and documentary proof of rank last / presently held (substantive as well as acting) at the time of interview. x. Person eligible for age relaxation under para 3.1 must produce a certificate from the District Magistrate to the effect that they are eligible for relief in terms of the Rehabilitation Package for 1984 Riot Affected Persons sanctioned by the Government and communicated vide Ministry of Finance, Dept. of Financial Services communication No.F.No.9/21/2006-IR dated 27.07.2007. xi. Candidates serving in Government / Quasi Govt offices/ Public Sector Undertakings (including Nationalised Banks and Financial Institutions) are required to produce a “No Objection Certificate” from their employer at the time of interview, in the absence of which their candidature will not be considered and travelling expenses, if any, otherwise admissible, will not be paid. xii. Persons falling in categories (ii), (iii), (iv) and (v) of Para 12 should produce a certificate of eligibility issued by the Govt. of India. xiii. Relevant documents in support of the work experience declared, including appointment letter, salary slip, relieving letter (wherever applicable), etc. xiv. Any other relevant documents in support of eligibility.",
    "min_credit_score": "800",
    "no_of_vacancies": "95",
    "selection_procedure": "The selection process comprise of online test, psychometric test or any other test deemed suitable for further selection process followed by Group Discussion and/or Interview of candidates, qualifying in the online test. However, if the number of eligible applications received is large/less, then Bank reserves the right to change the shortlisting criteria/interview process. Bank may, at its discretion, consider conducting of Multiple Choice/Descriptive/ Psychometric Test / Group Discussion/Interviews or any other selection/shortlisting methodologies for the above position. Merely satisfying the eligibility norms does not entitle a candidate to be called for interview. Bank reserves the right to call only the requisite number of candidates for the interview after preliminary screening/short-listing with reference to the candidate’s qualification, suitability, experience etc.",
    "max_salary": "2500000",
    "min_salary": "2000000"
  },
  {
      // "requisition_id": "22b12a66-f1f2-46b4-8064-6dd529e03071",
      "position_title": "Manager - Digital Product",
      "position_code": "JPOS-0003",
      "dept_id": "4",
      "country_id": "1",
      "state_id": "1",
      "city_id": "1",
      "location_id": "1",
      "description": "Product Senior Manager/ Product Manager - Digital Specialist Officer (IT)",
      "roles_responsibilities": "To understand digital products/enhancement requirements articulate the business requirement document clearly ensuring adequate controls, arrange necessary internal approvals, engage with product team for the implementation post required UAT and signoff. Derive insights from qualitative & quantitative data and use the same for product improvements and iterations. Monitor market trends and competitor products to identify opportunities for innovation. Work closely with cross-functional teams, including design, engineering, marketing, and sales. Ensure that digital products are user-friendly and meet customer expectations through user testing, feedback loops, and usability studies. Collaborate with UX/UI teams to create intuitive and seamless digital experiences. Support the team for optimal delivery and drive engagement with our customers and stakeholders Facilitate onboarding and integration for businesses and partners. Monitor various digital platforms performance, troubleshoot issues, and ensure uptime. Optimize network operations for scalability and efficiency and Coordinate with integration teams to solve technical and operational challenges. Continuous engagement with internal and external stakeholders to understand market requirement and re-engineer product and process to meet market requirement.",
      "grade_id": "0",
      "employment_type": "Full-Time",
      "eligibility_age_min": "24",
      "eligibility_age_max": "34",
      "mandatory_qualification": "Full Time B.E. / B. Tech in Computer Science/ Computer Applications/ Information Technology/ Electronics/ Electronics & Telecommunications/ Electronics & Communication/ Electronics & Instrumentation OR Full Time MCA from a University / Institution recognized by the Govt. of India/ Govt. bodies/ AICTE",
      "preferred_qualification": "Minimum -03- years experience in Technology Domain Knowledge related to Digital Channels in Scheduled Commercial Bank OR Technological / Fintech Companies with Banking Domain Knowledge related to Digital Channels OR Experience in working on projects for a Software development firm/ company preferably dealing with Banking applications/BFSI.",
      "mandatory_experience": "3",
      "preferred_experience": "2",
      "probation_period": 5,
      "documents_required": "The following documents in original together with a self-attested photocopy in support of the candidate’s eligibility and identity are to be invariably submitted at the time of interview failing which the candidate may not be permitted to appear for the interview. Non submission of requisite documents by the candidate at the time of interview will debar his candidature from further participation in the recruitment process. i. Printout of the valid GD/ Interview Call Letter ii. Valid system generated printout of the online application form iii. Proof of Date of Birth (Birth Certificate issued by the Competent Municipal Authority or SSLC/ Std. X Certificate with DOB) iv. Photo Identify Proof as indicated above. v. Individual Semester/Year wise Mark sheets & certificates for educational qualifications including the final degree/diploma certificate. Proper document from Board/ University for having declared the result has to be submitted. vi. Caste Certificate issued by competent authority, strictly in the prescribed format as stipulated by Government of India, in case of SC/ ST/OBC/EWS category candidates. (as enclosed in the Annexure III) vii. In case of candidates belonging to OBC category, certificate should specifically contain a clause that the candidate does not belong to creamy layer section excluded from the benefits of reservation for Other Backward Classes in Civil post & services under Government of India. OBC caste certificate containing the Non-creamy layer clause should be valid as on the date of interview if called for (issued within one year as on the date of advertisement). Caste Name mentioned in certificate should tally letter by letter with Central Government list / notification. viii. Disability certificate in prescribed format issued by the District Medical Board in case of Persons with Benchmark Disability category. If the candidate has used the services of a Scribe at the time of online examination, then the duly filled in details of the scribe in the prescribed format. ix. An Ex-serviceman candidate has to produce a copy of the Service or Discharge Book along with pension payment order and documentary proof of rank last / presently held (substantive as well as acting) at the time of interview. x. Person eligible for age relaxation under para 3.1 must produce a certificate from the District Magistrate to the effect that they are eligible for relief in terms of the Rehabilitation Package for 1984 Riot Affected Persons sanctioned by the Government and communicated vide Ministry of Finance, Dept. of Financial Services communication No.F.No.9/21/2006-IR dated 27.07.2007. xi. Candidates serving in Government / Quasi Govt offices/ Public Sector Undertakings (including Nationalised Banks and Financial Institutions) are required to produce a “No Objection Certificate” from their employer at the time of interview, in the absence of which their candidature will not be considered and travelling expenses, if any, otherwise admissible, will not be paid. xii. Persons falling in categories (ii), (iii), (iv) and (v) of Para 12 should produce a certificate of eligibility issued by the Govt. of India. xiii. Relevant documents in support of the work experience declared, including appointment letter, salary slip, relieving letter (wherever applicable), etc. xiv. Any other relevant documents in support of eligibility.",
      "min_credit_score": "",
      "no_of_vacancies": "7",
      "selection_procedure": "The selection process comprise of online test, psychometric test or any other test deemed suitable for further selection process followed by Group Discussion and/or Interview of candidates, qualifying in the online test. However, if the number of eligible applications received is large/less, then Bank reserves the right to change the shortlisting criteria/interview process. Bank may, at its discretion, consider conducting of Multiple Choice/Descriptive/ Psychometric Test / Group Discussion/Interviews or any other selection/shortlisting methodologies for the above position. Merely satisfying the eligibility norms does not entitle a candidate to be called for interview. Bank reserves the right to call only the requisite number of candidates for the interview after preliminary screening/short-listing with reference to the candidate’s qualification, suitability, experience etc.",
      "max_salary": "2500000",
      "min_salary": "2000000"
  },
  {
      // "requisition_id": "22b12a66-f1f2-46b4-8064-6dd529e03071",
      "position_title": "Senior Manager - Digital Product",
      "position_code": "JPOS-0004",
      "dept_id": "1",
      "country_id": "1",
      "state_id": "1",
      "city_id": "1",
      "location_id": "1",
      "description": "Senior Manager - Information Security",
      "roles_responsibilities": "Knowledge and experience in infrastructure services including Active Directory (AD), Email Solutions, Privileged Access Management (PIM), Proxy Solution, Firewalls and other perimeter devices. Knowledge of all aspects of Infrastructure security and management technologies including end-point security solutions (i.e. Anti-virus, Extended Detection & Response (XDR), Mobile Device Management (MDM), Network Access Control (NAC), Proxy etc.) Firewalls, Data Loss Prevention (DLP), Web Application Firewall (WAF), File Integrity Monitoring, Application Whitelisting, Database Activity Monitoring (DAM), Vulnerability Management and Penetration Testing (VAPT) and Security Information & Event Management (SIEM) Solution. Security requirements analysis and implementation for application threat modelling, application security test planning and co-ordination. Technical knowledge on Cyber Security Operations Centre (CSOC) and security monitoring tools. Perform Threat Intelligence activities on a regular basis. Monitor and Manage Threat Intelligence Platform, consume & manager threat feeds, alerting & work cyber threats and Indicators on Compromise (IOC). Defining & Reviewing the Rules, Policies, Reports and Dashboards as per audit compliance requirement / operational requirements. Assess the vulnerability of internal assets / devices by conducting vulnerability assessment & penetration testing at defined frequency / ad hoc basis and Security configuration reviews. Initiate mock-drill to identify gaps in overall security posture of solutions deployed in CSOC and subsequently closure of the identified gaps. Align / maintain all configured rules / policies of all solutions deployed in CSOC with MITRE Attack framework. Conduct the Cyber Crisis Management Plan (CCMP) meetings to impart awareness on cyber risks. Ability to perform security assessment of Web Application Firewall (WAF) to identify OWASP Top 10 related vulnerabilities. Conduct forensic analysis using forensic and log analysing tools. Customize / create dashboard and submission of Root Cause Analysis (RCA) for security incident. Asset Discovery and maintenance of integrated asset inventory. Perform architecture review for deployed solutions and propose / execute required changes as per bank’s requirement. Monitoring security posture of cloud deployments and advise measures to improve them. Experience in Threat Hunting and API Security",
      "grade_id": "2",
      "employment_type": "Full-Time",
      "eligibility_age_min": "27",
      "eligibility_age_max": "37",
      "mandatory_qualification": "Full Time B.E. / B. Tech in Computer Science/ Computer Applications/ Information Technology/ Electronics/ Electronics & Telecommunications/ Electronics & Communication/ Electronics & Instrumentation OR Full Time MCA from a University / Institution recognized by the Govt. of India/ Govt. bodies/ AICTE",
      "preferred_qualification": "Minimum -03- years experience in Technology Domain Knowledge related to Digital Channels in Scheduled Commercial Bank OR Technological / Fintech Companies with Banking Domain Knowledge related to Digital Channels OR Experience in working on projects for a Software development firm/ company preferably dealing with Banking applications/BFSI.",
      "mandatory_experience": "6",
      "preferred_experience": "5",
      "probation_period": 5,
      "documents_required": "The following documents in original together with a self-attested photocopy in support of the candidate’s eligibility and identity are to be invariably submitted at the time of interview failing which the candidate may not be permitted to appear for the interview. Non submission of requisite documents by the candidate at the time of interview will debar his candidature from further participation in the recruitment process. i. Printout of the valid GD/ Interview Call Letter ii. Valid system generated printout of the online application form iii. Proof of Date of Birth (Birth Certificate issued by the Competent Municipal Authority or SSLC/ Std. X Certificate with DOB) iv. Photo Identify Proof as indicated above. v. Individual Semester/Year wise Mark sheets & certificates for educational qualifications including the final degree/diploma certificate. Proper document from Board/ University for having declared the result has to be submitted. vi. Caste Certificate issued by competent authority, strictly in the prescribed format as stipulated by Government of India, in case of SC/ ST/OBC/EWS category candidates. (as enclosed in the Annexure III) vii. In case of candidates belonging to OBC category, certificate should specifically contain a clause that the candidate does not belong to creamy layer section excluded from the benefits of reservation for Other Backward Classes in Civil post & services under Government of India. OBC caste certificate containing the Non-creamy layer clause should be valid as on the date of interview if called for (issued within one year as on the date of advertisement). Caste Name mentioned in certificate should tally letter by letter with Central Government list / notification. viii. Disability certificate in prescribed format issued by the District Medical Board in case of Persons with Benchmark Disability category. If the candidate has used the services of a Scribe at the time of online examination, then the duly filled in details of the scribe in the prescribed format. ix. An Ex-serviceman candidate has to produce a copy of the Service or Discharge Book along with pension payment order and documentary proof of rank last / presently held (substantive as well as acting) at the time of interview. x. Person eligible for age relaxation under para 3.1 must produce a certificate from the District Magistrate to the effect that they are eligible for relief in terms of the Rehabilitation Package for 1984 Riot Affected Persons sanctioned by the Government and communicated vide Ministry of Finance, Dept. of Financial Services communication No.F.No.9/21/2006-IR dated 27.07.2007. xi. Candidates serving in Government / Quasi Govt offices/ Public Sector Undertakings (including Nationalised Banks and Financial Institutions) are required to produce a “No Objection Certificate” from their employer at the time of interview, in the absence of which their candidature will not be considered and travelling expenses, if any, otherwise admissible, will not be paid. xii. Persons falling in categories (ii), (iii), (iv) and (v) of Para 12 should produce a certificate of eligibility issued by the Govt. of India. xiii. Relevant documents in support of the work experience declared, including appointment letter, salary slip, relieving letter (wherever applicable), etc. xiv. Any other relevant documents in support of eligibility.",
      "min_credit_score": "",
      "no_of_vacancies": "6",
      "selection_procedure": "The selection process comprise of online test, psychometric test or any other test deemed suitable for further selection process followed by Group Discussion and/or Interview of candidates, qualifying in the online test. However, if the number of eligible applications received is large/less, then Bank reserves the right to change the shortlisting criteria/interview process. Bank may, at its discretion, consider conducting of Multiple Choice/Descriptive/ Psychometric Test / Group Discussion/Interviews or any other selection/shortlisting methodologies for the above position. Merely satisfying the eligibility norms does not entitle a candidate to be called for interview. Bank reserves the right to call only the requisite number of candidates for the interview after preliminary screening/short-listing with reference to the candidate’s qualification, suitability, experience etc.",
      "max_salary": "",
      "min_salary": ""
  },
  {
      // "requisition_id": "22b12a66-f1f2-46b4-8064-6dd529e03071",
      "position_title": "Fire Safety Officer",
      "position_code": "JPOS-0005",
      "dept_id": "3",
      "country_id": "1",
      "state_id": "1",
      "city_id": "1",
      "location_id": "1",
      "description": "Fire Safety Officer",
      "roles_responsibilities": "To work under the direct supervision & direction of the Zonal Security Officer and to report to the Central Security Department at BCC on all technical matters. To submit all periodical reports and returns related to the Fire Safety environment and submit all the reporting of fire incidents, reviews, and associated information to the Central Security Department through. To oversee enforcement of all instructions, directions and regulations in respect of Fire safety arrangements issued by the bank. To inspect various premises of the Bank under his jurisdiction as per periodicity fixed by the Bank. To carryout Fire audits of Branches, Offices, Currency Chests & high-rise buildings etc., as per Bank’s policy. Improving the Fire Prevention and protection system and Fire Safety norms at Branches / offices & also to strengthen fire safety arrangements of the Bank. Organize periodic Fire and Evacuation drills, lectures etc. for developing fire safety consciousness amongst employees. Ensure reduction in the number of fire related incidents due to safety lapses. To oversee enforcement of all instructions, directions and regulations in respect of Fire safety arrangements issued by the bank. Liaison with Govt. Agencies including Fire Service / Municipal Corporations / Civil Authorities etc. Any other work assigned from time to time",
      "grade_id": "0",
      "employment_type": "Full-Time",
      "eligibility_age_min": "22",
      "eligibility_age_max": "35",
      "mandatory_qualification": "Full Time B.E. / B. Tech in Computer Science/ Computer Applications/ Information Technology/ Electronics/ Electronics & Telecommunications/ Electronics & Communication/ Electronics & Instrumentation OR Full Time MCA from a University / Institution recognized by the Govt. of India/ Govt. bodies/ AICTE",
      "preferred_qualification": "Composite experience of minimum 01 year as Fire Officer or equivalent post in PSUs /PSBs /Central Gov./State Govt. / City Fire Brigade / State Fire Services / Fire safety in-charge in Corporate / Big Industrial Complex.",
      "mandatory_experience": "3",
      "preferred_experience": "3",
      "probation_period": 0,
      "documents_required": "The following documents in original together with a self-attested photocopy in support of the candidate’s eligibility and identity are to be invariably submitted at the time of interview failing which the candidate may not be permitted to appear for the interview. Non submission of requisite documents by the candidate at the time of interview will debar his candidature from further participation in the recruitment process. i. Printout of the valid GD/ Interview Call Letter ii. Valid system generated printout of the online application form iii. Proof of Date of Birth (Birth Certificate issued by the Competent Municipal Authority or SSLC/ Std. X Certificate with DOB) iv. Photo Identify Proof as indicated above. v. Individual Semester/Year wise Mark sheets & certificates for educational qualifications including the final degree/diploma certificate. Proper document from Board/ University for having declared the result has to be submitted. vi. Caste Certificate issued by competent authority, strictly in the prescribed format as stipulated by Government of India, in case of SC/ ST/OBC/EWS category candidates. (as enclosed in the Annexure III) vii. In case of candidates belonging to OBC category, certificate should specifically contain a clause that the candidate does not belong to creamy layer section excluded from the benefits of reservation for Other Backward Classes in Civil post & services under Government of India. OBC caste certificate containing the Non-creamy layer clause should be valid as on the date of interview if called for (issued within one year as on the date of advertisement). Caste Name mentioned in certificate should tally letter by letter with Central Government list / notification. viii. Disability certificate in prescribed format issued by the District Medical Board in case of Persons with Benchmark Disability category. If the candidate has used the services of a Scribe at the time of online examination, then the duly filled in details of the scribe in the prescribed format. ix. An Ex-serviceman candidate has to produce a copy of the Service or Discharge Book along with pension payment order and documentary proof of rank last / presently held (substantive as well as acting) at the time of interview. x. Person eligible for age relaxation under para 3.1 must produce a certificate from the District Magistrate to the effect that they are eligible for relief in terms of the Rehabilitation Package for 1984 Riot Affected Persons sanctioned by the Government and communicated vide Ministry of Finance, Dept. of Financial Services communication No.F.No.9/21/2006-IR dated 27.07.2007. xi. Candidates serving in Government / Quasi Govt offices/ Public Sector Undertakings (including Nationalised Banks and Financial Institutions) are required to produce a “No Objection Certificate” from their employer at the time of interview, in the absence of which their candidature will not be considered and travelling expenses, if any, otherwise admissible, will not be paid. xii. Persons falling in categories (ii), (iii), (iv) and (v) of Para 12 should produce a certificate of eligibility issued by the Govt. of India. xiii. Relevant documents in support of the work experience declared, including appointment letter, salary slip, relieving letter (wherever applicable), etc. xiv. Any other relevant documents in support of eligibility.",
      "min_credit_score": "",
      "no_of_vacancies": "14",
      "selection_procedure": "The selection process comprise of online test, psychometric test or any other test deemed suitable for further selection process followed by Group Discussion and/or Interview of candidates, qualifying in the online test. However, if the number of eligible applications received is large/less, then Bank reserves the right to change the shortlisting criteria/interview process. Bank may, at its discretion, consider conducting of Multiple Choice/Descriptive/ Psychometric Test / Group Discussion/Interviews or any other selection/shortlisting methodologies for the above position. Merely satisfying the eligibility norms does not entitle a candidate to be called for interview. Bank reserves the right to call only the requisite number of candidates for the interview after preliminary screening/short-listing with reference to the candidate’s qualification, suitability, experience etc.",
      "max_salary": "2500000",
      "min_salary": "2000000"
  },
  {
    // "requisition_id": "replace_with_generated_uuid_if_needed",
    "position_title": "Bank Teller",
    "position_code": "JPOS-0006",
    "dept_id": "2",
    "country_id": "1",
    "state_id": "1",
    "city_id": "1",
    "location_id": "1",
    "description": "Join one of India’s Largest Banks for a Challenging Assignment - Local Bank Officer",
    "roles_responsibilities": "Drive New-to-Bank (NTB) customer acquisition aggressively across all verticals – liabilities (CASA, deposits), retail assets (loans), wealth products, digital banking etc. Source new retail and other customers through field-level canvassing, direct sales, lead conversion, and tie-ups. Conduct door-to-door, workplace, and market-based sales activities to generate new business. Act as Relationship Manager for acquired customers to ensure product penetration, servicing, and retention. Achieve strict monthly and quarterly sales targets for all assigned product categories. Cross-sell bundled products such as debit cards, credit cards, insurance, SIPs, and digital onboarding at the time of acquisition. Promote Bank’s digital products and platforms, ensuring full activation and usage by customers. Continuously scout for high-potential prospects and local market opportunities to boost outreach. Collaborate with branch and backend teams for processing, documentation, and issue resolution Undertake regular follow-ups and field visits to close leads, collect documents, and enhance wallet share. Maintain comprehensive sales MIS, customer profiling, and performance dashboards. Comply with Bank’s internal control, KYC, AML, and regulatory guidelines during sourcing and onboarding. Participate in marketing campaigns, outreach drives, and third-party product activations. Perform any other duties and responsibilities as may be assigned by the Bank from time to time, including operational or administrative roles based on business needs.",
    "grade_id": "1",
    "employment_type": "Full-Time",
    "eligibility_age_min": "21",
    "eligibility_age_max": "30",
    "mandatory_qualification": "Graduation in any discipline from a recognized University / Institute {including Integrated Dual Degree (IDD)}. Professional qualifications in Chartered Accountant, Cost Accountant, Engineering, or Medical are also eligible.",
    "preferred_qualification": "Minimum 1 year of post-qualification experience as an officer in any Scheduled Commercial Bank or any Regional Rural Bank as listed in Second Schedule of Reserve Bank of India only. Experience in NBFCs, cooperative banks, Payment Banks, Small Finance Banks or fintechs will not be considered.",
    "mandatory_experience": "1",
    "preferred_experience": "1",
    "probation_period": 6,
    "documents_required": "The following documents in original together with a self-attested photocopy in support of the candidate’s eligibility and identity are to be invariably submitted at the time of interview failing which the candidate may not be permitted to appear for the interview. Non submission of requisite documents by the candidate at the time of interview will debar his candidature from further participation in the recruitment process. i. Printout of the valid GD/ Interview Call Letter ii. Valid system generated printout of the online application form iii. Proof of Date of Birth (Birth Certificate issued by the Competent Municipal Authority or SSLC/ Std. X Certificate with DOB) iv. Photo Identify Proof as indicated above. v. Individual Semester/Year wise Mark sheets & certificates for educational qualifications including the final degree/diploma certificate. Proper document from Board/ University for having declared the result has to be submitted. vi. Caste Certificate issued by competent authority, strictly in the prescribed format as stipulated by Government of India, in case of SC/ ST/OBC/EWS category candidates. (as enclosed in the Annexure III) vii. In case of candidates belonging to OBC category, certificate should specifically contain a clause that the candidate does not belong to creamy layer section excluded from the benefits of reservation for Other Backward Classes in Civil post & services under Government of India. OBC caste certificate containing the Non-creamy layer clause should be valid as on the date of interview if called for (issued within one year as on the date of advertisement). Caste Name mentioned in certificate should tally letter by letter with Central Government list / notification. viii. Disability certificate in prescribed format issued by the District Medical Board in case of Persons with Benchmark Disability category. If the candidate has used the services of a Scribe at the time of online examination, then the duly filled in details of the scribe in the prescribed format. ix. An Ex-serviceman candidate has to produce a copy of the Service or Discharge Book along with pension payment order and documentary proof of rank last / presently held (substantive as well as acting) at the time of interview. x. Person eligible for age relaxation under para 3.1 must produce a certificate from the District Magistrate to the effect that they are eligible for relief in terms of the Rehabilitation Package for 1984 Riot Affected Persons sanctioned by the Government and communicated vide Ministry of Finance, Dept. of Financial Services communication No.F.No.9/21/2006-IR dated 27.07.2007. xi. Candidates serving in Government / Quasi Govt offices/ Public Sector Undertakings (including Nationalised Banks and Financial Institutions) are required to produce a “No Objection Certificate” from their employer at the time of interview, in the absence of which their candidature will not be considered and travelling expenses, if any, otherwise admissible, will not be paid. xii. Persons falling in categories (ii), (iii), (iv) and (v) of Para 12 should produce a certificate of eligibility issued by the Govt. of India. xiii. Relevant documents in support of the work experience declared, including appointment letter, salary slip, relieving letter (wherever applicable), etc. xiv. Any other relevant documents in support of eligibility.",
    "min_credit_score": "800",
    "no_of_vacancies": "95",
    "selection_procedure": "The selection process comprise of online test, psychometric test or any other test deemed suitable for further selection process followed by Group Discussion and/or Interview of candidates, qualifying in the online test. However, if the number of eligible applications received is large/less, then Bank reserves the right to change the shortlisting criteria/interview process. Bank may, at its discretion, consider conducting of Multiple Choice/Descriptive/ Psychometric Test / Group Discussion/Interviews or any other selection/shortlisting methodologies for the above position. Merely satisfying the eligibility norms does not entitle a candidate to be called for interview. Bank reserves the right to call only the requisite number of candidates for the interview after preliminary screening/short-listing with reference to the candidate’s qualification, suitability, experience etc.",
    "max_salary": "",
    "min_salary": ""
  },
  {
    // "requisition_id": "replace_with_generated_uuid_if_needed",
    "position_title": "Bank Manager",
    "position_code": "JPOS-0007",
    "dept_id": "1",
    "country_id": "1",
    "state_id": "1",
    "city_id": "1",
    "location_id": "1",
    "description": "Senior Manager - Information Security",
    "roles_responsibilities": "Knowledge and experience in infrastructure services including Active Directory (AD), Email Solutions, Privileged Access Management (PIM), Proxy Solution, Firewalls and other perimeter devices. Knowledge of all aspects of Infrastructure security and management technologies including end-point security solutions (i.e. Anti-virus, Extended Detection & Response (XDR), Mobile Device Management (MDM), Network Access Control (NAC), Proxy etc.) Firewalls, Data Loss Prevention (DLP), Web Application Firewall (WAF), File Integrity Monitoring, Application Whitelisting, Database Activity Monitoring (DAM), Vulnerability Management and Penetration Testing (VAPT) and Security Information & Event Management (SIEM) Solution. Security requirements analysis and implementation for application threat modelling, application security test planning and co-ordination. Technical knowledge on Cyber Security Operations Centre (CSOC) and security monitoring tools. Perform Threat Intelligence activities on a regular basis. Monitor and Manage Threat Intelligence Platform, consume & manager threat feeds, alerting & work cyber threats and Indicators on Compromise (IOC). Defining & Reviewing the Rules, Policies, Reports and Dashboards as per audit compliance requirement / operational requirements. Assess the vulnerability of internal assets / devices by conducting vulnerability assessment & penetration testing at defined frequency / ad hoc basis and Security configuration reviews. Initiate mock-drill to identify gaps in overall security posture of solutions deployed in CSOC and subsequently closure of the identified gaps. Align / maintain all configured rules / policies of all solutions deployed in CSOC with MITRE Attack framework. Conduct the Cyber Crisis Management Plan (CCMP) meetings to impart awareness on cyber risks. Ability to perform security assessment of Web Application Firewall (WAF) to identify OWASP Top 10 related vulnerabilities. Conduct forensic analysis using forensic and log analysing tools. Customize / create dashboard and submission of Root Cause Analysis (RCA) for security incident. Asset Discovery and maintenance of integrated asset inventory. Perform architecture review for deployed solutions and propose / execute required changes as per bank’s requirement. Monitoring security posture of cloud deployments and advise measures to improve them. Experience in Threat Hunting and API Security",
    "grade_id": "1",
    "employment_type": "Full-Time",
    "eligibility_age_min": "27",
    "eligibility_age_max": "37",
    "mandatory_qualification": "Full Time B.E. / B. Tech in Computer Science/ Computer Applications/ Information Technology/ Electronics/ Electronics & Telecommunications/ Electronics & Communication/ Electronics & Instrumentation OR Full Time MCA from a University / Institution recognized by the Govt. of India/ Govt. bodies/ AICTE",
    "preferred_qualification": "Minimum -06- years experience in Technology Domain Knowledge related to Digital Channels in Scheduled Commercial Bank OR Technological / Fintech Companies with Banking Domain Knowledge related to Digital Channels OR Experience in working on projects for a Software development firm/ company preferably dealing with Banking applications/BFSI.",
    "mandatory_experience": "6",
    "preferred_experience": "5",
    "probation_period": 5,
    "documents_required": "The following documents in original together with a self-attested photocopy in support of the candidate’s eligibility and identity are to be invariably submitted at the time of interview failing which the candidate may not be permitted to appear for the interview. Non submission of requisite documents by the candidate at the time of interview will debar his candidature from further participation in the recruitment process. i. Printout of the valid GD/ Interview Call Letter ii. Valid system generated printout of the online application form iii. Proof of Date of Birth (Birth Certificate issued by the Competent Municipal Authority or SSLC/ Std. X Certificate with DOB) iv. Photo Identify Proof as indicated above. v. Individual Semester/Year wise Mark sheets & certificates for educational qualifications including the final degree/diploma certificate. Proper document from Board/ University for having declared the result has to be submitted. vi. Caste Certificate issued by competent authority, strictly in the prescribed format as stipulated by Government of India, in case of SC/ ST/OBC/EWS category candidates. (as enclosed in the Annexure III) vii. In case of candidates belonging to OBC category, certificate should specifically contain a clause that the candidate does not belong to creamy layer section excluded from the benefits of reservation for Other Backward Classes in Civil post & services under Government of India. OBC caste certificate containing the Non-creamy layer clause should be valid as on the date of interview if called for (issued within one year as on the date of advertisement). Caste Name mentioned in certificate should tally letter by letter with Central Government list / notification. viii. Disability certificate in prescribed format issued by the District Medical Board in case of Persons with Benchmark Disability category. If the candidate has used the services of a Scribe at the time of online examination, then the duly filled in details of the scribe in the prescribed format. ix. An Ex-serviceman candidate has to produce a copy of the Service or Discharge Book along with pension payment order and documentary proof of rank last / presently held (substantive as well as acting) at the time of interview. x. Person eligible for age relaxation under para 3.1 must produce a certificate from the District Magistrate to the effect that they are eligible for relief in terms of the Rehabilitation Package for 1984 Riot Affected Persons sanctioned by the Government and communicated vide Ministry of Finance, Dept. of Financial Services communication No.F.No.9/21/2006-IR dated 27.07.2007. xi. Candidates serving in Government / Quasi Govt offices/ Public Sector Undertakings (including Nationalised Banks and Financial Institutions) are required to produce a “No Objection Certificate” from their employer at the time of interview, in the absence of which their candidature will not be considered and travelling expenses, if any, otherwise admissible, will not be paid. xii. Persons falling in categories (ii), (iii), (iv) and (v) of Para 12 should produce a certificate of eligibility issued by the Govt. of India. xiii. Relevant documents in support of the work experience declared, including appointment letter, salary slip, relieving letter (wherever applicable), etc. xiv. Any other relevant documents in support of eligibility.",
    "min_credit_score": "800",
    "no_of_vacancies": "6",
    "selection_procedure": "The selection process comprise of online test, psychometric test or any other test deemed suitable for further selection process followed by Group Discussion and/or Interview of candidates, qualifying in the online test. However, if the number of eligible applications received is large/less, then Bank reserves the right to change the shortlisting criteria/interview process. Bank may, at its discretion, consider conducting of Multiple Choice/Descriptive/ Psychometric Test / Group Discussion/Interviews or any other selection/shortlisting methodologies for the above position. Merely satisfying the eligibility norms does not entitle a candidate to be called for interview. Bank reserves the right to call only the requisite number of candidates for the interview after preliminary screening/short-listing with reference to the candidate’s qualification, suitability, experience etc.",
    "max_salary": "",
    "min_salary": ""
  },
]

const JobCreation = ({ editRequisitionId, showModal, onClose, editPositionId, onUpdateSuccess, readOnly: readOnlyProp }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const requisitionId = location.state?.requisitionId || "";
  const fileInputRef = useRef(null);
  const [selectedOption, setSelectedOption] = useState('direct');
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [jsonData, setJsonData] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedReqIndex, setSelectedReqIndex] = useState(null);
  const [reqs, setReqs] = useState([]);
  const [filteredStates, setFilteredStates] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const initialState = {
    requisition_id: '',
    position_title: '',
    dept_id: '',
    country_id: '',
    state_id: '',
    city_id: '',
    location_id: '',
    description: '',
    roles_responsibilities: '',
    grade_id: '',
    employment_type: '',
    eligibility_age_min: '',
    eligibility_age_max: '',
    mandatory_qualification: '',
    preferred_qualification: '',
    mandatory_experience: '',
    preferred_experience: '',
    probation_period: 0,
    documents_required: '',
    min_credit_score: '',
    no_of_vacancies: '',
    selection_procedure: '',
    max_salary: '',
    min_salary: '',
    // special_cat_id: '0',
    // reservation_cat_id:'0',
    // position_status:'submitted'
  };

  const [formData, setFormData] = useState(initialState);
  const [masterData, setMasterData] = useState({
    requisitionIdOptions: [],
    positionTitleOptions: [],
    departmentOptions: [],
    countryOptions: [],
    stateOptions: [],
    cityOptions: [],
    locationOptions: [],
    gradeIdOptions: [],
    employmentTypeOptions: ["Full-Time", "Part-Time", "Contract"],
    mandatoryQualificationOptions: [],
    preferredQualificationOptions: [],
    allCountries: [],
    allStates: [],
    allCities: [],
    allLocations: [],
  });

  const [loading, setLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  const [readOnly, setReadOnly] = useState(readOnlyProp ?? false);

  useEffect(() => {
    if (requisitionId) {
      setFormData((prev) => ({
        ...prev,
        requisition_id: requisitionId
      }));
    }
  }, [requisitionId]);

  useEffect(() => {
    // If no modal is passed, assume direct navigation → editable
    if (!showModal) {
      setReadOnly(false);
    } else {
      setReadOnly(readOnlyProp ?? false);
    }
  }, [showModal, readOnlyProp]);

  useEffect(() => {
    const fetchAllMasterData = async () => {
      setLoading(true);
      setDataError(null);
      try {
        const [masterDataRes, requisitionDataRes] = await Promise.all([
          apiService.getMasterData(),
          apiService.getReqData()
        ]);

        console.log('Master Data Response:', masterDataRes);
       console.log('Requisition Data Response:', requisitionDataRes);
        // const staticJobGrades = [
        //   { job_grade_id: 1, job_scale: "S1","min_salary":20000, "max_salary": 30000 },
        //   { job_grade_id: 2, job_scale: "S2" ,"min_salary":20000, "max_salary": 30000}
        // ];
        const jobGrades = masterDataRes.job_grade_data;

        setMasterData({
          requisitionIdOptions: (requisitionDataRes.data || [])
          .filter(req => {
            if (readOnly) return true;
            return req.requisition_status === "New";
          })
          .map(req => ({
            id: req.requisition_id,
            name: req.requisition_code
          })),
          positionTitleOptions: (masterDataRes.position_title || []).map(name => ({ id: name, name })),
          departmentOptions: masterDataRes.departments,
          // countryOptions: masterDataRes.countries,
          // stateOptions: masterDataRes.states,
          // cityOptions: masterDataRes.cities,
          // locationOptions: masterDataRes.locations,
          allCountries: masterDataRes.countries,
          allStates: masterDataRes.states,
          allCities: masterDataRes.cities,
          allLocations: masterDataRes.locations,
          gradeIdOptions: jobGrades.map(grade => ({
            id: grade.job_grade_id,
            name: `${grade.job_scale} (${grade.min_salary} - ${grade.max_salary})`
          })),
          allGrades: jobGrades,
          
          employmentTypeOptions: ((masterDataRes.employment_type && masterDataRes.employment_type.length > 0)
            ? masterDataRes.employment_type
            : ["Full-Time", "Part-Time", "Contract"]
          ).map(type => ({ id: type, name: type })),
          mandatoryQualificationOptions: (masterDataRes.mandatory_qualification || []).map(q => ({ id: q, name: q })),
          preferredQualificationOptions: (masterDataRes.preferred_qualification || []).map(q => ({ id: q, name: q })),
        });
        setReqs(requisitionDataRes.data.filter(req => {
            if (readOnly) return true;
            return req.requisition_status === "New";
          }) || []);
      } catch (err) {
        console.error('Failed to fetch master data:', err);
        setDataError('Failed to fetch master data.');
      } finally {
        setLoading(false);
      }
    };
    fetchAllMasterData();
  }, []);

  useEffect(() => {
    if (editPositionId) {

      apiService.getByPositionId(editPositionId).then((response) => {

        const selectedPosition = response.data || [];
      console.log('Selected Position:', selectedPosition);

     // console.log('All Positions:', allPositions);
        // ✅ Pick the exact position using position_id

        // const selectedPosition = allPositions.find(

        //   (item) => item.position_id === editPositionId

        // );


        if (selectedPosition) {

          setFormData({

            requisition_id: selectedPosition.requisition_id || '',
            position_id:editPositionId || '',
            position_title: selectedPosition.position_title || '',
            dept_id: selectedPosition.dept_id || '',
            country_id: selectedPosition.country_id || '',
            state_id: selectedPosition.state_id || '',
            city_id: selectedPosition.city_id || '',
            location_id: selectedPosition.location_id || '',
            description: selectedPosition.description || '',
            roles_responsibilities: selectedPosition.roles_responsibilities || '',
            grade_id: selectedPosition.grade_id.toLocaleString() || '',
            employment_type: selectedPosition.employment_type || '',
            eligibility_age_min: selectedPosition.eligibility_age_min || '',
            eligibility_age_max: selectedPosition.eligibility_age_max || '',
            mandatory_qualification: selectedPosition.mandatory_qualification || '',
            preferred_qualification: selectedPosition.preferred_qualification || '',
            mandatory_experience: selectedPosition.mandatory_experience || '',
            preferred_experience: selectedPosition.preferred_experience || '',
            probation_period: selectedPosition.probation_period || 0,
            documents_required: selectedPosition.documents_required || '',
            min_credit_score: selectedPosition.min_credit_score || '',
            no_of_vacancies: selectedPosition.no_of_vacancies || '',
            selection_procedure: selectedPosition.selection_procedure || '',
            min_salary: selectedPosition.min_salary || '',
            max_salary: selectedPosition.max_salary || '',
            // job_application_fee_id: selectedPosition.job_application_fee_id || '',

          });
          const states = masterData.allStates.filter(
    (s) => s.country_id === Number(selectedPosition.country_id)
  );
  setFilteredStates(states);

  // 2. Filter cities for the selected state
  const cities = masterData.allCities.filter(
    (c) => c.state_id === Number(selectedPosition.state_id)
  );
  setFilteredCities(cities);

  // 3. Filter locations for the selected city
  const locations = masterData.allLocations.filter(
    (l) => l.city_id === Number(selectedPosition.city_id)
  );
  setFilteredLocations(locations);

          // setFormData((prev) => ({
          //   ...prev,
          //   position_id:editPositionId
          // }));
        }

      });

    }

  }, [ editPositionId, masterData]);
const handleInputChange = (e) => {
  const { name, value } = e.target;
 // console.log('Input change:', name, value);
  setFormData((prev) => ({ ...prev, [name]: value }));
 // ✅ Clear error for this field when it's valid
  setErrors((prev) => ({
    ...prev,
    [name]: value ? "" : prev[name]
  }));
  if (name === "grade_id" && value !== '0') {
     setFormData((prev) => ({
        ...prev,
        min_salary: "",
        max_salary: ""
      }));
  }
  if (name === "country_id") {
    // Convert the value to a number since IDs are numbers
    const countryId = Number(value); 
    console.log('Selected country ID:', countryId);
    if (countryId) {
      // Filter states based on the countryId
      console.log('All states:', masterData.allStates);
      const states = masterData.allStates.filter(
        (s) => s.country_id === countryId
      );
      setFilteredStates(states);
    } else {
      // If no country is selected, clear the dependent dropdowns
      setFilteredStates([]);
    }

    // Reset subsequent form fields and dropdowns
    setFormData((prev) => ({
      ...prev,
      state_id: "",
      city_id: "",
      location_id: "",
    }));
    setFilteredCities([]);
    setFilteredLocations([]);

  } else if (name === "state_id") {
    // Convert the value to a number since IDs are numbers
    const stateId = Number(value); 

    if (stateId) {
      // Filter cities where the state_id matches the selected state's ID
      const cities = masterData.allCities.filter(
        (c) => c.state_id === stateId
      );
      setFilteredCities(cities);
    } else {
      setFilteredCities([]);
    }

    // Reset subsequent form fields and dropdowns
    setFormData((prev) => ({
      ...prev,
      city_id: "",
      location_id: "",
    }));
    setFilteredLocations([]);

  } else if (name === "city_id") {
    // Convert the value to a number since IDs are numbers
    const cityId = Number(value);

    if (cityId) {
      // Filter locations where the city_id matches the selected city's ID
      const locations = masterData.allLocations.filter(
        (l) => l.city_id === cityId
      );
      setFilteredLocations(locations);
    } else {
      setFilteredLocations([]);
    }

    // Reset the final form field
    setFormData((prev) => ({
      ...prev,
      location_id: "",
    }));
  }
};
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length === 0) {
      try {
        let response;
        if (!showModal) {
          response = await apiService.jobCreation(formData);
          navigate("/job-postings");
        } else {
          console.log('Updating job with form data:', formData);
          response = await apiService.updateJob(formData);
          onClose();
          if (onUpdateSuccess) onUpdateSuccess(); // 🔥 notify parent
        }
        console.log('✅ Valid form data:', formData);
        console.log('✅ API response:', response);
        setFormData(initialState);
        setErrors({});

        toast.success(showModal ? 'Job updated successfully!' : 'Job created successfully!');
        setFormData(initialState);
        navigate('/job-postings');
      } catch (error) {
        console.error('❌ API error:', error);
        toast.error(showModal ? 'Failed to update job.' : 'Failed to create job.');
      }
    } else {
      setErrors(validationErrors);
    }
  };

  const handleCancel = () => {
    setFormData(initialState);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.requisition_id) newErrors.requisition_id = 'Requisition ID is required';
    if (!formData.position_title.trim()) newErrors.position_title = 'Position Title is required';
    if (!formData.dept_id) newErrors.dept_id = 'Department is required';
   // if (!formData.country_id) newErrors.country_id = 'Country is required';
   // if (!formData.state_id) newErrors.state_id = 'State is required';
   // if (!formData.city_id) newErrors.city_id = 'City is required';
   // if (!formData.location_id) newErrors.location_id = 'Location is required';
    //if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.roles_responsibilities.trim()) newErrors.roles_responsibilities = 'Roles & Responsibilities are required';
    if (!formData.grade_id) newErrors.grade_id = 'Grade ID is required';
    if (!formData.employment_type) newErrors.employment_type = 'Employment Type is required';
    if (!formData.eligibility_age_min || isNaN(formData.eligibility_age_min) || Number(formData.eligibility_age_min) <= 0) newErrors.eligibility_age_min = 'Min Age is required and must be a positive number';
    if (!formData.eligibility_age_max || isNaN(formData.eligibility_age_max) || Number(formData.eligibility_age_max) <= 0) newErrors.eligibility_age_max = 'Max Age is required and must be a positive number';

    //  if (!formData.min_salary || isNaN(formData.min_salary) || Number(formData.min_salary) <= 0) newErrors.min_salary = 'Min Age is required and must be a positive number';
    // if (!formData.max_salary || isNaN(formData.max_salary) || Number(formData.max_salary) <= 0) newErrors.max_salary = 'Max Age is required and must be a positive number';

    if (!formData.mandatory_qualification) newErrors.mandatory_qualification = 'Mandatory Qualification is required';
    //if (!formData.preferred_qualification) newErrors.preferred_qualification = 'Preferred Qualification is required';
    if (!formData.mandatory_experience || isNaN(formData.mandatory_experience) || Number(formData.mandatory_experience) <= 0) newErrors.mandatory_experience = 'Mandatory Experience is required and must be a positive number';
    //if (!formData.preferred_experience || isNaN(formData.preferred_experience) || Number(formData.preferred_experience) <= 0) newErrors.preferred_experience = 'Preferred Experience is required and must be a positive number';
    //if (!formData.probation_period || isNaN(formData.probation_period) || Number(formData.probation_period) <= 0) {newErrors.probation_period = 'Probation Period is required and must be a positive number';}
    if (!formData.documents_required.trim()) newErrors.documents_required = 'Documents Required is required';
    //if (!String(formData.min_credit_score ?? '').trim()) newErrors.min_credit_score = 'Min Credit Score is required';
    if (!formData.no_of_vacancies || isNaN(formData.no_of_vacancies) || Number(formData.no_of_vacancies) <= 0) newErrors.no_of_vacancies = 'Number of Positions is required and must be a positive number';
    //if (!formData.selection_procedure || !formData.selection_procedure.trim()) newErrors.selection_procedure = 'Selection Process is required';
     if (
    formData.preferred_experience !== '' &&
    formData.preferred_experience !== null &&
    formData.preferred_experience !== undefined &&
    (isNaN(formData.preferred_experience) || Number(formData.preferred_experience) <= 0)
  ) {
    newErrors.preferred_experience = 'Preferred Experience must be a positive number';
  }
  if (
    formData.probation_period !== '' &&
    formData.probation_period !== null &&
    formData.probation_period !== undefined &&
    (isNaN(formData.probation_period) || Number(formData.probation_period) < 0)
  ) {
    newErrors.probation_period = 'Probation Period must be a positive number';
  }
  if (
    formData.min_credit_score !== '' &&
    formData.min_credit_score !== null &&
    formData.min_credit_score !== undefined &&
    isNaN(formData.min_credit_score)
  ) {
    newErrors.min_credit_score = 'Min Credit Score must be a number';
  }
  if (formData.grade_id === '0') {
    // Validate min_salary when grade is 'Others'
    if (!formData.min_salary || isNaN(formData.min_salary) || Number(formData.min_salary) <= 0) {
      newErrors.min_salary = 'Minimum salary is required and must be a positive number';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.min_salary)) {
      newErrors.min_salary = 'Please enter a valid salary amount (e.g., 25000 or 25000.50)';
    }

    // Validate max_salary when grade is 'Others'
    if (!formData.max_salary || isNaN(formData.max_salary) || Number(formData.max_salary) <= 0) {
      newErrors.max_salary = 'Maximum salary is required and must be a positive number';
    } else if (!/^\d+(\.\d{1,2})?$/.test(formData.max_salary)) {
      newErrors.max_salary = 'Please enter a valid salary amount (e.g., 50000 or 50000.50)';
    }

    // Additional validation to ensure max_salary is not less than min_salary
    if (formData.min_salary && formData.max_salary && 
        Number(formData.max_salary) < Number(formData.min_salary)) {
      newErrors.max_salary = 'Maximum salary cannot be less than minimum salary';
    }
  }
  return newErrors;
  };

  const handleFileChange = (e) => {
    const newErrors = {};
    const selectedFiles = Array.from(e.target.files);
    const validExtensions = ['.xls', '.xlsx'];
    const validFiles = selectedFiles.filter(file => validExtensions.includes(file.name.slice(file.name.lastIndexOf('.')).toLowerCase()));
    if (validFiles.length !== selectedFiles.length) {
      newErrors.file = "Only Excel files (.xls, .xlsx) are allowed.";
    } else {
      delete newErrors.file;
    }
    setErrors(newErrors);
    setFiles([...files, ...validFiles]);
    validFiles.forEach(file => readExcel(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...droppedFiles]);
      droppedFiles.forEach(file => readExcel(file));
    }
  };

  const handleDragOver = (e) => e.preventDefault();
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const convertKeysToSnakeCase = (dataArray = []) => {
  return dataArray.map((raw) => {
    const item = { ...raw };

    // Normalize/parse Grade ID safely
    const gradeIdNum = Number(
      (item["Grade ID"] ?? item.grade_id ?? "").toString().trim()
    );

    // Helpers to coerce numeric fields
    const asNumberOrZero = (v) =>
      v === "" || v == null ? 0 : Number(v);

    const minSalary =
      gradeIdNum === 0 ? asNumberOrZero(item["Min Salary"]) : null;

    const maxSalary =
      gradeIdNum === 0 ? asNumberOrZero(item["Max Salary"]) : null;

    return {
      requisition_id: item["Requisition ID"] ?? null,
      position_title: item["Position Title"] ?? null,
      dept_id: item["Department"] ?? null,
      country_id: item["Country"] ?? null,
      state_id: item["State"] ?? null,
      city_id: item["City"] ?? null,
      location_id: item["Location"] ?? null,
      description: item["Description"] ?? null,
      roles_responsibilities: item["Roles & Responsibilities"] ?? null,
      grade_id: isNaN(gradeIdNum) ? null : gradeIdNum, // store as number
      employment_type: item["Employment Type"] ?? null,
      eligibility_age_min: item["Eligibility Age Min"] ?? null,
      eligibility_age_max: item["Eligibility Age Max"] ?? null,
      mandatory_qualification: item["Mandatory Qualification"] ?? null,
      preferred_qualification: item["Preferred Qualification"] ?? null,
      mandatory_experience: item["Mandatory Experience"] ?? null,
      preferred_experience: item["Preferred Experience"] ?? null,
      probation_period: item["Probation Period"] ?? null,
      documents_required: item["Documents Required"] ?? null,
      no_of_vacancies: item["Number of Vacancies"] ?? null,
      selection_procedure: item["Selection Procedure"] ?? null,
      min_credit_score: item["Min Credit Score"] ?? null,
      min_salary: minSalary,
      max_salary: maxSalary,
    };
  });
};



  const readExcel = async (file) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      const validRows = [];
      const errorList = [];
      for (let i = 0; i < rows.length; i++) {
        try {
          const validated = await jobSchema.validate(rows[i], { abortEarly: false });
          validRows.push(validated);
        } catch (err) {
          errorList.push({ row: i + 2, messages: err.errors });
        }
      }
      setErrors(errorList);
      console.log("Valid rows from Excel:", validRows);
      const formattedData = convertKeysToSnakeCase(validRows);
      setJsonData(formattedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUploadSubmit = async () => {
    if (files.length === 0) {
      setErrors(prev => ({ ...prev, file: "Please upload at least one Excel file." }));
      return;
    }
    if (errors && Array.isArray(errors) && errors.length > 0) {
      toast.error("Please fix validation errors before submitting.");
      return;
    }
    if (!jsonData || jsonData.length === 0) {
      toast.error("No valid data to submit.");
      return;
    }
    try {
      let dataToUpload = jsonData;
      console.log('Selected Requisition Index:', dataToUpload);
      if (selectedReqIndex !== null && selectedReqIndex !== "" && reqs[selectedReqIndex]) {
        const selectedReqId = reqs[selectedReqIndex].requisition_id;
        dataToUpload = jsonData.map(obj => ({ ...obj, requisition_id: selectedReqId }));
      }
      dataToUpload = dataToUpload.map(obj => {
        const matchedPosition = staticPositions.find(
          pos => pos.position_title === obj.position_title
        );

        return {
          ...obj,
          position_code: matchedPosition ? matchedPosition.position_code : null, // fallback if not found
        };
      });
      console.log('Posting Excel data:', dataToUpload);
      await apiService.uploadJobExcel(dataToUpload);
      setShowUploadModal(false);
      toast.success("Excel data posted successfully!");
      setFiles([]);
      setJsonData([]);
      navigate('/job-postings');
    } catch (error) {
      toast.error("Failed to post Excel data.");
      console.error("Error posting Excel data:", error);
    }
  };

  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
         {editPositionId == null && (
            <div className="d-flex justify-content-between align-items-center mb-3 mx-2 buttons_div">
              <Button
                variant="outline-secondary"
                onClick={() => navigate("/job-postings")}
                style={{
                  padding: "6px 15px",
                  fontSize: "13px",
                  fontWeight: "400",
                  borderRadius: "6px"
                }}
              >
                ← Back
              </Button>
              <div>
                <h5 className='px-2' style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '16px', color: '#FF7043', marginBottom: '0px' }}>Job Creation</h5>
              </div>
              <div className='d-flex gap-3'>
                <a className='downlaodfile'
                  href="/JobCreationTemplate.xlsx"
                  style={{
                    border: "1px solid #FF7043",
                    backgroundColor: "transparent",
                    color: "#FF7043",
                    padding: "8px 15px",
                    borderRadius: "6px",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    minWidth: 0,
                    minHeight: 0,
                    whiteSpace: "nowrap",
                    fontSize: "13px",
                    fontWeight: "400",
                    right: "10px",
                    position: "relative",
                  }}
                >
                  <FontAwesomeIcon icon={faDownload} style={{ color: "#FF7043", fontSize: "1rem" }} />&nbsp;
                  <span> Download Bulk Template</span>
                </a>
                <Button className='uploadfile'
                  variant="uploadfile outline-primary"
                  onClick={() => setShowUploadModal(true)}
                  style={{
                    borderColor: "#FF7043",
                    color: "#FF7043",
                    padding: "8px 15px",
                    display: "inline-flex",
                    alignItems: "center",
                    minWidth: 0,
                    minHeight: 0,
                    fontSize: "13px",
                    fontWeight: "400",
                    right: "10px",
                    position: "relative",
                  }}
                >
                  <FontAwesomeIcon icon={faUpload} style={{ color: "#FF7043", fontSize: "1rem" }} /> &nbsp;
              <span> Upload Bulk Jobs</span>
                </Button>
              </div>
            </div>
            )}
            {selectedOption === 'direct' && (
              <JobCreationForm
                formData={formData}
                errors={errors}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                handleCancel={handleCancel}
                requisitionIdOptions={masterData.requisitionIdOptions}
                departmentOptions={masterData.departmentOptions}
                countryOptions={masterData.allCountries.map(c => ({ id: c.country_id, name: c.country_name }))}
                stateOptions={filteredStates.map(s => ({ id: s.state_id, name: s.state_name }))}
                cityOptions={filteredCities.map(c => ({ id: c.city_id, name: c.city_name }))}
                locationOptions={filteredLocations.map(l => ({ id: l.location_id, name: l.location_name }))}
                gradeIdOptions={masterData.gradeIdOptions}
                positionTitleOptions={masterData.positionTitleOptions}
                employmentTypeOptions={masterData.employmentTypeOptions}
                mandatoryQualificationOptions={masterData.mandatoryQualificationOptions}
                preferredQualificationOptions={masterData.preferredQualificationOptions}
                requisitionData={reqs}
                gradeMeta={masterData.allGrades}
                readOnly={readOnly}
                positionList={staticPositions}
              />
            )}
          
        </Col>
      </Row>
      <Modal className='fontss' show={showUploadModal} onHide={() => setShowUploadModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className='fonall'>Bulk Job Creation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="upload-section fontss">
            <div className="popform">
              <Form.Group className="mb-2 job-form">
                <Form.Label className="small mb-1 d-flex align-items-center fontss" style={{ gap: '0.4em' }}>
                  Select Requisition
                  {typeof selectedReqIndex === 'number' && reqs[selectedReqIndex] && (
                    <OverlayTrigger
                      trigger="click"
                      placement="right"
                      rootClose
                      overlay={
                        <Popover id="modal-requisition-popover" style={{ minWidth: 250 }}>
                          <Popover.Header as="h3" style={{ fontSize: '1rem' }}>
                            {reqs[selectedReqIndex].requisition_code || reqs[selectedReqIndex].requisition_title || 'Requisition Details'}
                          </Popover.Header>
                          <Popover.Body style={{ fontSize: '0.85rem' }}>
                            <div><strong>Position Title:</strong> {reqs[selectedReqIndex].requisition_title || '-'}</div>
                            <div><strong>Number of positions:</strong> {reqs[selectedReqIndex].no_of_positions || '-'}</div>
                            <div><strong>Start date:</strong> {reqs[selectedReqIndex].registration_start_date || '-'}</div>
                            <div><strong>End date:</strong> {reqs[selectedReqIndex].registration_end_date || '-'}</div>
                            {/* Add more fields as needed */}
                          </Popover.Body>
                        </Popover>
                      }
                    >
                      <span style={{ display: 'inline-block', cursor: 'pointer' }}>
                        <FontAwesomeIcon
                          icon={faInfoCircle}
                          className="text-info"
                          style={{ fontSize: '1.1em' }}
                          tabIndex={0}
                        />
                      </span>
                    </OverlayTrigger>
                  )}
                </Form.Label>
                <Form.Select
                  size="sm"
                  value={selectedReqIndex === null ? "" : selectedReqIndex}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedReqIndex(val === "" ? null : Number(val));
                  }}
                  style={{ maxWidth: "300px" }}
                  className='fw-300'
                >
                  <option value="">Select Requisition</option>
                  {reqs.map((req, index) => (
                    <option key={req.requisition_id} value={index}>
                      {req.requisition_code + " - " + req.requisition_title}
                    </option>
                  ))}
                </Form.Select>

              </Form.Group>
              {/* {selectedReqIndex !== null && selectedReqIndex !== "" && (
                <Row
                  className="job-row border-bottom py-1 align-items-center text-muted px-3 mx-1 my-3 mt-3 w-75"
                  style={{
                    backgroundColor: "#fff3e0",
                    borderLeft: "4px solid #ff7043",
                    borderRadius: "4px",
                  }}
                >
                  <Col xs={12} md={3} className="d-flex align-items-center">
                    <div className="bullet-columns d-flex me-2">
                      <div className="d-flex flex-column me-1">
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet"></span>
                      </div>
                      <div className="d-flex flex-column">
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet mb-1"></span>
                        <span className="job-bullet"></span>
                      </div>
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">
                        {reqs[selectedReqIndex].requisition_title}
                      </div>
                      <div className="text-muted small">
                        {reqs[selectedReqIndex].requisition_description}
                      </div>
                    </div>
                  </Col>
                  <Col
                    xs={12}
                    md={3}
                    className="text-end small text-secondary"
                  >
                    <div>
                      <strong>Positions:</strong>{" "}
                      {reqs[selectedReqIndex].no_of_positions}
                    </div>
                  </Col>
                  <Col
                    xs={12}
                    md={3}
                    className="text-end small text-secondary"
                  >
                    <div>
                      <strong>From:</strong>{" "}
                      {reqs[selectedReqIndex].registration_start_date}
                    </div>
                  </Col>
                  <Col
                    xs={12}
                    md={3}
                    className="text-end small text-secondary"
                  >
                    <div>
                      <strong>To:</strong>{" "}
                      {reqs[selectedReqIndex].registration_end_date}
                    </div>
                  </Col>
                </Row>
              )} */}
            </div>
            <div
              className="rounded p-3 text-center mb-3 mt-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current && fileInputRef.current.click()}
              style={{
                cursor: 'pointer',
                minHeight: '60px',
                height: '90px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto',
                width: '350px',
                border:'1px dashed #FF7043',
                backgroundColor: '#f5f5f5',
                borderStyle: 'dashed',
              }}
            >
              <FontAwesomeIcon icon={faUpload} size="1x" className="mb-2 text-muted" />
              <div style={{ color: '#757575', fontSize: '0.95rem' }}><span style={{ textDecoration: 'underline', color: '#FF7043', cursor: 'pointer' }}>click to browse</span></div>
            </div>
            <Form.Control type="file" id="file-upload" className="d-none" onChange={handleFileChange} ref={fileInputRef} />
            {errors.file && <small className="error d-block mb-2 text-danger">{errors.file}</small>}
            {files.length > 0 && (
              <div className="mb-3">
                <h6>Selected File:</h6>
                <div className="d-flex align-items-center justify-content-between border rounded p-2" style={{ background: '#f9f9f9' }}>
                  <span><FontAwesomeIcon icon={faFileAlt} className="me-2 text-muted" /> {files[0].name}</span>
                  <button className="btn btn-sm btn-danger ms-2" onClick={() => removeFile(0)}>✕</button>
                </div>
              </div>
            )}
            {Array.isArray(errors) && errors.length > 0 && (
              <div className="alert alert-danger p-2 mb-2" style={{ fontSize: '0.95em', maxHeight: '120px', overflowY: 'auto', color: '#d32f2f' }}>
                <strong>Validation Errors:</strong>
                <ul className="mb-0 ps-3" style={{ listStyle: 'disc', color: '#d32f2f' }}>
                  {errors.map((err, i) => (
                    <li key={i} style={{ marginBottom: 2 }}>
                      Row {err.row}: {err.messages.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer className='footspace'>
          <Button
            onClick={handleUploadSubmit}
            className="text-white fw-semibold"
            style={{ backgroundColor: '#FF7043', borderColor: '#FF7043' }}
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default JobCreation;