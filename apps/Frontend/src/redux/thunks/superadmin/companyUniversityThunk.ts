import { createAsyncThunk } from "@reduxjs/toolkit"
import { getAPI, postAPI, putAPI } from "@/apis/api"

// FETCH REQUESTS
export const fetchCompanyRequests = createAsyncThunk(
  "company/fetchCompanyRequests",

  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/company/requests")

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch requests")
    }
  }
)

// SEND REQUEST
export const requestUniversity = createAsyncThunk(
  "company/requestUniversity",

  async (universityIds: number[], { rejectWithValue }) => {
    try {
      const response = await postAPI<any>("/company/request-university", {
        universityIds,
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send request")
    }
  }
)

// REAPPLY REQUEST
export const reapplyUniversity = createAsyncThunk(
  "company/reapplyUniversity",

  async (universityIds: number[], { rejectWithValue }) => {
    try {
      const response = await putAPI<any>("/company/reapply-university", {
        universityIds,
      })

      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to reapply request")
    }
  }
)

// SEND JOB TO UNIVERSITY
export const sendJobToUniversity = createAsyncThunk(
  "company/sendJobToUniversity",
  async (
    payload: {
      jobId: number
      jobUniversities: Array<{
        universityId: number
        salary: number
        minCgpa: number
        maxBacklogs: number
        openings: number
        description: string
      }>
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await postAPI<any>("/job-universities/send", payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(
        error?.message || "Failed to send job to university"
      )
    }
  }
)

// FETCH ADMIN COMPANY REQUESTS
export const fetchAdminCompanyRequests = createAsyncThunk(
  "admin/fetchCompanyRequests",
  async (status: string | undefined, { rejectWithValue }) => {
    try {
      const url = status 
        ? `/admin/university/company-requests?status=${status}`
        : "/admin/university/company-requests";
      const response = await getAPI<any>(url)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch company requests")
    }
  }
)

// UPDATE ADMIN COMPANY REQUEST STATUS
export const updateAdminCompanyRequestStatus = createAsyncThunk(
  "admin/updateCompanyRequestStatus",
  async (
    payload: { ids: number[]; status: "APPROVED" | "REJECTED"; reason?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await putAPI<any>("/admin/university/company-requests", payload)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update company request status")
    }
  }
)

