import {
  createCompany,
  getCompanyByUserId,
  updateCompany,
} from "../repository/company.repository";
import { normalizeCompanyName, normalizeText } from "../utils/normalize.utils";

export const createCompanyService = async (
  userId: number,
  name: string,
  description?: string,
) => {
  name = normalizeCompanyName(name);
  if (description !== undefined) {
    description = normalizeText(description);
  }
  const existing = await getCompanyByUserId(userId);

  if (existing) {
    throw new Error("Company profile already exists");
  }

  return createCompany(userId, name, description);
};

export const getCompanyProfileService = async (userId: number) => {
  const company = await getCompanyByUserId(userId);

  if (!company) {
    throw new Error("Company profile not found");
  }

  return company;
};

export const updateCompanyService = async (
  userId: number,
  data: {
    name?: string;
    description?: string;
  },
) => {
  if (data.name !== undefined) {
    data.name = normalizeCompanyName(data.name);
  }
  if (data.description !== undefined) {
    data.description = normalizeText(data.description);
  }
  const existing = await getCompanyByUserId(userId);

  if (!existing) {
    throw new Error("Company profile not found");
  }

  return updateCompany(userId, data);
};
