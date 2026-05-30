import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { analyzeJdMatch, optimizeResume, type AtsAnalysisResult, type OptimizedResumeResult } from "../thunks/atsThunk";

interface AtsState {
    result: AtsAnalysisResult | null;
    optimizedResume: OptimizedResumeResult | null;
    loading: boolean;
    optimizing: boolean;
    error: string | null;
}

const initialState: AtsState = {
    result: null,
    optimizedResume: null,
    loading: false,
    optimizing: false,
    error: null,
};        

const atsSlice = createSlice({
    name: "ats",
    initialState,
    reducers: {
        resetAtsState: (state) => {
            state.result = null;
            state.optimizedResume = null;
            state.loading = false;
            state.optimizing = false;
            state.error = null;
        },
        setOptimizedResume: (state, action: PayloadAction<OptimizedResumeResult | null>) => {
            state.optimizedResume = action.payload;
        },
        setAtsResult: (state, action: PayloadAction<AtsAnalysisResult | null>) => {
            state.result = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(analyzeJdMatch.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.result = null;
            })
            .addCase(analyzeJdMatch.fulfilled, (state, action: PayloadAction<AtsAnalysisResult>) => {
                state.loading = false;
                state.result = action.payload;
            })
            .addCase(analyzeJdMatch.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(optimizeResume.pending, (state) => {
                state.optimizing = true;
                state.error = null;
                state.optimizedResume = null;
            })
            .addCase(optimizeResume.fulfilled, (state, action: PayloadAction<OptimizedResumeResult>) => {
                state.optimizing = false;
                state.optimizedResume = action.payload;
            })
            .addCase(optimizeResume.rejected, (state, action) => {
                state.optimizing = false;
                state.error = action.payload as string;
            });
    },
});

export const { resetAtsState, setOptimizedResume, setAtsResult } = atsSlice.actions;
export default atsSlice.reducer;
