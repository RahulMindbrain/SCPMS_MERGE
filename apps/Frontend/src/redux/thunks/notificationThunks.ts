import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAPI, putAPI, deleteAPI } from "@/apis/api";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const fetchNotifications = createAsyncThunk(
  "notification/fetchAll",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await getAPI<ApiResponse<any>>(`/notification?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch notifications");
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (id: number, { rejectWithValue }) => {
    try {
      const response = await putAPI<ApiResponse<any>>(`/notification/${id}/read`);
      return { id, data: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark notification as read");
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await putAPI<ApiResponse<any>>("/notification/mark-all-read");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to mark all notifications as read");
    }
  }
);

export const deleteNotification = createAsyncThunk(
  "notification/delete",
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteAPI(`/notification/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to delete notification");
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  "notification/unreadCount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<ApiResponse<{ count: number }>>("/notification/unread-count");
      return response.data.count;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch unread count");
    }
  }
);

export const fetchUpcomingEvents = createAsyncThunk(
  "notification/fetchUpcomingEvents",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAPI<ApiResponse<any[]>>("/notification/upcoming-events");
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to fetch upcoming events");
    }
  }
);
