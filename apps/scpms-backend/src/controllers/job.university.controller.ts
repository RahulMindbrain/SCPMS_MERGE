import { Request, Response } from "express";
import {
  getJobUniversitiesService,
  reapplyJobUniversityService,
  sendJobToUniversitiesService,
  updateJobUniversityStatusService,
} from "../services/job.university.service";

export const sendJobToUniversitiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const { jobId, jobUniversities } = req.body;

    const data = await sendJobToUniversitiesService(
      jobId,
      jobUniversities,
      user.id,
    );

    return res.status(201).json({
      message: "Job sent to universities",
      data,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const updateJobUniversityStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const { ids, status } = req.body;

    const result = await updateJobUniversityStatusService(ids, status, user.id);

    return res.status(200).json({
      message: "Status updated",
      ...result,
    });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getJobUniversitiesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const parsedQuery: any = {};

    if (req.query.page) parsedQuery.page = Number(req.query.page);
    if (req.query.limit) parsedQuery.limit = Number(req.query.limit);
    if (req.query.universityId)
      parsedQuery.universityId = Number(req.query.universityId);
    if (req.query.companyId)
      parsedQuery.companyId = Number(req.query.companyId);
    if (req.query.departmentId)
      parsedQuery.departmentId = Number(req.query.departmentId);
    if (req.query.minCgpa) parsedQuery.minCgpa = Number(req.query.minCgpa);
    if (req.query.status) parsedQuery.status = req.query.status;

    const data = await getJobUniversitiesService(parsedQuery, user);

    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const reapplyJobUniversityController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const { jobId, universityId, ...data } = req.body;

    if (!jobId || !universityId) {
      return res
        .status(400)
        .json({ message: "jobId and universityId required" });
    }

    const result = await reapplyJobUniversityService(
      Number(jobId),
      Number(universityId),
      user.id,
      data,
    );

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
