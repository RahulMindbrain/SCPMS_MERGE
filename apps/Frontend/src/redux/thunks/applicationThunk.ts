// store/applications/applications.thunk.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI } from "../../apis/api";

export const fetchApplications = createAsyncThunk(
  "applications/fetchApplications",
  async (scheduleId: number, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>(
        `/interview-schedule/${scheduleId}/applications`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch applications"
      );
    }
  }
);