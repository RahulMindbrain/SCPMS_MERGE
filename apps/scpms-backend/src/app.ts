import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import connectToDb from "./db/connectToDb.js";
import cookieParser from "cookie-parser";
import UserRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import CompanyRoutes from "./routes/company.routes.js";
import AuthRoutes from "./routes/auth.routes.js";
import StudentRoutes from "./routes/student.routes.js";
import DepartmentRoutes from "./routes/department.routes.js";
import cloudinaryRoute from "./routes/cloudinary.routes.js";
import Skillsroute from "./routes/skills.routes.js";
import scheduleRoute from "./routes/schedule.routes.js";
import { attachQueryLogger } from "./middlewares/queryLogger.js";
import notificationRouter from "./routes/notification.routes.js";
import saRouter from "./routes/superadmin.routes.js";
import jobUniversityRouter from "./routes/job.university.routes.js";
import universityRoutes from "./routes/university.routes.js";

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://7132f00b.scpms.pages.dev",
      "https://scpms-2.pages.dev",
      "https://scpms.pages.dev",
      "https://scpms-merge.pages.dev/",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

connectToDb();

app.get("/health", (_req, res) => {
  res.send("listening");
});
// app.use((req, _res, next) => {
//   console.log("---- INCOMING REQUEST ----");
//   console.log("URL:", req.method, req.url);
//   console.log("RAW COOKIE HEADER:", req.headers.cookie);
//   next();
// });

app.use("/auth", AuthRoutes);
app.use("/users", UserRoutes);
app.use("/admin", adminRoutes);
app.use("/company", CompanyRoutes);
app.use("/student", StudentRoutes);
app.use("/dept", DepartmentRoutes);
app.use("/cloudinary", cloudinaryRoute);
app.use("/skills", Skillsroute);
app.use("/interview-schedule", scheduleRoute);
app.use("/notification", notificationRouter);
app.use("/superadmin", saRouter);
app.use("/job-universities", jobUniversityRouter);
app.use("/university", universityRoutes);

// app.use(attachQueryLogger);

export default app;
