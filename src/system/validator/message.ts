export const message = {
  string: (field: string) => `${field} phải là chuỗi.`,

  required: (field: string) => `${field} không được để trống.`,

  invalid: (field: string) => `${field} không hợp lệ.`,

  number: (field: string) => `${field} phải là số.`,

  array: (field: string) => `${field} phải là mảng.`,

  boolean: (field: string) => `${field} phải là boolean.`,

  object: (field: string) => `${field} phải là object.`,

  nested: (field: string) => `${field} không hợp lệ.`,

  date: (field: string) => `${field} phải là ngày.`,

  min: {
    number: (field: string, min: number) =>
      `${field} phải lớn hơn hoặc bằng ${min}`,
  },

  max: {
    array: (field: string, max: number) => `${field} tối đa ${max} phần tử.`,
    number: (field: string, max: number) =>
      `${field} phải bé hơn hoặc bằng ${max}`,
    string: (field: string, max: number) =>
      `${field} có số kí tự phải bé hơn hoặc bằng ${max}`,
  },

  uuid: (field: string) => `${field} phải là UUID.`,
};
