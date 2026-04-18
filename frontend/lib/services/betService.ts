import axios from "axios"
import { BASE_URL } from "../config"
import { authService } from "./authService";

const token = authService.getToken();
export const betService = {
  placeBet: async (data: any) => {
    const res = await axios.post(`${BASE_URL}/bets`,data, {
        headers: {
        Authorization: `Bearer ${token}` // Standard JWT format
      }
    });
    return res.data;
  }
};