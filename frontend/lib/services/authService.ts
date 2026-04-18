import axios from "axios";
import { BASE_URL } from "../config";

export const authService = {

  login: async (payload: { phoneNumber: string; password: string }) => {
    console.log(BASE_URL);
    
    const res = await axios.post(
      `${BASE_URL}/auth/login`,
      payload
    );

    return res.data;
  },

  register: async (payload: { phoneNumber: string; password: string }) => {
    console.log(BASE_URL);
    const res = await axios.post(
      `${BASE_URL}/users/register`,
      payload
    );

    return res.data;
  },

  logout: () => {
     if (typeof window !== "undefined") {
    localStorage.removeItem("token");
  }
},

  getToken: () => {
     if (typeof window !== "undefined") {
    return localStorage.getItem("token");
     }
  },
  
  forgotPassword: async (payload: { phoneNumber: string }) => {
  const res = await axios.post(`${BASE_URL}/auth/forgot-password`, payload);
  return res.data;
},

resetPassword: async (payload: { phoneNumber: string; newPassword: string }) => {
  const res = await axios.post(`${BASE_URL}/auth/reset-password`, payload);
  return res.data;
},
};

export const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

