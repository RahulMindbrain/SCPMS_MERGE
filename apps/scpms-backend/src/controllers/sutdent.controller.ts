import { Request, Response } from "express";
import { sendError, sendSuccess } from "../utils/response";
import {
  applicationActionService,
  createStudentService,
  getStudentProfileService,
  updateStudentService,
} from "../services/student.service";

// export const createStudentController = async (req: Request, res: Response) => {
//   try {
//     const user = res.locals.user;
//     console.log(user);

//     const { departmentId, year, passingYear, cgpa } = req.body;

//     const student = await createStudentService(
//       user.id,
//       departmentId,
//       year,
//       passingYear,
//       cgpa,
//     );

//     return sendSuccess(res, 201, "Student profile created", student);
//   } catch (error: any) {
//     // console.log(error);
//     return sendError(res, 400, error.message);
//   }
// };
export const createStudentController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const student = await createStudentService(user.id, req.body);

    return sendSuccess(res, 201, "Student created", student);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};
export const getStudentProfileController = async (
  _req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const student = await getStudentProfileService(user.id);

    return sendSuccess(res, 200, "Student profile fetched", student);
  } catch (error: any) {
    return sendError(res, 404, error.message);
  }
};

export const updateStudentController = async (req: Request, res: Response) => {
  try {
    const user = res.locals.user;

    const updated = await updateStudentService(user.id, req.body);

    return sendSuccess(res, 200, "Student profile updated", updated);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};

export const applicationActionController = async (
  req: Request,
  res: Response,
) => {
  try {
    const user = res.locals.user;

    const { applicationId } = req.params;

    const { action } = req.body;

    if (!["ACCEPT", "REJECT"].includes(action)) {
      return sendError(res, 400, "Action must be ACCEPT or REJECT");
    }

    const result = await applicationActionService(
      user.id,
      Number(applicationId),
      action,
    );

    return sendSuccess(res, 200, "Action performed successfully", result);
  } catch (error: any) {
    return sendError(res, 400, error.message);
  }
};
