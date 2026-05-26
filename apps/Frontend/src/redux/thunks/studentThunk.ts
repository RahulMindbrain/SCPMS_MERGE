import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI, putAPI, postAPI } from "../../apis/api";

export const fetchStudents = createAsyncThunk(
    "student/fetchStudents",
    async (params: any = {}, { rejectWithValue }) => {
        try {
            const response = await getAPI<any>("/admin/get-students", { limit: 50, ...params });
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to fetch students");
        }
    }
);

export const fetchInactiveStudents = createAsyncThunk(
    "student/fetchInactiveStudents",
    async (params: any = {}, { rejectWithValue }) => {
        try {
            const response = await getAPI<any>("/admin/get-students", { limit: 50, ...params });
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to fetch inactive students");
        }
    }
);

export const activateStudents = createAsyncThunk(
    "student/activateStudents",
    async (userIds: number[], { rejectWithValue }) => {
        try {
            const response = await putAPI<any>("/admin/activate-users", { userIds });
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to activate students");
        }
    }
);

// Student Profile Thunks
export const fetchStudentProfile = createAsyncThunk(
    "student/fetchProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await getAPI<any>("/student/profile");
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to fetch student profile");
        }
    }
);

export const createStudentProfile = createAsyncThunk(
    "student/createProfile",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await postAPI<any>("/student/profile", data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data || error?.message || "Failed to create student profile");
        }
    }
);

export const updateStudentProfile = createAsyncThunk(
    "student/updateProfile",
    async (data: any, { rejectWithValue }) => {
        try {
            const response = await putAPI<any>("/student/profile", data);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.response?.data || error?.message || "Failed to update student profile");
        }
    }
);

export const fetchJobs = createAsyncThunk(
    "student/fetchJobs",
    async (params: any, { rejectWithValue }) => {
        try {
            const response = await getAPI<any>("/student/show-all-jobs", params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to fetch jobs");
        }
    }
);

export const applyJob = createAsyncThunk(
    "student/applyJob",
    async (
        arg: number | { jobUniversityId: number; skipOptimization?: boolean; optimizeResume?: boolean },
        { rejectWithValue }
    ) => {
        try {
            const payload = typeof arg === "number" ? { jobUniversityId: arg } : arg;
            const response = await postAPI<any>("/student/apply-job", payload);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to apply for job");
        }
    }
);

export const fetchJobApplications = createAsyncThunk(
    "student/fetchJobApplications",
    async (params: any, { rejectWithValue }) => {
        try {
            const response = await getAPI<any>("/student/get-job-application", params);
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to fetch job applications");
        }
    }
);

export const updateApplicationStatus = createAsyncThunk(
    "student/updateApplicationStatus",
    async ({ id, action }: { id: number; action: "ACCEPT" | "REJECT" }, { rejectWithValue }) => {
        try {
            const response = await putAPI<any>(`/student/application/${id}`, { action });
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to update application status");
        }
    }
);

export const fetchJobUniversities = createAsyncThunk(
    "student/fetchJobUniversities",
    async (params: any = {}, { rejectWithValue }) => {
        try {
            const response = await getAPI<any>("/job-universities", { limit: 100, status: "APPROVED", ...params });
            return response;
        } catch (error: any) {
            return rejectWithValue(error?.message || "Failed to fetch job universities");
        }
    }
);