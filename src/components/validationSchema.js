import * as Yup from 'yup';

export const jobSchema = Yup.object().shape({
  'Position Title': Yup.string().required('Position Title is required'),
  'Department': Yup.string().required('Department is required'),
 // 'Country': Yup.string().required('Country is required'),
 // 'State': Yup.string().required('State is required'),
 // 'City': Yup.string().required('City is required'),
 // 'Location': Yup.string().required('Location is required'),
  'Description': Yup.string().required('Description is required'),
  'Roles & Responsibilities': Yup.string().required('Roles Responsibilities is required'),
  'Grade ID': Yup.string().required('Grade ID is required'),
  'Employment Type': Yup.string().required('Employment Type is required'),
  'Eligibility Age Min': Yup.number().required('Eligibility Age Min is required'),
  'Eligibility Age Max': Yup.number().required('Eligibility Age Max is required'),
  'Mandatory Qualification': Yup.string().required('Mandatory Qualification is required'),
  'Preferred Qualification': Yup.string().required('Preffered Qualification is required'),
  'Mandatory Experience': Yup.string().required('Mandatory Experience is required'),
  'Preferred Experience': Yup.string().required('Preffered Experience is required'),
  'Probation Period': Yup.string().required('Probation Period is required'),
  'Documents Required': Yup.string().required('Documents Required is required'),
  'Min Credit Score': Yup.number().required('Min Credit Score is required'),

  // ✅ Conditional salary validation
  'Min Salary': Yup.mixed().when('Grade ID', {
    is: (val) => val === "0" || val === 0,
    then: (schema) =>
      Yup.number()
        .typeError('Min Salary must be a valid number')
        .required('Min Salary is required when Grade ID is 0'),
    otherwise: (schema) =>
      schema.nullable().transform(() => null), // ignore value
  }),

  'Max Salary': Yup.mixed().when('Grade ID', {
    is: (val) => val === "0" || val === 0,
    then: (schema) =>
      Yup.number()
        .typeError('Max Salary must be a valid number')
        .required('Max Salary is required when Grade ID is 0'),
    otherwise: (schema) =>
      schema.nullable().transform(() => null), // ignore value
  }),
});
