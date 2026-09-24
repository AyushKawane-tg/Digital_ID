import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

const getErrorMessage = (error, fallback = "Something went wrong") => {
  return (
    error.response?.data?.message ||
    error.response?.data?.errors?.[0] ||
    error.message ||
    fallback
  );
};

export const authApi = {
  register: (payload) => api.post("/api/auth/register", payload),
  login: (payload) => api.post("/api/auth/login", payload),
  me: () => api.get("/api/auth/me"),
  updateMe: (payload) => api.put("/api/auth/me", payload),
};

export const employeeApi = {
  list: (params) => api.get("/api/employees", { params }),
  get: (employeeId) => api.get(`/api/employees/${employeeId}`),
  create: (payload) => api.post("/api/employees", payload),
  update: (employeeId, payload) => api.put(`/api/employees/${employeeId}`, payload),
  remove: (employeeId) => api.delete(`/api/employees/${employeeId}`),
  getQr: (employeeId) => api.get(`/api/employees/${employeeId}/qr`),
  getPublicId: (employeeId) => api.get(`/api/id/${employeeId}`),
  approve: (employeeId) => api.post(`/api/employees/${employeeId}/approve`),
  reject: (employeeId) => api.post(`/api/employees/${employeeId}/reject`),
  uploadCsv: (csv) => api.post("/api/employees/upload-csv", { csv }),
};

export const companyApi = {
  get: () => api.get("/api/company"),
  update: (payload) => api.put("/api/company", payload),
};

export { getErrorMessage };
export default api;
