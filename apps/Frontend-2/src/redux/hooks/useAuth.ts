import { useSelector } from "react-redux";
import type { RootState } from "../store/store";
import type { AdminUser, StudentUser, CompanyUser, SuperAdminUser } from "../slices/authSlice";

/**
 * Central auth hook — access user details anywhere in the app.
 *
 * API stores: { id, firstname, lastname, email, role, status }
 *
 * Usage:
 *   const { user, isAuthenticated, userType, firstName, initials } = useAuth();
 *   const { adminData } = useAuth();    // only populated when role === "ADMIN"
 *   const { studentData } = useAuth();  // only populated when role === "STUDENT"
 *   const { companyData } = useAuth();  // only populated when role === "COMPANY"
 *   const { superAdminData } = useAuth(); // only populated when role is superadmin
 */
const useAuth = () => {
    const auth = useSelector((state: RootState) => state.auth);

    const user = auth.user;

   
    const firstName = user?.firstname ?? "User";

 
    const fullName = user ? `${user.firstname} ${user.lastname}` : "User";

    
    const initials = user
        ? `${user.firstname?.[0] ?? ""}${user.lastname?.[0] ?? ""}`.toUpperCase()
        : "?";

    return {
        // ── Core auth state ──────────────────────────────────────────────────
        user,
        token: auth.token,
        isAuthenticated: auth.isAuthenticated,
        userType: auth.userType,      // "ADMIN" | "STUDENT" | "COMPANY" | "SUPER_ADMIN" | "SUPERADMIN" | null
        loading: auth.loading,
        error: auth.error,
        isRestoringSession: auth.isRestoringSession,

        // ── Convenience derived values ───────────────────────────────────────
        firstName,
        fullName,
        initials,

        // ── Role-specific typed data ─────────────────────────────────────────
        adminData: auth.adminData as AdminUser | null,
        studentData: auth.studentData as StudentUser | null,
        companyData: auth.companyData as CompanyUser | null,
        superAdminData: auth.superAdminData as SuperAdminUser | null,

        // ── Role helpers ─────────────────────────────────────────────────────
        isAdmin: auth.userType === "ADMIN",
        isStudent: auth.userType === "STUDENT",
        isCompany: auth.userType === "COMPANY",
        isSuperAdmin: auth.userType === "SUPER_ADMIN" || auth.userType === "SUPERADMIN",
    };
};

export default useAuth;
