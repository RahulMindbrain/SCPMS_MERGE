import { createAsyncThunk } from "@reduxjs/toolkit";
import { postAPI } from "../../apis/api";

/**
 * Forgot Password thunk - Step 1: Request OTP
 */
export const forgotPassword = createAsyncThunk(
    "auth/forgotPassword",
    async (email: string, { rejectWithValue }) => {
        try {
            const response = await postAPI<any>("/auth/forgot-password", { email });
            if (!response?.success) {
                return rejectWithValue(response?.message || "Failed to send OTP");
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to send OTP");
        }
    }
);

/**
 * Verify OTP thunk - Step 2: Verify the OTP sent to email
 */
export const verifyOTP = createAsyncThunk(
    "auth/verifyOTP",
    async (payload: { email: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await postAPI<any>("/auth/verify-otp", payload);
            if (!response?.success) {
                return rejectWithValue(response?.message || "OTP verification failed");
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "OTP verification failed");
        }
    }
);

/**
 * Reset Password thunk - Step 3: Set new password
 */
export const resetPassword = createAsyncThunk(
    "auth/resetPassword",
    async (payload: { email: string; newpassword: string }, { rejectWithValue }) => {
        try {
            const response = await postAPI<any>("/auth/reset-password", payload);
            if (!response?.success) {
                return rejectWithValue(response?.message || "Password reset failed");
            }
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Password reset failed");
        }
    }
);
