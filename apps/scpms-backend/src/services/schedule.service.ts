import {
  checkScheduleConflict,
  createScheduleWithJobs,
  getAllSchedules,
  getScheduleById,
  getSchedulesByCompany,
  updateSchedule,
  deleteSchedule,
  attachJobsToSchedule,
  detachJobsFromSchedule,
  getScheduleWithJobsAndApplications,
  updateScheduleApprovalStatus,
  getSchedulesByCompanyIdRepo,
} from "../repository/schedule.repository";

import {
  getCompanyById,
  getCompanyByUserId,
} from "../repository/company.repository";
import { getJobsByIds } from "../repository/job.repository";
import { sendInterviewNotificationEmail } from "./mail/mail.notify.service";
import { getAppliedStudentsForJobs } from "../repository/student.repository";
import { sendScheduleDiscussionEmail } from "./mail/mail.schedule.service";
import {
  ApplicationStatus,
  InterviewRound,
  NotificationType,
  Prisma,
  ScheduleStatus,
} from "@prisma/client";
import {
  createManyNotifications,
  createNotification,
} from "../repository/notification.repository";
import { runInBackground } from "../utils/Background.task";
import { emitToUser, emitToUsers } from "../socket";
import { SOCKET_EVENTS } from "../socket.event";
import { normalizeText } from "../utils/normalize.utils";
import prisma from "../config/db";
import { isCompanyApprovedForUniversity } from "../repository/company.university.repository";
import { sendMail } from "../utils/mails/transporter.mail";
import {
  createApplicationHistory,
  getApplicationById,
  updateApplicationStatus,
} from "../repository/application.repository";
import {
  allowedRoundTransitions,
  allowedStatusTransitions,
} from "../constants/workflow.constants";

type CreateInterviewScheduleInput = {
  title: string;
  companyId: number;
  jobUniversityIds: number[];
  startTime: Date | string;
  endTime: Date | string;
  venue?: string;
  createdBy: number;
  universityId: number;
};

type UpdateScheduleInput = {
  title?: string;
  startTime?: Date | string;
  endTime?: Date | string;
  venue?: string;
};

export const createInterviewScheduleService = async (
  data: CreateInterviewScheduleInput,
) => {
  if (data.title !== undefined) {
    data.title = normalizeText(data.title);
  }

  if (data.venue !== undefined) {
    data.venue = normalizeText(data.venue);
  }

  const {
    companyId,
    jobUniversityIds,
    startTime,
    endTime,
    venue,
    createdBy,
    universityId,
  } = data;

  if (!companyId) {
    throw new Error("CompanyId required");
  }

  if (!universityId) {
    throw new Error("UniversityId required");
  }

  if (!jobUniversityIds || !jobUniversityIds.length) {
    throw new Error("At least one job university is required");
  }

  const start = new Date(startTime);

  const end = new Date(endTime);

  if (start >= end) {
    throw new Error("Invalid time range");
  }

  const company = await getCompanyById(companyId);

  if (!company) {
    throw new Error("Company not found");
  }

  const isApproved = await isCompanyApprovedForUniversity(
    companyId,
    universityId,
  );

  if (!isApproved) {
    throw new Error("Company not approved for this university");
  }

  const jobUniversities = await prisma.jobUniversity.findMany({
    where: {
      id: {
        in: jobUniversityIds,
      },
    },

    include: {
      job: true,
    },
  });

  if (jobUniversities.length !== jobUniversityIds.length) {
    throw new Error("Some job universities not found");
  }

  for (const jobUniversity of jobUniversities) {
    if (jobUniversity.job.companyId !== companyId) {
      throw new Error(`Job ${jobUniversity.jobId} does not belong to company`);
    }

    if (jobUniversity.universityId !== universityId) {
      throw new Error(
        `JobUniversity ${jobUniversity.id} does not belong to university`,
      );
    }

    if (jobUniversity.status !== "APPROVED") {
      throw new Error(`JobUniversity ${jobUniversity.id} is not approved`);
    }

    if (jobUniversity.interviewScheduleId) {
      throw new Error(`JobUniversity ${jobUniversity.id} already scheduled`);
    }
  }

  const conflict = await checkScheduleConflict(start, end, companyId, venue);

  if (conflict) {
    throw new Error("Schedule conflict");
  }

  const schedule = await createScheduleWithJobs(
    {
      title: data.title,
      companyId,
      universityId,
      startTime: start,
      endTime: end,
      ...(venue && { venue }),
      createdBy,
    },

    jobUniversityIds,
  );

  if (!schedule) {
    throw new Error("Failed to create schedule");
  }

  runInBackground(async () => {
    try {
      const applications = await prisma.application.findMany({
        where: {
          jobUniversityId: {
            in: jobUniversityIds,
          },
        },

        select: {
          student: {
            select: {
              user: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      const userIds = [
        ...new Set(applications.map((app) => app.student.user.id)),
      ];

      if (!userIds.length) return;

      emitToUsers(userIds, SOCKET_EVENTS.SCHEDULE_CREATED, {
        scheduleId: schedule.id,
        title: schedule.title,
        startTime: schedule.startTime,
      });

      await createManyNotifications(
        userIds.map((userId) => ({
          userId,

          title: "Interview Scheduled",

          message: `Interview scheduled for ${schedule.title}`,

          type: NotificationType.SCHEDULE_CREATED,
        })),
      );
    } catch (err) {
      console.error("Schedule notification failed", err);
    }
  });

  return schedule;
};

export const getAllSchedulesService = async (
  userId: number,
  role: "ADMIN" | "COMPANY",
  companyIdFromQuery?: number,
) => {
  let companyId: number;

  if (role === "COMPANY") {
    const company = await getCompanyByUserId(userId);

    if (!company) {
      throw new Error("Company not found");
    }

    companyId = company.id;
  } else {
    if (!companyIdFromQuery) {
      throw new Error("Company ID is required");
    }

    companyId = companyIdFromQuery;
  }

  return getAllSchedules(companyId);
};

export const getScheduleByIdService = async (id: number) => {
  const schedule = await getScheduleById(id);

  if (!schedule) throw new Error("Schedule not found");

  return schedule;
};

export const getCompanySchedulesService = async (companyId: number) => {
  return getSchedulesByCompany(companyId);
};

export const updateScheduleService = async (
  id: number,
  data: UpdateScheduleInput,
) => {
  if (data.title !== undefined) {
    data.title = normalizeText(data.title);
  }

  if (data.venue !== undefined) {
    data.venue = normalizeText(data.venue);
  }
  const existing = await getScheduleById(id);
  if (!existing) throw new Error("Schedule not found");

  if (existing.companyApprovalStatus === "APPROVED") {
    const hasApplications = await prisma.application.count({
      where: {
        jobUniversity: {
          interviewScheduleId: id,
        },
      },
    });

    if (hasApplications > 0) {
      throw new Error(
        "Cannot modify approved schedule with active applications",
      );
    }
  }

  const start = data.startTime ? new Date(data.startTime) : existing.startTime;

  const end = data.endTime ? new Date(data.endTime) : existing.endTime;

  if (start >= end) {
    throw new Error("Invalid time range");
  }

  const venue =
    data.venue !== undefined ? data.venue : (existing.venue ?? undefined);

  const conflict = await checkScheduleConflict(
    start,
    end,
    existing.companyId,
    venue,
  );

  if (conflict && conflict.id !== id) {
    throw new Error("Schedule conflict detected");
  }

  const updatePayload = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.startTime !== undefined && { startTime: start }),
    ...(data.endTime !== undefined && { endTime: end }),
    ...(data.venue !== undefined && { venue: data.venue }),
  };

  const shouldReset =
    data.title !== undefined ||
    data.startTime !== undefined ||
    data.endTime !== undefined ||
    data.venue !== undefined;

  return updateSchedule(id, {
    ...updatePayload,
    ...(shouldReset && {
      companyApprovalStatus: "PENDING",
      approvedAt: null,
      rejectedAt: null,
      rejectionReason: null,
    }),
  });
};

export const deleteScheduleService = async (id: number) => {
  return prisma.$transaction(async (tx) => {
    const schedule = await tx.interviewSchedule.findUnique({
      where: {
        id,
      },

      select: {
        jobUniversities: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new Error("Schedule not found");
    }

    const jobUniversityIds = schedule.jobUniversities.map((j) => j.id);

    if (jobUniversityIds.length) {
      await tx.jobUniversity.updateMany({
        where: {
          id: {
            in: jobUniversityIds,
          },
        },

        data: {
          interviewScheduleId: null,
        },
      });
    }

    await tx.scheduleMessage.deleteMany({
      where: {
        scheduleId: id,
      },
    });

    await tx.interviewSchedule.delete({
      where: {
        id,
      },
    });
  });
};

export const addJobsToScheduleService = async (
  scheduleId: number,
  jobUniversityIds: number[],
) => {
  const schedule = await getScheduleById(scheduleId);

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  if (schedule.companyApprovalStatus === "APPROVED") {
    throw new Error("Approved schedules cannot be modified");
  }

  const jobUniversities = await prisma.jobUniversity.findMany({
    where: {
      id: {
        in: jobUniversityIds,
      },
    },

    include: {
      job: true,
    },
  });

  for (const jobUniversity of jobUniversities) {
    if (jobUniversity.job.companyId !== schedule.companyId) {
      throw new Error(
        `Job ${jobUniversity.jobId} does not belong to schedule company`,
      );
    }

    if (jobUniversity.universityId !== schedule.universityId) {
      throw new Error(
        `JobUniversity ${jobUniversity.id} does not belong to schedule university`,
      );
    }

    if (jobUniversity.status !== "APPROVED") {
      throw new Error(`JobUniversity ${jobUniversity.id} is not approved`);
    }

    if (jobUniversity.interviewScheduleId) {
      throw new Error(`JobUniversity ${jobUniversity.id} already scheduled`);
    }
  }

  return attachJobsToSchedule(scheduleId, jobUniversityIds);
};

export const removeJobsFromScheduleService = async (
  jobUniversityIds: number[],
) => {
  const jobUniversities = await prisma.jobUniversity.findMany({
    where: {
      id: {
        in: jobUniversityIds,
      },
    },

    select: {
      id: true,

      interviewScheduleId: true,

      interviewSchedule: {
        select: {
          id: true,

          companyApprovalStatus: true,
        },
      },
    },
  });

  if (jobUniversities.length !== jobUniversityIds.length) {
    throw new Error("Some job universities not found");
  }

  for (const jobUniversity of jobUniversities) {
    if (!jobUniversity.interviewScheduleId) {
      throw new Error(
        `JobUniversity ${jobUniversity.id} is not attached to any schedule`,
      );
    }

    if (jobUniversity.interviewSchedule?.companyApprovalStatus === "APPROVED") {
      throw new Error(`Approved schedules cannot be modified`);
    }
  }

  return detachJobsFromSchedule(jobUniversityIds);
};

export const approveScheduleService = async (
  scheduleId: number,
  companyUserId: number,
) => {
  const schedule = await getScheduleWithJobsAndApplications(scheduleId);

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  if (schedule.company.userId !== companyUserId) {
    throw new Error("Unauthorized");
  }

  if (schedule.companyApprovalStatus !== "PENDING") {
    throw new Error("Already processed");
  }

  const applications = schedule.jobUniversities.flatMap(
    (ju) => ju.applications,
  );

  const uniqueStudentsMap = new Map();

  for (const app of applications) {
    const student = app.student;

    const email = student.user.email;

    if (!uniqueStudentsMap.has(email)) {
      uniqueStudentsMap.set(email, {
        email,

        firstname: student.user.firstname,

        userId: student.user.id,
      });
    }
  }

  const students = Array.from(uniqueStudentsMap.values());

  const updated = await updateScheduleApprovalStatus(scheduleId, {
    companyApprovalStatus: "APPROVED",

    approvedAt: new Date(),
  });

  const userIds = [...new Set(students.map((s) => s.userId))];

  if (userIds.length) {
    emitToUsers(
      userIds,

      SOCKET_EVENTS.SCHEDULE_APPROVED,

      {
        scheduleId: schedule.id,

        title: schedule.title,

        startTime: schedule.startTime,

        endTime: schedule.endTime,

        venue: schedule.venue,

        companyName: schedule.company.name,
      },
    );

    await createManyNotifications(
      userIds.map((userId) => ({
        userId,

        title: "Interview Schedule Approved",

        message: `Interview schedule confirmed for ${schedule.title}`,

        type: NotificationType.SCHEDULE_APPROVED,
      })),
    );
  }

  if (students.length) {
    sendInterviewNotificationEmail({
      students,

      schedule,

      companyName: schedule.company.name,
    }).catch(console.error);
  }

  return updated;
};

export const updateApplicationService = async ({
  applicationId,
  status,
  currentRound,
  reason,
  remarks,
  updatedBy,
}: {
  applicationId: number;

  status: ApplicationStatus;

  currentRound?: InterviewRound;

  reason?: string;

  remarks?: string;

  updatedBy: number;
}) => {
  const existing = await getApplicationById(applicationId);

  if (!existing) {
    throw new Error("Application not found");
  }

  if (existing.status === status && existing.currentRound === currentRound) {
    throw new Error("Application already in same status and round");
  }

  if (existing.status === "REJECTED") {
    throw new Error("Rejected applications cannot be updated");
  }

  if (
    existing.status === "OFFER_ACCEPTED" ||
    existing.status === "OFFER_REJECTED"
  ) {
    throw new Error("Offer already finalized");
  }

  const allowedStatuses =
    allowedStatusTransitions[existing.status as ApplicationStatus];

  if (!allowedStatuses.includes(status)) {
    throw new Error(
      `Invalid status transition from ${existing.status} to ${status}`,
    );
  }

  if (status !== "SHORTLISTED" && currentRound) {
    throw new Error("Rounds can only be updated for shortlisted applications");
  }

  if (existing.currentRound && currentRound) {
    const allowedRounds =
      allowedRoundTransitions[existing.currentRound as InterviewRound];

    if (!allowedRounds.includes(currentRound)) {
      throw new Error(
        `Invalid round transition from ${existing.currentRound} to ${currentRound}`,
      );
    }
  }

  const finalStatuses: ApplicationStatus[] = [
    "SELECTED",
    "REJECTED",
    "OFFER_ACCEPTED",
    "OFFER_REJECTED",
  ];

  if (finalStatuses.includes(status)) {
    currentRound = undefined;
  }

  const application = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const updatedApplication = await updateApplicationStatus(
        tx,
        applicationId,
        {
          status,

          currentRound,

          ...(reason && {
            reason,
          }),
        },
      );

      await createApplicationHistory(tx, {
        applicationId,

        status,

        round: currentRound ?? null,

        reason: reason ?? null,

        remarks: remarks ?? null,

        createdBy: updatedBy ?? null,
      });

      return updatedApplication;
    },
  );

  emitToUser(
    application.student.userId,

    SOCKET_EVENTS.APPLICATION_STATUS_UPDATED,

    {
      applicationId: application.id,

      status: application.status,

      currentRound: application.currentRound,

      jobUniversityId: application.jobUniversity.id,

      jobTitle: application.jobUniversity.job.title,
    },
  );

  try {
    let title = "Application Updated";

    let message = `Your application for ${application.jobUniversity.job.title} has been updated`;

    if (status === "SHORTLISTED") {
      if (currentRound === "HR") {
        title = "HR Round Shortlisted";

        message = `You have been shortlisted for the HR round for ${application.jobUniversity.job.title}`;
      }

      if (currentRound === "TECHNICAL") {
        title = "Technical Interview Round";

        message = `You have been shortlisted for the Technical round for ${application.jobUniversity.job.title}`;
      }

      if (currentRound === "MANAGERIAL") {
        title = "Managerial Interview Round";

        message = `You have been shortlisted for the Managerial round for ${application.jobUniversity.job.title}`;
      }
    }

    if (status === "REJECTED") {
      title = "Application Rejected";

      message = `Your application was rejected${
        existing.currentRound ? ` in ${existing.currentRound}` : ""
      } for ${application.jobUniversity.job.title}`;
    }

    if (status === "SELECTED") {
      title = "Application Selected";

      message = `Congratulations! You have been selected for ${application.jobUniversity.job.title}`;
    }

    if (status === "OFFER_ACCEPTED") {
      title = "Offer Accepted";

      message = `You have accepted the offer for ${application.jobUniversity.job.title}`;
    }

    if (status === "OFFER_REJECTED") {
      title = "Offer Rejected";

      message = `You have rejected the offer for ${application.jobUniversity.job.title}`;
    }

    let notificationType: NotificationType =
      NotificationType.APPLICATION_SELECTED;

    if (status === "SHORTLISTED") {
      notificationType = NotificationType.APPLICATION_SHORTLISTED;
    }

    if (status === "REJECTED") {
      notificationType = NotificationType.APPLICATION_REJECTED;
    }

    if (status === "SELECTED") {
      notificationType = NotificationType.APPLICATION_SELECTED;
    }

    if (status === "OFFER_ACCEPTED") {
      notificationType = NotificationType.OFFER_ACCEPTED;
    }

    if (status === "OFFER_REJECTED") {
      notificationType = NotificationType.OFFER_REJECTED;
    }

    await createNotification({
      userId: application.student.userId,

      title,

      message,

      type: notificationType,
    });

    await sendMail({
      to: application.student.user.email,

      subject: title,

      html: `
        <h2>${title}</h2>

        <p>${message}</p>

        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}

        ${remarks ? `<p><strong>Remarks:</strong> ${remarks}</p>` : ""}
      `,
    });
  } catch (err) {
    console.error("Notification failed", err);
  }

  return application;
};

export const updateScheduleApprovalService = async (
  scheduleId: number,
  companyUserId: number,
  status: "APPROVED" | "REJECTED",
  rejectionReason?: string,
) => {
  if (rejectionReason !== undefined) {
    rejectionReason = normalizeText(rejectionReason);
  }

  const schedule = await getScheduleWithJobsAndApplications(scheduleId);

  if (!schedule) {
    throw new Error("Schedule not found");
  }

  if (schedule.company.userId !== companyUserId) {
    throw new Error("Unauthorized");
  }

  if (schedule.companyApprovalStatus === "APPROVED") {
    throw new Error("Already approved");
  }

  if (status === "REJECTED") {
    if (!rejectionReason?.trim()) {
      throw new Error("Rejection reason required");
    }

    const updated = await updateScheduleApprovalStatus(scheduleId, {
      companyApprovalStatus: "REJECTED",

      rejectedAt: new Date(),

      rejectionReason,
    });

    sendScheduleDiscussionEmail({
      schedule,

      senderRole: "COMPANY",

      senderName: schedule.company.name,

      recipientEmail: schedule.admin.user.email,

      message: `Schedule rejected: ${rejectionReason}`,
    }).catch(console.error);

    return updated;
  }

  if (status === "APPROVED") {
    const applications = schedule.jobUniversities.flatMap(
      (ju) => ju.applications,
    );

    const map = new Map();

    for (const app of applications) {
      const student = app.student;

      const email = student.user.email;

      if (!map.has(email)) {
        map.set(email, {
          email,

          firstname: student.user.firstname,

          userId: student.user.id,
        });
      }
    }

    const students = Array.from(map.values());

    const updated = await updateScheduleApprovalStatus(scheduleId, {
      companyApprovalStatus: "APPROVED",

      approvedAt: new Date(),

      rejectionReason: null,
    });

    runInBackground(async () => {
      try {
        const userIds = students.map((s) => s.userId);

        if (!userIds.length) return;

        emitToUsers(userIds, SOCKET_EVENTS.SCHEDULE_APPROVED, {
          scheduleId,

          title: schedule.title,
        });

        await createManyNotifications(
          userIds.map((userId) => ({
            userId,

            title: "Schedule Approved",

            message: `Interview schedule approved for ${schedule.title}`,

            type: NotificationType.SCHEDULE_APPROVED,
          })),
        );
      } catch (err) {
        console.error("Schedule approval notification failed", err);
      }
    });

    if (students.length) {
      sendInterviewNotificationEmail({
        students,
        schedule,

        companyName: schedule.company.name,
      }).catch(console.error);
    }

    sendScheduleDiscussionEmail({
      schedule,

      senderRole: "COMPANY",

      senderName: "Placement Cell",

      recipientEmail: schedule.admin.user.email,

      message: `Schedule approved by ${schedule.company.name}`,
    }).catch(console.error);

    return updated;
  }

  throw new Error("Invalid status");
};

export const getSchedulesForUserService = async (
  userId: number,
  role: "ADMIN" | "COMPANY",
  companyIdFromQuery?: number,
) => {
  let companyId: number;

  if (role === "COMPANY") {
    const company = await getCompanyByUserId(userId);

    if (!company) {
      throw new Error("Company not found");
    }

    companyId = company.id;
  } else if (role === "ADMIN") {
    if (!companyIdFromQuery) {
      throw new Error("companyId is required for admin");
    }

    companyId = companyIdFromQuery;
  } else {
    throw new Error("Unauthorized role");
  }

  const schedules = await getSchedulesByCompanyIdRepo(companyId);

  return schedules.map((s) => ({
    id: s.id,

    title: s.title,

    startTime: s.startTime,

    endTime: s.endTime,

    venue: s.venue,

    status: s.status,

    companyApprovalStatus: s.companyApprovalStatus,

    approvedAt: s.approvedAt,

    rejectedAt: s.rejectedAt,

    rejectionReason: s.rejectionReason,

    createdAt: s.createdAt,

    companyName: s.company.name,

    jobUniversityCount: s.jobUniversities.length,

    jobUniversities: s.jobUniversities,
  }));
};
