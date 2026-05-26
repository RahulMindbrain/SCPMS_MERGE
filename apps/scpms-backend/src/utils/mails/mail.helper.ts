type Participants = {
  adminId: number;
  adminEmail: string;
  adminName: string;

  companyUserId: number;
  companyEmail: string;
  companyName: string;
};

type SenderRole = "ADMIN" | "COMPANY";

type DirectionResult = {
  senderRole: SenderRole;
  senderName: string;
  recipientEmail: string;
};

type ScheduleWithParticipants = {
  admin: {
    userId: number;
    user: {
      email: string;
      firstname: string;
    };
  };

  company: {
    userId: number;
    user: {
      email: string;
    };
    name: string;
  };
};

export const resolveParticipants = (
  schedule: ScheduleWithParticipants,
): Participants => {
  return {
    adminId: schedule.admin.userId,
    adminEmail: schedule.admin.user.email,
    adminName: schedule.admin.user.firstname,

    companyUserId: schedule.company.userId,
    companyEmail: schedule.company.user.email,
    companyName: schedule.company.name,
  };
};

export const resolveDirection = (
  senderId: number,
  participants: Participants,
): DirectionResult => {
  if (senderId === participants.adminId) {
    return {
      senderRole: "ADMIN",
      senderName: participants.adminName,
      recipientEmail: participants.companyEmail,
    };
  }

  if (senderId === participants.companyUserId) {
    return {
      senderRole: "COMPANY",
      senderName: participants.companyName,
      recipientEmail: participants.adminEmail,
    };
  }

  throw new Error("Unauthorized user for this schedule");
};
