import axios from "axios";
import { BASE_URL } from "../config";
import { authService } from "./authService";

// Define a type for the update payload for better TS support
export interface UpdateStatusPayload {
  phoneNumber: string;
  status: string;
}

export interface AddBalancePayload {
  userId: number;
  amount: number;
}

export interface WthdrawBalancePayload {
  userId: number;
  amount: number;
}
const token = authService.getToken();

export const managerService = {
  /** Fetch all users */
  getUsers: () =>
    axios.get(`${BASE_URL}/users`, {
      headers: {
        Authorization: `Beare ${token}`,
      },
    }),

  /** Add money to a user's balance */
  // Added BASE_URL here
  addMoney: (payload: AddBalancePayload) => {
    return axios.post(`${BASE_URL}/wallet/add`, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // Standard JWT format
      },
    });
  },

  /** Update a user's status: "active" | "inactive" | "suspended" */
  // Ensure you call this as: updateStatus({ phoneNumber: '123', status: 'active' })
  updateStatus: (payload: UpdateStatusPayload) => {
    return axios.post(`${BASE_URL}/users/status`, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // Standard JWT format
      },
    });
  },

  /** Withdraw / mark amount as paid out */
  // Added BASE_URL here
  withdrawAmountPaid: (payload: WthdrawBalancePayload) => {
    return axios.post(`${BASE_URL}/wallet/withdraw`, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // Standard JWT format
      },
    });
  },

  getWithdrawalRequests: () => {
    return axios.get(`${BASE_URL}/payment-requests/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  processWithdrawal: (id: number, status: "APPROVED" | "REJECTED") => {
    return axios.post(
      `${BASE_URL}/payment-requests/${id}/process`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  },
};
