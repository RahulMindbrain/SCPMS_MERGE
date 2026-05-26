import { createAsyncThunk } from "@reduxjs/toolkit";
import { deleteAPI, getAPI, postAPI, putAPI } from "../../apis/api";

export const fetchDepartments = createAsyncThunk(
  "department/fetchAll",
  async (_: string | number | undefined, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/dept/?limit=1000");
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch departments");
    }
  }
);

export const createDepartment = createAsyncThunk(
  "department/create",
  async (payload: { name: string; isActive?: boolean }, { rejectWithValue }) => {
    try {
      const response = await postAPI<any>("/dept/", payload);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to create department");
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "department/update",
  async (
    payload: { id: number; name: string; isActive?: boolean },
    { rejectWithValue },
  ) => {
    try {
      const response = await putAPI<any>(`/dept/${payload.id}`, {
        name: payload.name,
        isActive: payload.isActive,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to update department");
    }
  },
);

export const deleteDepartment = createAsyncThunk(
  "department/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await deleteAPI<any>(`/dept/${id}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to delete department");
    }
  },
);
