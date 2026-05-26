import { createSlice } from "@reduxjs/toolkit";
import {
  fetchCompanies,
  fetchInactiveCompanies,
  activateCompanies,
  fetchCompanyProfile,
  createCompanyProfile,
  updateCompanyProfile,
  fetchCompanyJobs,
  fetchJobApplications,
  updateJobApplicationStatus,
  fetchJobsByCompanyId,
  updateCompanyJob,
  deleteCompanyJob,
  sendBulkMail,
  postJob,
} from "../thunks/companyThunk";

interface CompanyState {
  companies: any[];
  inactiveCompanies: any[];
  profile: any | null;
  jobs: any[];
  applications: any[];
  statusCounts: any[];
  loading: boolean;
  error: string | null;
  meta: any;
}

const initialState: CompanyState = {
  companies: [],
  inactiveCompanies: [],
  profile: null,
  jobs: [],
  applications: [],
  statusCounts: [],
  loading: false,
  error: null,
  meta: null,
};

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // ✅ Companies
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.companies = action.payload.companies;
        state.meta = action.payload.meta;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // ✅ Inactive Companies
      .addCase(fetchInactiveCompanies.fulfilled, (state, action) => {
        state.loading = false;
        state.inactiveCompanies = action.payload.inactiveCompanies;
        state.meta = action.payload.meta;
      })

      // ✅ Activate
      .addCase(activateCompanies.pending, (state) => {
        state.loading = true;
      })
      .addCase(activateCompanies.fulfilled, (state) => {
        state.loading = false;
      })

      // ✅ Profile
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data || action.payload;
      })
      .addCase(createCompanyProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data || action.payload;
      })
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.profile = action.payload.data || action.payload;
      })

      // ✅ Jobs
      .addCase(postJob.pending, (state) => {
        state.loading = true;
      })
      .addCase(postJob.fulfilled, (state, action) => {
        state.loading = false;
        const newJob = action.payload?.data || action.payload;
        if (newJob && newJob.id) {
          state.jobs = [newJob, ...state.jobs];
        }
      })
      .addCase(postJob.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCompanyJobs.fulfilled, (state, action) => {
        state.jobs = action.payload.jobs;
        state.meta = action.payload.meta;
      })
      .addCase(fetchJobsByCompanyId.fulfilled, (state, action) => {
        state.jobs = action.payload.jobs;
        state.meta = action.payload.meta;
      })
      .addCase(updateCompanyJob.fulfilled, (state, action) => {
        const updatedJob = action.payload?.data || action.payload;
        if (updatedJob) {
          state.jobs = state.jobs.map((job) =>
            job.id === updatedJob.id ? updatedJob : job
          );
        }
      })
      .addCase(updateCompanyJob.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(deleteCompanyJob.fulfilled, (state, action) => {
        state.jobs = state.jobs.filter((job) => job.id !== action.payload);
      })
      .addCase(deleteCompanyJob.rejected, (state, action) => {
        state.error = action.payload as string;
      })

      // ✅ Applications
      .addCase(fetchJobApplications.fulfilled, (state, action) => {
        state.applications = action.payload.applications;
        state.statusCounts = action.payload.statusCounts;
        state.meta = action.payload.meta;
      })

      // ✅ Update Status
      .addCase(updateJobApplicationStatus.fulfilled, (state, action) => {
        const updated = action.payload?.data || action.payload;
        if (updated && updated.id) {
          state.applications = state.applications.map((app) =>
            app.id === updated.id
              ? { 
                  ...app, 
                  status: updated.status,
                  currentRound: updated.currentRound,
                  reason: updated.reason ?? app.reason,
                  updatedAt: updated.updatedAt || new Date().toISOString(),
                  history: updated.history || app.history
                } 
              : app
          );
        }
      })

      // ✅ Mail
      .addCase(sendBulkMail.pending, (state) => {
        state.loading = true;
      })
      .addCase(sendBulkMail.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(sendBulkMail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default companySlice.reducer;