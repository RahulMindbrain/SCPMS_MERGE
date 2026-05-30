import { ApplicationStatus, InterviewRound } from "@prisma/client";

export const allowedStatusTransitions: Record<
  ApplicationStatus,
  ApplicationStatus[]
> = {
  APPLIED: ["SHORTLISTED", "REJECTED"],

  SHORTLISTED: ["SELECTED", "REJECTED"],

  SELECTED: ["OFFER_ACCEPTED", "OFFER_REJECTED"],

  OFFER_ACCEPTED: [],

  OFFER_REJECTED: [],

  REJECTED: [],

  NOT_ELIGIBLE: [],

  WITHDRAWN: [],
};

export const allowedRoundTransitions: Record<InterviewRound, InterviewRound[]> =
  {
    APTITUDE: ["GROUP_DISCUSSION", "HR", "TECHNICAL", "MANAGERIAL"],

    GROUP_DISCUSSION: ["HR", "TECHNICAL", "MANAGERIAL"],

    HR: ["TECHNICAL", "MANAGERIAL"],

    TECHNICAL: ["HR", "MANAGERIAL"],

    MANAGERIAL: [],

    FINAL: [],
  };
