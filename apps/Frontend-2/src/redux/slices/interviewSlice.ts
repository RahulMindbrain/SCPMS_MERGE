import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchSchedules, createSchedule, updateSchedule, deleteSchedule, fetchSchedulesByCompany, fetchCompanySchedules, approveSchedule, fetchScheduleMessages, sendScheduleMessage, fetchScheduleApplications, fetchActiveCompaniesForSchedule, fetchActiveUniversitiesForSchedule, fetchCompanyJobsForSchedule, fetchUniversityJobsForSchedule, fetchCompanyInterviewSchedules, fetchApplicationsBySchedule } from "../thunks/interviewThunk";

interface InterviewState {
  schedules: any[];
  applications: any[];
  meta: any;
  selectedSchedule: any | null;
  loading: boolean;
  error: string | null;
  // Scheduler flow state
  schedulerCompanies: any[];
  schedulerUniversities: any[];
  schedulerJobs: any[];
  schedulerLoading: boolean;
}

const initialState: InterviewState = {
  schedules: [],
  applications: [],
  meta: null,
  selectedSchedule: null,
  loading: false,
  error: null,
  schedulerCompanies: [],
  schedulerUniversities: [],
  schedulerJobs: [],
  schedulerLoading: false,
};

const interviewSlice = createSlice({
  name: "interview",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedSchedule: (state, action: PayloadAction<any>) => {
      state.selectedSchedule = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Schedules
      .addCase(fetchSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedules.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.schedules = action.payload.data;
      })
      .addCase(fetchSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to fetch schedules";
      })
      // Fetch Schedules By Company
      .addCase(fetchSchedulesByCompany.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSchedulesByCompany.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.schedules = action.payload.data;
      })
      .addCase(fetchSchedulesByCompany.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to fetch schedules by company";
      })
      // Fetch Company Schedules
      .addCase(fetchCompanySchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanySchedules.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.schedules = action.payload.data;
      })
      .addCase(fetchCompanySchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to fetch company schedules";
      })
      // Create Schedule
      .addCase(createSchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSchedule.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.success !== false && action.payload.data) {
          state.schedules.unshift(action.payload.data);
        }
      })
      .addCase(createSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to create schedule";
      })
      // Update Schedule
      .addCase(updateSchedule.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload.success !== false && action.payload.data) {
          const updated = action.payload.data;
          state.schedules = state.schedules.map((s) =>
            s.id === updated.id
              ? { ...s, ...updated }
              : s
          );
        }
      })
      .addCase(updateSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to update schedule";
      })
      // Approve Schedule
      .addCase(approveSchedule.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        const updated = action.payload.data;
        state.schedules = state.schedules.map((s) =>
          s.id === updated.id ? { ...s, ...updated } : s
        );
      })
      .addCase(approveSchedule.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to update approval status";
      })
      // Delete Schedule

      .addCase(deleteSchedule.fulfilled, (state, action) => {
        state.schedules = state.schedules.filter((s) => s.id !== action.payload.id);
      })
      // Fetch Messages
      .addCase(fetchScheduleMessages.fulfilled, (state, action: PayloadAction<any>) => {
        const { id, messages } = action.payload;
        state.schedules = state.schedules.map((s) =>
          s.id === id ? { ...s, messages } : s
        );
      })
      // Send Message
      .addCase(sendScheduleMessage.fulfilled, (state, action: PayloadAction<any>) => {
        const { id, raw } = action.payload;
        const newMessage = raw.data || raw;
        state.schedules = state.schedules.map((s) =>
          s.id === id ? { ...s, messages: [...(s.messages || []), newMessage] } : s
        );
      })
      // Fetch Applications
      .addCase(fetchScheduleApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchScheduleApplications.fulfilled, (state, action: PayloadAction<any>) => {
        const { id, applications, meta } = action.payload;
        state.loading = false;
        state.applications = applications || [];
        state.meta = meta;
        state.schedules = state.schedules.map((s) =>
          s.id === id ? { ...s, applications } : s
        );
      })
      .addCase(fetchScheduleApplications.rejected, (state, action) => {
        state.loading = false;
        state.applications = [];
        state.meta = null;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to fetch applications";
      })
      // Fetch Company Interview Schedules (New)
      .addCase(fetchCompanyInterviewSchedules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanyInterviewSchedules.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.schedules = action.payload || [];
        if (state.schedules.length > 0 && !state.selectedSchedule) {
          state.selectedSchedule = state.schedules[0];
        }
      })
      .addCase(fetchCompanyInterviewSchedules.rejected, (state, action) => {
        state.loading = false;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to fetch schedules";
      })
      // Fetch Applications By Schedule (New)
      .addCase(fetchApplicationsBySchedule.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplicationsBySchedule.fulfilled, (state, action: PayloadAction<any>) => {
        const {  applications, meta } = action.payload;
        state.loading = false;
        state.applications = applications || [];
        state.meta = meta;
      })
      .addCase(fetchApplicationsBySchedule.rejected, (state, action) => {
        state.loading = false;
        state.applications = [];
        state.meta = null;
        state.error = typeof action.payload === 'string' ? action.payload : "Failed to fetch applications";
      })

      // ── Scheduler Flow ──
      // Active Companies
      .addCase(fetchActiveCompaniesForSchedule.pending, (state) => {
        state.schedulerLoading = true;
      })
      .addCase(fetchActiveCompaniesForSchedule.fulfilled, (state, action: PayloadAction<any>) => {
        state.schedulerLoading = false;
        state.schedulerCompanies = action.payload?.data || [];
      })
      .addCase(fetchActiveCompaniesForSchedule.rejected, (state) => {
        state.schedulerLoading = false;
      })

      // Active Universities
      .addCase(fetchActiveUniversitiesForSchedule.pending, (state) => {
        state.schedulerLoading = true;
      })
      .addCase(fetchActiveUniversitiesForSchedule.fulfilled, (state, action: PayloadAction<any>) => {
        state.schedulerLoading = false;
        state.schedulerUniversities = action.payload?.data || [];
      })
      .addCase(fetchActiveUniversitiesForSchedule.rejected, (state) => {
        state.schedulerLoading = false;
      })

      // Company Jobs
      .addCase(fetchCompanyJobsForSchedule.pending, (state) => {
        state.schedulerLoading = true;
        state.schedulerJobs = [];
      })
      .addCase(fetchCompanyJobsForSchedule.fulfilled, (state, action: PayloadAction<any>) => {
        state.schedulerLoading = false;
        state.schedulerJobs = action.payload?.data || [];
      })
      .addCase(fetchCompanyJobsForSchedule.rejected, (state) => {
        state.schedulerLoading = false;
      })

      // University Jobs
      .addCase(fetchUniversityJobsForSchedule.pending, (state) => {
        state.schedulerLoading = true;
        state.schedulerJobs = [];
      })
      .addCase(fetchUniversityJobsForSchedule.fulfilled, (state, action: PayloadAction<any>) => {
        state.schedulerLoading = false;
        state.schedulerJobs = action.payload?.data || [];
      })
      .addCase(fetchUniversityJobsForSchedule.rejected, (state) => {
        state.schedulerLoading = false;
      });
  },
});


export const { clearError, setSelectedSchedule } = interviewSlice.actions;
export default interviewSlice.reducer;
