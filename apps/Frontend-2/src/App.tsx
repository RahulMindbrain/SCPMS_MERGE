import { Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";
import { useSelector } from "react-redux";
import type { RootState } from "./redux/reducers/rootReducer";
import RouteOutlet from "./routes/routeOutlet.tsx";
import { ScrollToTop } from "./components/scroll-to-top";
import { PublicRoutes } from "./routes/publicRoutes.ts";
import { PrivateRoutes } from "./routes/privateRoutes.ts";

import HomePage from "./pages/public/homepage/homepage.tsx";

function App() {
  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" visibleToasts={1} richColors />

      <Routes>
        {/* Private routes first - when authenticated, these will be matched */}
        <Route element={<RouteOutlet />}>
          <Route>
            {PrivateRoutes.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                Component={route.component}
              />
            ))}
          </Route>
        </Route>

        {/* Public routes - only matched if not authenticated or for public-only routes */}
        {PublicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            Component={route.component}
          />
        ))}

        <Route path={"/"} element={<PrivateLoginRedirect />} />
      </Routes>
    </>
  );
}

const PrivateLoginRedirect = () => {
  const { isAuthenticated, userType } = useSelector(
    (state: RootState) => state.auth
  );

  if (!isAuthenticated) {
    return <HomePage />;
  }

  // Redirect based on user role
  const role = userType?.toLowerCase();
  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (role === "student") {
    return <Navigate to="/student/dashboard" replace />;
  } else if (role === "company") {
    return <Navigate to="/company/dashboard" replace />;
  } else if (role === "super_admin" || role === "superadmin") {
    return <Navigate to="/superadmin/dashboard" replace />;
  } else {
    return <HomePage />;
  }
};

export default App;