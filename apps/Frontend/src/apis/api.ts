import axios, { type AxiosRequestConfig, type AxiosError } from "axios"

// ─── Base Configuration ───────────────────────────────────────────────────────
const BASE_URL = "http://localhost:3030";
// const BASE_URL = "https://scpms.onrender.com"
// const BASE_URL = "https://scpms-production.up.railway.app"


const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send httpOnly auth cookie on every request
})

// ─── Variables for Token Refresh Logic ────────────────────────────────────────
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// ─── Request Interceptor – attach Authorization token (from defaults) ────────
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
)

// Restore token from localStorage on page reload
const _persistedToken = localStorage.getItem("scpms_token")
if (_persistedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${_persistedToken}`
}

// ─── Response Interceptor – handle 401 Unauthorized for Token Refresh ────────
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error?.config as (AxiosRequestConfig & {
      _retry?: boolean
    }) | undefined;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isAuthLoginRequest =
      originalRequest.url === "/auth/login" ||
      originalRequest.url?.endsWith("/auth/login");

    // If the error is 401 and it's not a retry and not an auth endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refresh" &&
      !isAuthLoginRequest
    ) {
      // If we are already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return api(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Call the refresh endpoint
        // The backend handles cookies automatically due to withCredentials: true
        await api.post("/auth/refresh")

        isRefreshing = false
        processQueue(null)

        // Retry the original request
        return api(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        processQueue(refreshError)

        // If refresh fails, clear auth state
        setAuthToken(null)
        localStorage.removeItem("scpms_user")

        // Optional: redirect to login
        // window.location.href = "/signin";

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// ─── Auth Token Helper ───────────────────────────────────────────────────────
/** Call after login to inject token; call with null on logout to clear it. */
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    localStorage.setItem("scpms_token", token)
  } else {
    delete api.defaults.headers.common["Authorization"]
    localStorage.removeItem("scpms_token")
  }
}

// ─── HTTP Helper Functions ────────────────────────────────────────────────────

export const getAPI = async <T>(
  endpoint: string,
  params: any = {},
  data: any = {}, // 👈 add body support
  headers: AxiosRequestConfig["headers"] = {},
  responseType: AxiosRequestConfig["responseType"] = "json"
): Promise<T> => {
  try {
    const response = await api.get<T>(endpoint, {
      params,
      data, // 👈 important (GET body)
      headers,
      responseType,
    })
    return response.data
  } catch (error: any) {
    throw error?.response?.data ?? error
  }
}

export const postAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {},
  responseType: AxiosRequestConfig["responseType"] = "json"
): Promise<T> => {
  try {
    const response = await api.post<T>(endpoint, data, {
      params,
      headers,
      responseType,
    })
    return response.data
  } catch (error: any) {
    throw error?.response?.data ?? error
  }
}

export const putAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {}
): Promise<T> => {
  try {
    const response = await api.put<T>(endpoint, data, { params, headers })
    return response.data
  } catch (error: any) {
    throw error?.response?.data ?? error
  }
}

export const patchAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {}
): Promise<T> => {
  try {
    const response = await api.patch<T>(endpoint, data, { params, headers })
    return response.data
  } catch (error: any) {
    throw error?.response?.data ?? error
  }
}

export const deleteAPI = async <T>(
  endpoint: string,
  data: any = {},
  params: any = {},
  headers: AxiosRequestConfig["headers"] = {}
): Promise<T> => {
  try {
    const response = await api.delete<T>(endpoint, { data, params, headers })
    return response.data
  } catch (error: any) {
    throw error?.response?.data ?? error
  }
}

export default api
