import { getUniversities } from "../repository/university.repository";

export const getUniversitiesServicePublic = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}) => {
  const page = Math.max(1, params.page ?? 1);

  const limit = Math.min(Math.max(1, params.limit ?? 10), 50);

  return getUniversities(page, limit, params.search, params.status);
};
