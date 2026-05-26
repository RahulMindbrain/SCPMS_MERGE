import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export interface AtsAnalysisPayload {
    resumeUrl: string;
    jobDescription: string;
}

export interface AtsAnalysisResult {
    atsScore: number;
    suggestions: string[];
    missingSkills: string[];
    topStrengths: string[];
    weaknesses: string[];
}

export interface OptimizedResumeResult {
    fullName: string;
    phone: string;
    email: string;
    linkedin: string | null;
    portfolio: string | null;
    github: string | null;
    location: string;
    targetRole: string;
    summary: string;
    skills: string[];
    languages: string;
    frameworks: string[];
    cloud: string[];
    certifications: string;
    experience: any[];
    education: {
        degree: string;
        field: string;
        university: string;
        year: string;
    }[];
    projects: {
        name: string;
        techStack: string | null;
        highlights: string[];
    }[];
    achievements: {
        label: string;
        value: string | null;
    }[];
}

const INTEGRATION_BASE_URL = "http://localhost:5000";

export const analyzeJdMatch = createAsyncThunk(
    "ats/analyzeJdMatch",
    async (data: AtsAnalysisPayload, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${INTEGRATION_BASE_URL}/integration/analyze-jd-match`, data, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const resData = response.data;
            if (resData && resData.success) {
                return {
                    atsScore: Number(resData.atsScore || 0),
                    suggestions: Array.isArray(resData.suggestions) ? resData.suggestions : [],
                    missingSkills: Array.isArray(resData.missingSkills) ? resData.missingSkills : [],
                    topStrengths: Array.isArray(resData.topStrengths) ? resData.topStrengths : [],
                    weaknesses: Array.isArray(resData.weaknesses) ? resData.weaknesses : [],
                } as AtsAnalysisResult;
            }
            return rejectWithValue(resData?.error || "Invalid response from analyzer");
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.error || error?.message || "Failed to analyze resume"
            );
        }
    }
);

export const optimizeResume = createAsyncThunk(
    "ats/optimizeResume",
    async (data: AtsAnalysisPayload, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${INTEGRATION_BASE_URL}/integration/optimize-resume`, data, {
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const resData = response.data;
            if (resData && resData.success && resData.optimizedResume) {
                return resData.optimizedResume as OptimizedResumeResult;
            }
            return rejectWithValue(resData?.error || "Invalid response from optimizer");
        } catch (error: any) {
            return rejectWithValue(
                error?.response?.data?.error || error?.message || "Failed to optimize resume"
            );
        }
    }
);

