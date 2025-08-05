import * as Yup from 'yup';

export const jobSchema = Yup.object().shape({
  'Job Title': Yup.string().required('Job Title is required'),
//   'Department': Yup.string()
//     .oneOf(['HR', 'IT', 'Finance'], 'Invalid Department')
//     .required('Department is required'),
  'Employment Type': Yup.string()
    //.oneOf(['Full-Time', 'Part-Time', 'Contract'], 'Invalid Employment Type')
    .required('Employment Type is required'),
  'Location': Yup.string().required('Location is required'),
  'Experience (Years)': Yup.string()
    // .min(0, 'Experience cannot be negative')
    // .max(40, 'Experience too high')
    .required('Experience is required'),
});
