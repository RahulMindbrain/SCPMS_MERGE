import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI, postAPI, putAPI } from "@/apis/api";

export const fetchAdmins = createAsyncThunk(
  "superAdmin/fetchAdmins",
  async (status: string | undefined, { rejectWithValue }) => {
    try {
      const endpoint = status
        ? `/superadmin/admins?status=${status}`
        : "/superadmin/admins";

      const response = await getAPI<any>(endpoint);

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch administrators"
      );
    }
  }
);

export const registerAdmin = createAsyncThunk(
  "superAdmin/registerAdmin",
  async (payload: any, { rejectWithValue }) => {
    try {
      const response = await postAPI<any>(
        "/users/register",
        payload
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to register administrator"
      );
    }
  }
);

export const updateAdminStatus = createAsyncThunk(
  "superAdmin/updateAdminStatus",
  async (
    { ids, status }: { ids: number[]; status: boolean },
    { rejectWithValue }
  ) => {
    try {
      const endpoint = status
        ? "/superadmin/admins/activate"
        : "/superadmin/admins/deactivate";

      const response = await putAPI<any>(endpoint, { ids });

      return { ids, status, response };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to update administrator status"
      );
    }
  }
  
);

export const activateAdmin = createAsyncThunk(
  "superAdmin/activateAdmin",
  async (ids: number[], { rejectWithValue }) => {
    try {
      const response = await putAPI<any>(
        "/superadmin/admins/activate",
        { ids }
      );

      return { ids, response };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to activate administrator"
      );
    }
  }
);