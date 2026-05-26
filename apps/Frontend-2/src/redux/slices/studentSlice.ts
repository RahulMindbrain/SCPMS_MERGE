import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchStudents, fetchInactiveStudents, activateStudents, fetchStudentProfile, createStudentProfile, updateStudentProfile, fetchJobs, applyJob, fetchJobApplications, updateApplicationStatus, fetchJobUniversities } from "../thunks/studentThunk";

interface StudentState {
  students: any[];
  inactiveStudents: any[];
  jobs: any[];
  applications: any[];
  jobUniversities: any[];
  statusCounts: any[];
  profile: any | null;
  loading: boolean;
  error: string | null;
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
}

const initialState: StudentState = {
  students: [],
  inactiveStudents: [],
  jobs: [],
  applications: [],
  jobUniversities: [],
  statusCounts: [],
  profile: null,
  loading: false,
  error: null,
  meta: null,
};

const studentSlice = createSlice({
  name: "student",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Active Students
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const allStudents = action.payload?.data?.data || [];
        state.students = allStudents.filter((s: any) => s.status === "ACTIVE");
        state.inactiveStudents = allStudents.filter((s: any) => s.status !== "ACTIVE");
        state.meta = action.payload?.data?.meta || null;
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Inactive Students
      .addCase(fetchInactiveStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInactiveStudents.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const allStudents = action.payload?.data?.data || [];
        state.students = allStudents.filter((s: any) => s.status === "ACTIVE");
        state.inactiveStudents = allStudents.filter((s: any) => s.status !== "ACTIVE");
        if (action.payload?.data?.meta) {
          state.meta = action.payload.data.meta;
        }
      })
      .addCase(fetchInactiveStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Activate Students
      .addCase(activateStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(activateStudents.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(activateStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Student Profile
      .addCase(fetchStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudentProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(fetchStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create Student Profile
      .addCase(createStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createStudentProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(createStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Student Profile
      .addCase(updateStudentProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudentProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.profile = action.payload.data;
      })
      .addCase(updateStudentProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Jobs
      .addCase(fetchJobs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const payload = action.payload;
        
        if (payload?.data && Array.isArray(payload.data.data)) {
          // Case: { success: true, data: { data: [], meta: {} } }
          state.jobs = payload.data.data;
          state.meta = payload.data.meta || null;
        } else if (payload && Array.isArray(payload.data)) {
          // Case: { data: [], meta: {} } OR { success: true, data: [] }
          state.jobs = payload.data;
          state.meta = payload.meta || null;
        } else if (Array.isArray(payload)) {
          // Case: []
          state.jobs = payload;
          state.meta = null;
        } else {
          state.jobs = [];
          state.meta = null;
        }
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Apply Job
      .addCase(applyJob.pending, (state, action: any) => {
        state.loading = true;
        const arg = action.meta.arg;
        const jobUniversityId = typeof arg === "number" ? arg : arg?.jobUniversityId;
        if (jobUniversityId) {
          const exists = state.applications.some(
            (app: any) => Number(app.jobUniversityId || app.jobUniversity?.id) === Number(jobUniversityId)
          );
          if (!exists) {
            state.applications.unshift({
              id: `temp-${jobUniversityId}-${Date.now()}`,
              status: "APPLIED",
              jobUniversityId: jobUniversityId,
              jobUniversity: {
                id: jobUniversityId,
              },
              createdAt: new Date().toISOString(),
              isOptimistic: true,
            });
          }
        }
      })
      .addCase(applyJob.fulfilled, (state, action: any) => {
        state.loading = false;
        const newApp = action.payload?.data;
        const arg = action.meta.arg;
        const jobUniversityId = typeof arg === "number" ? arg : arg?.jobUniversityId;
        
        // Remove the optimistic placeholder if it exists
        if (jobUniversityId) {
          state.applications = state.applications.filter(
            (app: any) => !(app.isOptimistic && Number(app.jobUniversityId || app.jobUniversity?.id) === Number(jobUniversityId))
          );
        }

        // Add the real application from the backend
        if (newApp && newApp.id) {
          const exists = state.applications.some(
            (app: any) => Number(app.id) === Number(newApp.id)
          );
          if (!exists) {
            state.applications.unshift(newApp);
          }
        }
      })
      .addCase(applyJob.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        
        // Rollback optimistic update
        const arg = action.meta.arg;
        const jobUniversityId = typeof arg === "number" ? arg : arg?.jobUniversityId;
        if (jobUniversityId) {
          state.applications = state.applications.filter(
            (app: any) => !(app.isOptimistic && Number(app.jobUniversityId || app.jobUniversity?.id) === Number(jobUniversityId))
          );
        }
      })
      // Fetch Job Applications
      .addCase(fetchJobApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobApplications.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.applications = action.payload.data.applications;
        if (action.payload.data.pagination) {
          state.meta = {
            total: action.payload.data.pagination.totalCount,
            page: action.payload.data.pagination.currentPage,
            limit: action.payload.data.pagination.limit,
            totalPages: action.payload.data.pagination.totalPages,
          };
        }
        state.statusCounts = action.payload.data.statusCounts || [];
      })
      .addCase(fetchJobApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Job Application Status (Student Accept/Reject)
      .addCase(updateApplicationStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateApplicationStatus.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateApplicationStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Job Universities
      .addCase(fetchJobUniversities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchJobUniversities.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const payload = action.payload;
        if (payload?.data && Array.isArray(payload.data.data)) {
          state.jobUniversities = payload.data.data;
        } else if (payload && Array.isArray(payload.data)) {
          state.jobUniversities = payload.data;
        } else if (Array.isArray(payload)) {
          state.jobUniversities = payload;
        } else {
          state.jobUniversities = [];
        }
      })
      .addCase(fetchJobUniversities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default studentSlice.reducer;