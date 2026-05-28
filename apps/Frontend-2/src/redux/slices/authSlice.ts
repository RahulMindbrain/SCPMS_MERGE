import { createSlice } from "@reduxjs/toolkit";
import { loginUser } from "../thunks/loginThunk";
import { restoreSession } from "../thunks/restoreSessionThunk";
import { setAuthToken } from "../../apis/api";

// ─── Role-Specific User Shapes ────────────────────────────────────────────────

export interface AdminUser {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: "ADMIN";
    status: string;
}

export interface StudentUser {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: "STUDENT";
    status: string;
    // extend with student-specific fields as the backend evolves
    department?: string;
    batch?: string;
    cgpa?: number;
}

export interface CompanyUser {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: "COMPANY";
    status: string;
    // extend with company-specific fields as the backend evolves
    companyName?: string;
}

export interface SuperAdminUser {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    role: "SUPER_ADMIN" | "SUPERADMIN";
    status: string;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface AuthState {
    isAuthenticated: boolean;
    userType: "ADMIN" | "STUDENT" | "COMPANY" | "SUPER_ADMIN" | "SUPERADMIN" | null;

    /** Full raw user object regardless of role */
    user: AdminUser | StudentUser | CompanyUser | SuperAdminUser | null;

    /** Role-specific stores — only the relevant one is populated after login */
    adminData: AdminUser | null;
    studentData: StudentUser | null;
    companyData: CompanyUser | null;
    superAdminData: SuperAdminUser | null;

    /** JWT token — set only if the API returns one (may be null for cookie-auth) */
    token: string | null;

    loading: boolean;
    error: string | null;
    isRestoringSession: boolean;
}

// ─── Helper: Persistence ───────────────────────────────────────────────────

const getInitialAuth = (): AuthState => {
    try {
        const userStr = localStorage.getItem("scpms_user");
        const token = localStorage.getItem("scpms_token");
        if (userStr) {
            const user = JSON.parse(userStr);
            const role = user.role?.toUpperCase() as AuthState["userType"];
            return {
                isAuthenticated: true,
                userType: role,
                user: user,
                adminData: role === "ADMIN" ? (user as AdminUser) : null,
                studentData: role === "STUDENT" ? (user as StudentUser) : null,
                companyData: role === "COMPANY" ? (user as CompanyUser) : null,
                superAdminData:
                    role === "SUPER_ADMIN" || role === "SUPERADMIN"
                        ? (user as SuperAdminUser)
                        : null,
                token: token,
                loading: false,
                error: null,
                isRestoringSession: true,
            };
        }
    } catch (e) {
        console.error("Error loading auth state from localStorage:", e);
    }

    return {
        isAuthenticated: false,
        userType: null,
        user: null,
        adminData: null,
        studentData: null,
        companyData: null,
        superAdminData: null,
        token: null,
        loading: false,
        error: null,
        isRestoringSession: true,
    };
};

const initialState: AuthState = getInitialAuth();

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {

        logout: (state) => {
            state.isAuthenticated = false;
            state.userType = null;
            state.user = null;
            state.adminData = null;
            state.studentData = null;
            state.companyData = null;
            state.superAdminData = null;
            state.token = null;
            state.error = null;
            state.isRestoringSession = false;
            // Clear token from axios default headers + localStorage
            setAuthToken(null);
            localStorage.removeItem("scpms_user");
        },

    },

    extraReducers: (builder) => {
        builder

            // ── Login pending ──────────────────────────────────────────────
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            // ── Login success ──────────────────────────────────────────────
            // API shape: { success, message, data: { id, firstname, lastname, email, role, status }, token? }
            .addCase(loginUser.fulfilled, (state, action) => {
                const payload = action.payload;
                const user: AdminUser | StudentUser | CompanyUser | SuperAdminUser = payload.data;
                const token: string | undefined = payload.token;

                state.loading = false;
                state.isAuthenticated = true;
                
                // Normalize role to uppercase for internal state consistency
                const normalizedRole = user.role.toUpperCase() as AuthState["userType"];
                user.role = normalizedRole as any; 

                state.user = user;
                state.userType = normalizedRole;

                // ── Store in role-specific slot ────────────────────────────
                if (normalizedRole === "ADMIN") {
                    state.adminData = user as AdminUser;
                } else if (normalizedRole === "STUDENT") {
                    state.studentData = user as StudentUser;
                } else if (normalizedRole === "COMPANY") {
                    state.companyData = user as CompanyUser;
                } else if (normalizedRole === "SUPER_ADMIN" || normalizedRole === "SUPERADMIN") {
                    state.superAdminData = user as SuperAdminUser;
                }

                // ── Token (if API returns one; otherwise falls back to cookie) ─
                state.token = token ?? null;
                if (token) {
                    setAuthToken(token);
                }
                localStorage.setItem("scpms_user", JSON.stringify(user));
            })

            // ── Login failure ──────────────────────────────────────────────
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload as string;
            })

            // ── Restore Session pending ─────────────────────────────────────
            .addCase(restoreSession.pending, (state) => {
                state.isRestoringSession = true;
                state.error = null;
            })

            // ── Restore Session success ─────────────────────────────────────
            .addCase(restoreSession.fulfilled, (state, action) => {
                const payload = action.payload;
                const user: AdminUser | StudentUser | CompanyUser | SuperAdminUser = payload.data;
                const token: string | undefined = payload.token;

                state.isRestoringSession = false;
                state.isAuthenticated = true;

                const normalizedRole = user.role.toUpperCase() as AuthState["userType"];
                user.role = normalizedRole as any;

                state.user = user;
                state.userType = normalizedRole;

                if (normalizedRole === "ADMIN") {
                    state.adminData = user as AdminUser;
                } else if (normalizedRole === "STUDENT") {
                    state.studentData = user as StudentUser;
                } else if (normalizedRole === "COMPANY") {
                    state.companyData = user as CompanyUser;
                } else if (normalizedRole === "SUPER_ADMIN" || normalizedRole === "SUPERADMIN") {
                    state.superAdminData = user as SuperAdminUser;
                }

                if (token) {
                    state.token = token;
                    setAuthToken(token);
                }
                localStorage.setItem("scpms_user", JSON.stringify(user));
            })

            // ── Restore Session failure ─────────────────────────────────────
            .addCase(restoreSession.rejected, (state) => {
                state.isRestoringSession = false;
                state.isAuthenticated = false;
                state.user = null;
                state.userType = null;
                state.adminData = null;
                state.studentData = null;
                state.companyData = null;
                state.superAdminData = null;
                state.token = null;
                localStorage.removeItem("scpms_user");
                setAuthToken(null);
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;