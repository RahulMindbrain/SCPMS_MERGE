import { createAsyncThunk } from "@reduxjs/toolkit";
import { postAPI } from "../../apis/api";

/**
 * Login thunk — works for all roles (ADMIN / STUDENT / COMPANY).
 *
 * API response shape:
 * {
 *   success: boolean,
 *   message: string,
 *   data: { id, firstname, lastname, email, role, status },
 *   token?: string   // optional — may come as httpOnly cookie instead
 * }
 */
export const loginUser = createAsyncThunk(
    "auth/loginUser",
    async (credentials: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const response = await postAPI<any>("/auth/login", credentials);

            if (!response?.success) {
                return rejectWithValue(response?.message || "Login failed");
            }

            return response; // full body passed to authSlice
        } catch (error: any) {
            // error is likely the response.data thrown by postAPI
            const errorMessage = error?.message || error?.error || "Login failed";
            return rejectWithValue(errorMessage);
        }
    }
);