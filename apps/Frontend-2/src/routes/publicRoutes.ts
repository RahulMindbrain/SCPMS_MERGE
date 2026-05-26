import HomePage from "@/pages/public/homepage/homepage";
import type { RouteOptions } from "./type";
import NotFound from "@/pages/public/notFound/notFound";
import SignUp from "@/pages/public/signup/signup";
import SignIn from "@/pages/public/signin/signIn";
import ForgotPassword from "@/pages/public/forgotpassword/forget";

export const PublicRoutes: RouteOptions<any>[] = [
    {
        path: "/Home",
        component: HomePage,
    },
    {
        path: "/signup",
        component: SignUp,
    },
     {
        path: "/login",
        component: SignIn,
    },
    {
        path: "/Forgot",
        component: ForgotPassword,
    },
    
    {
        path: "*",
        component: NotFound,
    },
    
];
