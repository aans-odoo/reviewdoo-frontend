import { useState, useCallback } from "react";
import api from "@/lib/api";
import { AxiosRequestConfig, AxiosError } from "axios";

interface ApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

interface UseApiReturn<T> extends ApiState<T> {
  execute: (...args: unknown[]) => Promise<T>;
  reset: () => void;
}

export function useApi<T = unknown>(
  method: "get" | "post" | "put" | "delete",
  url: string,
  config?: AxiosRequestConfig
): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: unknown[]): Promise<T> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const body = method === "get" || method === "delete" ? undefined : args[0];
        const response = await api.request<T>({
          method,
          url,
          data: body,
          ...config,
        });
        setState({ data: response.data, error: null, isLoading: false });
        return response.data;
      } catch (err) {
        const axiosError = err as AxiosError<{ error?: { message?: string }; message?: string }>;
        const message =
          axiosError.response?.data?.error?.message ??
          axiosError.response?.data?.message ??
          axiosError.message ??
          "An unexpected error occurred";
        setState({ data: null, error: message, isLoading: false });
        throw err;
      }
    },
    [method, url, config]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return { ...state, execute, reset };
}

export function useApiGet<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return useApi<T>("get", url, config);
}

export function useApiPost<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return useApi<T>("post", url, config);
}

export function useApiPut<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return useApi<T>("put", url, config);
}

export function useApiDelete<T = unknown>(url: string, config?: AxiosRequestConfig) {
  return useApi<T>("delete", url, config);
}
