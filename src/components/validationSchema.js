import * as Yup from 'yup';
 
export const jobSchema = Yup.object().shape({
  'Business Unit': Yup.string().required('Business Unit is required'),
  'Grade': Yup.string().required('Grade is required'),
  'Job Title': Yup.string().required('Job Title is required'),
  'Budget': Yup.number().required('Budget is required'),
  'Job Start Date': Yup.date()
    .required('Job Start Date is required'),
  'Job End Date': Yup.date()
    .required('Job End Date is required'),
    // .nullable()
    // .min(Yup.ref('Job Start Date'), 'Job End Date must be after Job Start Date'),
  'Required Hours': Yup.number()
    .required('Required Hours is required'),
  'Interview Mode': Yup.string()
    .required('Interview Mode is required'),
  'Domain': Yup.string().required('Domain is required'),
  'Client': Yup.string().required('Client is required'),
  'Priority': Yup.string()
    .required('Priority is required'),
  'Location': Yup.string().required('Location is required'),
  'Job Type': Yup.string().oneOf(['Full-time', 'Part-time', 'Contract'], 'Invalid Job Type')
    .required('Job Type is required'),
  'Age': Yup.number()
    .required('Age is required'),
  'Caste': Yup.string().required('Caste is required'),
  'Experience': Yup.string()
    .required('Experience is required'),
  'No. of Positions': Yup.number()
    .required('Number of Positions is required'),
  'Education Qualification': Yup.string().required('Education Qualification is required'),
  'Relaxation Policy': Yup.string().required('Relaxation Policy is required'),
 
});