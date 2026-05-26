import { postAPI } from "@/apis/api"
import { createAsyncThunk } from "@reduxjs/toolkit"

export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await postAPI<any>("users/register", data)

      return response
    } catch (error: any) {
      return rejectWithValue(
        error?.message || error?.error || "Registration failed"
      )
    }
  }
)
