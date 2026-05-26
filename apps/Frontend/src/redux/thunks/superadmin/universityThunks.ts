import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI } from "@/apis/api";

export const fetchUniversities = createAsyncThunk(
  "superAdmin/fetchUniversities",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/university/?limit=1000");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch universities");
    }
  }
);




