// store/applications/applications.slice.ts
import { createSlice } from "@reduxjs/toolkit";
import { fetchApplications } from "../thunks/applicationThunk";

interface ApplicationsState {
  applications: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ApplicationsState = {
  applications: [],
  loading: false,
  error: null,
};

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        // Normalize API shapes:
        // - array
        // - { data: [...] }
        // - { data: { applications: [...] } }
        // - { applications: [...] }
        state.applications = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : Array.isArray(payload?.data?.applications)
              ? payload.data.applications
              : Array.isArray(payload?.applications)
                ? payload.applications
                : [];
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default applicationsSlice.reducer;