const API_BASE = "http://localhost:8000/api";

export const getToken = () => localStorage.getItem("token");
export const getUserId = () => localStorage.getItem("user_id");

export const setAuth = (token, userId) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user_id", userId);
};

export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
};

export const apiFetch = async (url, options = {}) => {
  const token = getToken();

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message);
  }

  return res.json();
};
