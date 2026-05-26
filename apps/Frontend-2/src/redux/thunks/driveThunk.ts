import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI, putAPI } from "../../apis/api";

const errMessage = (error: unknown, fallback: string) => {
  if (typeof error === "string") return error;
  const e = error as { message?: string } | undefined;
  return e?.message ?? fallback;
};

/** Admin moderation: JobUniversity rows for the logged-in admin's university. */
export const fetchJobs = createAsyncThunk(
  "drive/fetchJobs",
  async (
    params: { status?: string; page?: number; limit?: number; companyId?: number },
    { rejectWithValue },
  ) => {
    try {
      return await getAPI<any>("/job-universities", params);
    } catch (error: unknown) {
      return rejectWithValue(errMessage(error, "Failed to fetch jobs"));
    }
  },
);

/** Updates JobUniversity status (ids = job-university row ids, not job ids). */
export const updateJobStatus = createAsyncThunk(
  "drive/updateJobStatus",
  async (
    data: {
      jobIds: number[];
      status: string;
      reason?: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const body: {
        ids: number[];
        status: string;
        reason?: string;
      } = {
        ids: data.jobIds,
        status: data.status,
      };
      if (data.reason !== undefined && data.reason !== "") {
        body.reason = data.reason;
      }
      return await putAPI<any>("/job-universities/status", body);
    } catch (error: unknown) {
      return rejectWithValue(errMessage(error, "Failed to update job status"));
    }
  },
);
