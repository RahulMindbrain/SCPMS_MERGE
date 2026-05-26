import { Request, Response } from "express";

import {
  createInterviewScheduleService,
  getAllSchedulesService,
  getScheduleByIdService,
  getCompanySchedulesService,
  updateScheduleService,
  deleteScheduleService,
  addJobsToScheduleService,
  removeJobsFromScheduleService,
  updateScheduleApprovalService,
  getSchedulesForUserService,
} from "../services/schedule.service";

import { sendSuccess, sendError } from "../utils/response";
import { getAdminByUserId } from "../repository/admin.repository";

export const createScheduleController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    if (user.role !== "ADMIN") {
      return sendError(res, 403, "Only admins can create schedules");
    }

    const { companyId, universityId, jobUniversityIds } = req.body;

    if (!companyId) {
      return sendError(res, 400, "companyId is required");
    }

    if (!universityId) {
      return sendError(res, 400, "universityId is required");
    }

    if (!Array.isArray(jobUniversityIds) || !jobUniversityIds.length) {
      return sendError(res, 400, "jobUniversityIds must be a non-empty array");
    }

    const admin = await getAdminByUserId(user.id);

    if (!admin) {
      return sendError(res, 404, "Admin not found");
    }

    const schedule = await createInterviewScheduleService({
      ...req.body,

      createdBy: admin.id,
    });

    return sendSuccess(res, 201, "Schedule created", schedule);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getAllSchedulesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const { id: userId, role } = res.locals.user;

    const companyId = req.query.companyId
      ? Number(req.query.companyId)
      : undefined;

    const data = await getAllSchedulesService(userId, role, companyId);

    return sendSuccess(res, 200, "Schedules fetched", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getScheduleByIdController = async (
  req: Request,
  res: Response,
) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return sendError(res, 400, "Invalid schedule id");
    }

    const data = await getScheduleByIdService(id);

    return sendSuccess(res, 200, "Schedule fetched", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const getCompanySchedulesController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const data = await getCompanySchedulesService(user.id);

    return sendSuccess(res, 200, "Company schedules fetched", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const updateScheduleController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return sendError(res, 400, "Invalid schedule id");
    }

    const data = await updateScheduleService(id, req.body);

    return sendSuccess(res, 200, "Schedule updated", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const deleteScheduleController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    if (isNaN(id)) {
      return sendError(res, 400, "Invalid schedule id");
    }

    await deleteScheduleService(id);

    return sendSuccess(res, 200, "Schedule deleted", {});
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const addJobsController = async (req: Request, res: Response) => {
  try {
    const scheduleId = Number(req.params.id);

    if (isNaN(scheduleId)) {
      return sendError(res, 400, "Invalid schedule id");
    }

    const { jobUniversityIds } = req.body;

    if (!Array.isArray(jobUniversityIds) || !jobUniversityIds.length) {
      return sendError(res, 400, "jobUniversityIds must be a non-empty array");
    }

    const result = await addJobsToScheduleService(scheduleId, jobUniversityIds);

    return sendSuccess(res, 200, "Job universities added to schedule", result);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const removeJobsController = async (req: Request, res: Response) => {
  try {
    const { jobUniversityIds } = req.body;

    if (!Array.isArray(jobUniversityIds) || !jobUniversityIds.length) {
      return sendError(res, 400, "jobUniversityIds must be a non-empty array");
    }

    await removeJobsFromScheduleService(jobUniversityIds);

    return sendSuccess(res, 200, "Job universities removed from schedule", {});
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const updateScheduleApprovalController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const scheduleId = Number(req.params.id);

    if (isNaN(scheduleId)) {
      return sendError(res, 400, "Invalid schedule id");
    }

    const { status, rejectionReason } = req.body;

    if (!status) {
      return sendError(res, 400, "Approval status is required");
    }

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return sendError(res, 400, "Invalid approval status");
    }

    const data = await updateScheduleApprovalService(
      scheduleId,
      user.id,
      status,
      rejectionReason,
    );

    return sendSuccess(res, 200, "Schedule updated", data);
  } catch (error: any) {
    console.error(error);

    return sendError(res, 400, error.message);
  }
};

export const getSchedulesForUserController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const companyId = req.query.companyId
      ? Number(req.query.companyId)
      : undefined;

    const data = await getSchedulesForUserService(
      user.id,
      user.role,
      companyId,
    );

    return sendSuccess(res, 200, "Schedules fetched", data);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

// import { Request, Response } from "express";

// import {
//   createInterviewScheduleService,
//   getAllSchedulesService,
//   getScheduleByIdService,
//   getCompanySchedulesService,
//   updateScheduleService,
//   deleteScheduleService,
//   addJobsToScheduleService,
//   removeJobsFromScheduleService,
//   approveScheduleService,
//   updateScheduleApprovalService,
//   getSchedulesForUserService,
// } from "../services/schedule.service";

// import { sendSuccess, sendError } from "../utils/response";

// export const createScheduleController = async (req: Request, res: Response) => {
//   try {
//     const user = res.locals.user;

//     if (user.role !== "ADMIN") {
//       return sendError(res, 403, "Only admins can create schedules");
//     }

//     const { companyId, universityId, jobIds } = req.body;

//     if (!companyId) {
//       return sendError(res, 400, "companyId is required");
//     }

//     if (!universityId) {
//       return sendError(res, 400, "universityId is required");
//     }

//     if (!Array.isArray(jobIds) || !jobIds.length) {
//       return sendError(res, 400, "jobIds must be a non-empty array");
//     }

//     const schedule = await createInterviewScheduleService({
//       ...req.body,

//       createdBy: user.id,
//     });

//     return sendSuccess(res, 201, "Schedule created", schedule);
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };

// export const getAllSchedulesController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const { id: userId, role } = res.locals.user;

//     const companyId = req.query.companyId
//       ? Number(req.query.companyId)
//       : undefined;

//     const data = await getAllSchedulesService(userId, role, companyId);

//     return sendSuccess(res, 200, "Schedules fetched", data);
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };

// export const getScheduleByIdController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const id = Number(req.params.id);

//     if (isNaN(id)) {
//       return sendError(res, 400, "Invalid schedule id");
//     }

//     const data = await getScheduleByIdService(id);

//     return sendSuccess(res, 200, "Schedule fetched", data);
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };

// export const getCompanySchedulesController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const user = res.locals.user;

//     const data = await getCompanySchedulesService(user.id);

//     return sendSuccess(res, 200, "Company schedules fetched", data);
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };

// export const updateScheduleController = async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);

//     if (isNaN(id)) {
//       return sendError(res, 400, "Invalid schedule id");
//     }

//     const data = await updateScheduleService(id, req.body);

//     return sendSuccess(res, 200, "Schedule updated", data);
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };

// export const deleteScheduleController = async (req: Request, res: Response) => {
//   try {
//     const id = Number(req.params.id);

//     if (isNaN(id)) {
//       return sendError(res, 400, "Invalid schedule id");
//     }

//     await deleteScheduleService(id);

//     return sendSuccess(res, 200, "Schedule deleted", {});
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };

// export const addJobsController = async (req: Request, res: Response) => {
//   try {
//     const scheduleId = Number(req.params.id);

//     if (isNaN(scheduleId)) {
//       return sendError(res, 400, "Invalid schedule id");
//     }

//     const { jobIds } = req.body;

//     if (!Array.isArray(jobIds) || !jobIds.length) {
//       return sendError(res, 400, "jobIds must be a non-empty array");
//     }

//     const result = await addJobsToScheduleService(scheduleId, jobIds);

//     return sendSuccess(res, 200, "Jobs added to schedule", result);
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };

// export const removeJobsController = async (req: Request, res: Response) => {
//   try {
//     const { jobIds } = req.body;

//     if (!Array.isArray(jobIds) || !jobIds.length) {
//       return sendError(res, 400, "jobIds must be a non-empty array");
//     }

//     await removeJobsFromScheduleService(jobIds);

//     return sendSuccess(res, 200, "Jobs removed from schedule", {});
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };

// export const updateScheduleApprovalController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const user = res.locals.user;

//     const scheduleId = Number(req.params.id);

//     if (isNaN(scheduleId)) {
//       return sendError(res, 400, "Invalid schedule id");
//     }

//     const { status, rejectionReason } = req.body;

//     if (!status) {
//       return sendError(res, 400, "Approval status is required");
//     }

//     if (!["APPROVED", "REJECTED"].includes(status)) {
//       return sendError(res, 400, "Invalid approval status");
//     }

//     const data = await updateScheduleApprovalService(
//       scheduleId,
//       user.id,
//       status,
//       rejectionReason,
//     );

//     return sendSuccess(res, 200, "Schedule updated", data);
//   } catch (error: any) {
//     console.error(error);

//     return sendError(res, 400, error.message);
//   }
// };

// export const getSchedulesForUserController = async (
//   req: Request,
//   res: Response,
// ) => {
//   try {
//     const user = res.locals.user;

//     const companyId = req.query.companyId
//       ? Number(req.query.companyId)
//       : undefined;

//     const data = await getSchedulesForUserService(
//       user.id,
//       user.role,
//       companyId,
//     );

//     return sendSuccess(res, 200, "Schedules fetched", data);
//   } catch (error: any) {
//     return sendError(res, 400, error.message);
//   }
// };
