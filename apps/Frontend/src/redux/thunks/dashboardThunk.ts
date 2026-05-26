import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI } from "../../apis/api";

export const fetchDashboardStats = createAsyncThunk(
    "dashboard/fetchStats",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAPI<any>("/admin/dashboard");
            return response;
        } catch (error: any) {
            return rejectWithValue(error.message || "Failed to fetch dashboard stats");
        }
    }
);
