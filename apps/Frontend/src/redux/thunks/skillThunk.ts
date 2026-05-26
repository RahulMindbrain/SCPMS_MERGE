import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI } from "@/apis/api";

export const fetchSkills = createAsyncThunk(
  "skill/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/skills/get-all");
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch skills");
    }
  }
);
