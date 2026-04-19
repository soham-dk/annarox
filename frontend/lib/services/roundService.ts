// lib/services/roundService.ts

import axios from "axios";
import { BASE_URL } from "../config";
import { authService } from "./authService";

const token = authService.getToken();
export const roundService = {
  open: (name: string) =>
    axios.post(
      `${BASE_URL}/rounds/open`,
      { name },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Standard JWT format
        },
      },
    ),

  close: (id: number) =>
    axios.post(
      `${BASE_URL}/rounds/${id}/close`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`, // Standard JWT format
        },
      },
    ),

  draw: (id: number, winningNumber: number) =>
    axios.post(
      `${BASE_URL}/rounds/${id}/draw`,
      { winningNumber },
      {
        headers: {
          Authorization: `Bearer ${token}`, // Standard JWT format
        },
      },
    ),

  getCurrent: () =>
    axios.get(`${BASE_URL}/rounds/current`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),

  getStats: (id: number) => {
    return axios.get(`${BASE_URL}/bets/stats/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
