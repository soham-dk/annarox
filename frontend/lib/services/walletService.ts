import axios from "axios";
import { BASE_URL } from "../config";
import { authService } from "./authService";

const token = authService.getToken();
export const walletService = {
  getWallet: async () => {
    // Get the token you saved during login/register
    const res = await axios.get(`${BASE_URL}/wallet`, {
      headers: {
        Authorization: `Bearer ${token}`, // Standard JWT format
      },
    });
    return res.data;
  },
  getUserByMobile: async (phoneNumber: string) => {
    return await axios.get(`/users/mobile/${phoneNumber}`, {
      headers: {
        Authorization: `Bearer ${token}`, // Standard JWT format
      },
    });
  },

  withdraw: async (amount: { amount: any }) => {
    return await axios.post(`${BASE_URL}/payment-requests/withdraw`, amount, {
      headers: {
        Authorization: `Bearer ${token}`, // Standard JWT format
      },
    });
  },
};
