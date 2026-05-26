import { NotificationType } from "@prisma/client";
import prisma from "../config/db";

export const createNotification = async (data: {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
}) => {
  return prisma.notification.create({ data });
};

export const getNotifications = async (userId: number) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
};

export const markAsRead = async (id: number) => {
  return prisma.notification.update({
    where: { id },
    data: { read: true },
  });
};

export const deleteNotification = async (id: number) => {
  return prisma.notification.delete({ where: { id } });
};

export const createManyNotifications = async (
  data: {
    userId: number;
    title: string;
    message: string;
    type: NotificationType;
    entityId?: number;
    entityType?: string;
  }[],
) => {
  return prisma.notification.createMany({
    data,
  });
};

export const getUnreadCount = async (userId: number) => {
  return prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
};

export const markAllAsRead = async (userId: number) => {
  return prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
};

export const getNotificationsPaginated = async (
  userId: number,
  page: number = 1,
  limit: number = 20,
) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });
};

export const getNotificationById = async (id: number) => {
  return prisma.notification.findUnique({
    where: { id },
  });
};
