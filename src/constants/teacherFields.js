// Shared teacher profile field config, used by both the Add-Teacher page and the
// Edit-Teacher modal so they stay in sync. Kept as plain data (not nested
// components) so forms don't remount inputs on every keystroke.

export const TEACHER_GROUPS = [
  {
    title: 'Personal',
    fields: [
      { name: 'date_of_birth', label: 'Date of birth', type: 'date' },
      { name: 'gender', label: 'Gender', options: ['male', 'female', 'other'] },
      { name: 'blood_group', label: 'Blood group', placeholder: 'e.g. O+' },
      { name: 'marital_status', label: 'Marital status', placeholder: 'e.g. Single / Married' },
      { name: 'aadhaar_number', label: 'Aadhaar number', placeholder: '12 digits' },
    ],
  },
  {
    title: 'Contact & address',
    fields: [
      { name: 'address', label: 'Address', full: true, textarea: true, placeholder: 'Street, area, landmark' },
      { name: 'city', label: 'City' },
      { name: 'state', label: 'State' },
      { name: 'pincode', label: 'Pincode' },
      { name: 'alternate_phone', label: 'Alternate phone' },
      { name: 'emergency_contact_name', label: 'Emergency contact name' },
      { name: 'emergency_contact_phone', label: 'Emergency contact phone' },
    ],
  },
  {
    title: 'Professional / HR',
    fields: [
      { name: 'subject', label: 'Subject', placeholder: 'e.g. Mathematics' },
      { name: 'qualification', label: 'Qualification', placeholder: 'e.g. M.Sc, B.Ed' },
      { name: 'designation', label: 'Designation', placeholder: 'e.g. PGT, TGT' },
      { name: 'department', label: 'Department', placeholder: 'e.g. Science' },
      { name: 'experience_years', label: 'Experience (years)', type: 'number', placeholder: 'e.g. 5' },
      { name: 'employment_type', label: 'Employment type', options: ['full-time', 'part-time', 'contract'] },
      { name: 'joining_date', label: 'Joining date', type: 'date' },
      { name: 'date_of_leaving', label: 'Date of leaving', type: 'date' },
      { name: 'salary', label: 'Monthly salary (₹)', type: 'number', placeholder: 'e.g. 35000' },
    ],
  },
  {
    title: 'Payroll / bank',
    fields: [
      { name: 'pan_number', label: 'PAN number', placeholder: 'ABCDE1234F' },
      { name: 'bank_account_number', label: 'Bank account number' },
      { name: 'bank_ifsc', label: 'Bank IFSC' },
      { name: 'bank_name', label: 'Bank name' },
    ],
  },
];

// Every editable teacher field name (flattened from the groups above).
export const TEACHER_FIELD_NAMES = TEACHER_GROUPS.flatMap((g) => g.fields.map((f) => f.name));

// Convert numeric/empty form values into an API payload. Drops blank fields so a
// PUT never overwrites a stored value with an empty string.
export const buildTeacherPayload = (src) => {
  const out = {};
  Object.entries(src).forEach(([k, v]) => {
    if (v === '' || v === null || v === undefined) return;
    if (k === 'salary') out[k] = parseFloat(v);
    else if (k === 'experience_years') out[k] = parseInt(v, 10);
    else out[k] = v;
  });
  return out;
};
