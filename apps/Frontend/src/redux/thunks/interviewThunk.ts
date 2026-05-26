import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI, postAPI, putAPI, deleteAPI } from "../../apis/api";

export const fetchSchedules = createAsyncThunk(
  "interview/fetchSchedules",
  async (companyId: number | undefined, { rejectWithValue }) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await getAPI<any>("/interview-schedule/", params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch schedules");
    }
  }
);

export const createSchedule = createAsyncThunk(
  "interview/createSchedule",
  async (scheduleData: any, { rejectWithValue }) => {
    try {
      const response = await postAPI<any>("/interview-schedule/", scheduleData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to create schedule");
    }
  }
);

export const updateSchedule = createAsyncThunk(
  "interview/updateSchedule",
  async (
    { id, scheduleData }: { id: number; scheduleData: any },
    { rejectWithValue }
  ) => {
    try {
      // ✅ sanitize payload (CRITICAL FIX)
      const payload: any = {};

      if (scheduleData.startTime) payload.startTime = scheduleData.startTime;
      if (scheduleData.endTime) payload.endTime = scheduleData.endTime;
      if (scheduleData.venue !== undefined) payload.venue = scheduleData.venue;

      const response = await putAPI<any>(
        `/interview-schedule/${id}`,
        payload
      );

      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update schedule");
    }
  }
);
export const deleteSchedule = createAsyncThunk(
  "interview/deleteSchedule",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await deleteAPI<any>(`/interview-schedule/${id}`);
      return { id, message: response.message };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete schedule");
    }
  }

);
export const sendScheduleMessage = createAsyncThunk(
  "interview/sendMessage",
  async (
    { id, message }: { id: number; message: string },
    { rejectWithValue }
  ) => {
    try {
      const trimmedMessage = message.trim();
      if (!trimmedMessage) {
        return rejectWithValue("Please enter a formal note before submitting");
      }

      const response = await postAPI<any>(
        `/interview-schedule/${id}/messages`,
        { message: trimmedMessage }
      );

      // ✅ normalize response
      return {
        id,
        message: response?.message || "Message sent successfully",
        raw: response
      };

    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to send message");
    }
  }
);

export const approveSchedule = createAsyncThunk(
  "interview/approveSchedule",
  async (
    { id, status, rejectionReason }: { id: number; status: "APPROVED" | "REJECTED"; rejectionReason?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await putAPI<any>(`/interview-schedule/${id}/approval`, {
        status,
        rejectionReason,
      });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to update approval status");
    }
  }
);

export const fetchSchedulesByCompany = createAsyncThunk(
  "interview/fetchSchedulesByCompany",
  async (companyId: number | undefined, { rejectWithValue }) => {
    try {
      const params = companyId ? { companyId } : {};
      const response = await getAPI<any>(`/interview-schedule/by-company-id`, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch schedules by company");
    }
  }
);

export const fetchCompanySchedules = createAsyncThunk(
  "interview/fetchCompanySchedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/interview-schedule/by-company-id");
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch company schedules");
    }
  }
);

export const fetchScheduleMessages = createAsyncThunk(
  "interview/fetchMessages",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>(`/interview-schedule/${id}/messages`);
      return { id, messages: response.data || response }; // Handle both structured and raw response
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch messages");
    }
  }
);

export const fetchScheduleApplications = createAsyncThunk(
  "interview/fetchApplications",
  async (
    {
      id,
      page = 1,
      limit = 10,
    }: {
      id: number;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAPI<any>(
        `/interview-schedule/${id}/applications?page=${page}&limit=${limit}`
      );

      return {
        id,
        applications: response.data.data,
        meta: response.data.meta,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch applications"
      );
    }
  }
);

// New requested thunks for Company Application Management
export const fetchCompanyInterviewSchedules = createAsyncThunk(
  "interview/fetchCompanyInterviewSchedules",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/interview-schedule/company");
      // Expecting response directly or wrapped in data
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch company interview schedules");
    }
  }
);

export const fetchApplicationsBySchedule = createAsyncThunk(
  "interview/fetchApplicationsBySchedule",
  async (
    {
      id,
      page = 1,
      limit = 10,
    }: {
      id: number;
      page?: number;
      limit?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await getAPI<any>(
        `/interview-schedule/${id}/applications?page=${page}&limit=${limit}`
      );

      return {
        id,
        applications: response.data?.data || response.data || [],
        meta: response.data?.meta || null,
      };
    } catch (error: any) {
      return rejectWithValue(
        error.message || "Failed to fetch applications"
      );
    }
  }
);

// ✅ Fetch active companies for scheduling flow
export const fetchActiveCompaniesForSchedule = createAsyncThunk(
  "interview/fetchActiveCompaniesForSchedule",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/admin/get-companies", { status: "ACTIVE", limit: 100 });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch companies");
    }
  }
);

// ✅ Fetch active universities for scheduling flow
export const fetchActiveUniversitiesForSchedule = createAsyncThunk(
  "interview/fetchActiveUniversitiesForSchedule",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/university/", { limit: 100, status: "ACTIVE" });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch universities");
    }
  }
);

// ✅ Fetch jobs by company ID for scheduling flow
export const fetchCompanyJobsForSchedule = createAsyncThunk(
  "interview/fetchCompanyJobsForSchedule",
  async (companyId: number, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>(`/admin/get-jobs-company/${companyId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch company jobs");
    }
  }
);

// ✅ Fetch jobs by university for scheduling flow
export const fetchUniversityJobsForSchedule = createAsyncThunk(
  "interview/fetchUniversityJobsForSchedule",
  async (params: { universityId?: number; page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await getAPI<any>("/job-universities", { ...params, limit: params.limit || 100 });
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch university jobs");
    }
  }
);
