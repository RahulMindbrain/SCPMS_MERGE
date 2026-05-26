import prisma from "../config/db";

export const getScheduleWithParticipants = async (scheduleId: number) => {
  return prisma.interviewSchedule.findUnique({
    where: { id: scheduleId },
    include: {
      company: {
        include: { user: true },
      },
      admin: {
        include: { user: true },
      },
    },
  });
};

export const createScheduleMessage = async (data: {
  scheduleId: number;
  senderId: number;
  message: string;
}) => {
  return prisma.scheduleMessage.create({
    data,
  });
};

export const getScheduleMessages = async (scheduleId: number) => {
  return prisma.scheduleMessage.findMany({
    where: {
      scheduleId,
    },
    orderBy: {
      createdAt: "asc",
    },
    include: {
      sender: {
        select: {
          id: true,
          firstname: true,
          lastname: true,
          email: true,
        },
      },
    },
  });
};
