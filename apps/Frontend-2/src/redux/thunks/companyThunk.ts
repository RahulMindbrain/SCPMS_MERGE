import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI, putAPI, postAPI, deleteAPI } from "../../apis/api";

// ✅ Fetch Active Companies
export const fetchCompanies = createAsyncThunk(
  "company/fetchCompanies",
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await getAPI<any>("/admin/get-companies", params);

      return {
        companies: res.data.data,
        meta: res.data.meta,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch companies");
    }
  }
);

// ✅ Fetch Inactive Companies
export const fetchInactiveCompanies = createAsyncThunk(
  "company/fetchInactiveCompanies",
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await getAPI<any>("/admin/get-inactive-companies", params);

      return {
        inactiveCompanies: res.data.data,
        meta: res.data.meta,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch inactive companies");
    }
  }
);

// ✅ Activate Companies
export const activateCompanies = createAsyncThunk(
  "company/activateCompanies",
  async (userIds: number[], { rejectWithValue }) => {
    try {
      await putAPI("/admin/activate-companies", { userIds });
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to activate companies");
    }
  }
);

// ✅ Company Profile
export const fetchCompanyProfile = createAsyncThunk(
  "company/fetchCompanyProfile",
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAPI<any>("/company/profile");
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

export const createCompanyProfile = createAsyncThunk(
  "company/createCompanyProfile",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await postAPI<any>("/company/profile", data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  "company/updateCompanyProfile",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await putAPI<any>("/company/profile", data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

// ✅ Jobs
export const postJob = createAsyncThunk(
  "company/postJob",
  async (data: any, { rejectWithValue }) => {
    try {
      const res = await postAPI<any>("/company/post-job", data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

export const fetchCompanyJobs = createAsyncThunk(
  "company/fetchCompanyJobs",
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await getAPI<any>("/company/get-jobs", params);

      return {
        jobs: res.data.data,
        meta: res.data.meta,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

export const updateCompanyJob = createAsyncThunk(
  "company/updateCompanyJob",
  async ({ id, data }: { id: number; data: any }, { rejectWithValue }) => {
    try {
      const res = await putAPI<any>(`/company/post-job/${id}`, data);
      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

export const deleteCompanyJob = createAsyncThunk(
  "company/deleteCompanyJob",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteAPI(`/company/post-job/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

export const fetchJobsByCompanyId = createAsyncThunk(
  "company/fetchJobsByCompanyId",
  async ({ id, params }: any, { rejectWithValue }) => {
    try {
      const res = await getAPI<any>(`/admin/get-jobs-company/${id}`, params);

      // Extract jobs array safely handling nested page structures
      const rawData = res.data?.data;
      const jobsArray = Array.isArray(rawData)
        ? rawData
        : (Array.isArray(rawData?.data) ? rawData.data : []);

      const meta = rawData?.meta || res.data?.meta || null;

      // Place job title at top-level so UI can easily display it
      const mappedJobs = jobsArray.map((item: any) => ({
        ...item,
        title: item.title || item.job?.title || "Untitled Job",
      }));

      return {
        jobs: mappedJobs,
        meta,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to fetch jobs by company ID");
    }
  }
);

// ✅ Applications
export const fetchJobApplications = createAsyncThunk(
  "company/fetchJobApplications",
  async (params: any, { rejectWithValue }) => {
    try {
      const res = await getAPI<any>("/company/get-job-application", params);

      return {
        applications: res.data.applications,
        statusCounts: res.data.statusCounts,
        meta: res.data.pagination,
      };
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

export const updateJobApplicationStatus = createAsyncThunk(
  "company/updateJobApplicationStatus",
  async ({ id, status, currentRound, reason, remarks }: any, { rejectWithValue }) => {
    try {
      const res = await putAPI<any>(
        `/company/update-job-status/${id}`,
        { status, currentRound, reason, remarks }
      );

      return res.data;
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);

// ✅ Bulk Mail
export const sendBulkMail = createAsyncThunk(
  "company/sendBulkMail",
  async (data: any, { rejectWithValue }) => {
    try {
      await postAPI("/admin/send-mails", data);
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error?.message);
    }
  }
);
export const rejectCompanies = createAsyncThunk(
  "company/rejectCompanies",
  async (userIds: number[], { rejectWithValue }) => {
    try {
      await putAPI("/admin/reject-companies", { userIds }); // ✅ consistent with activate
      return { success: true };
    } catch (error: any) {
      return rejectWithValue(error?.message || "Failed to reject companies");
    }
  }
);