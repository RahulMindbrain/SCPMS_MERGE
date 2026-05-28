import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI } from "../../apis/api";

let isRestoringInProgress = false;

/**
 * restoreSession thunk
 * 
 * Fetches the user profile from "/users/fetch" to restore session on startup or refresh.
 * If access token is expired, axios interceptor automatically handles /auth/refresh
 * and retries this request.
 */
export const restoreSession = createAsyncThunk(
    "auth/restoreSession",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAPI<any>("/users/fetch");

            // Reset restoration guard on success
            isRestoringInProgress = false;

            if (!response?.success) {
                return rejectWithValue(response?.message || "Failed to restore session");
            }

            return response; // { success: true, message, data: { ...user, profile } }
        } catch (error: any) {
            // Reset restoration guard on error
            isRestoringInProgress = false;

            const errorMessage = error?.message || error?.error || "Failed to restore session";
            return rejectWithValue(errorMessage);
        }
    },
    {
        condition: () => {
            if (isRestoringInProgress) {
                // Skip execution if session restoration is already in progress
                return false;
            }
            isRestoringInProgress = true;
            return true;
        }
    }
);
