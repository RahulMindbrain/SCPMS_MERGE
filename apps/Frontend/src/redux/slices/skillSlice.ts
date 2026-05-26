import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { fetchSkills } from "../thunks/skillThunk";

interface SkillState {
  skills: any[];
  loading: boolean;
  error: string | null;
}

const initialState: SkillState = {
  skills: [],
  loading: false,
  error: null,
};

const skillSlice = createSlice({
  name: "skill",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSkills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSkills.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.skills = Array.isArray(action.payload?.data) ? action.payload.data : [];
      })
      .addCase(fetchSkills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default skillSlice.reducer;
