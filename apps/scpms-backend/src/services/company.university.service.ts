import {
  createCompanyUniversityRequest,
  findExistingCompanyUniversityPairs,
  getCompanyRequests,
  getCompanyUniversityRequestsByIds,
  reapplyCompanyUniversityRequests,
} from "../repository/company.university.repository";

import { getCompanyById } from "../repository/company.repository";
import { getActiveUniversitiesByIds } from "../repository/university.repository";

export const requestUniversityService = async (
  companyId: number,
  universityIds: number[],
) => {
  if (!companyId || !Array.isArray(universityIds) || !universityIds.length) {
    throw new Error("Invalid input");
  }

  const company = await getCompanyById(companyId);

  if (!company || !company.user) {
    throw new Error("Company not found");
  }

  if (company.user.status !== "ACTIVE") {
    throw new Error("Company not approved by super admin");
  }

  const uniqueUniversityIds = [...new Set(universityIds)];

  const validUniversities =
    await getActiveUniversitiesByIds(uniqueUniversityIds);

  if (validUniversities.length !== uniqueUniversityIds.length) {
    const validSet = new Set(validUniversities.map((u) => u.id));
    const invalid = uniqueUniversityIds.filter((id) => !validSet.has(id));
    throw new Error(`Invalid or inactive universities: ${invalid.join(", ")}`);
  }

  const existing = await findExistingCompanyUniversityPairs(
    companyId,
    uniqueUniversityIds,
  );

  const existingIds = new Set(existing.map((e) => e.universityId));

  const newIds = uniqueUniversityIds.filter((id) => !existingIds.has(id));

  if (!newIds.length) {
    throw new Error("All universities already applied");
  }

  await createCompanyUniversityRequest(companyId, newIds);

  return getCompanyUniversityRequestsByIds(companyId, newIds);
};
export const getCompanyRequestsService = async (companyId: number) => {
  return getCompanyRequests(companyId);
};
export const reapplyUniversityService = async (
  companyId: number,
  universityIds: number[],
) => {
  if (!companyId || !Array.isArray(universityIds) || !universityIds.length) {
    throw new Error("Invalid input");
  }

  const company = await getCompanyById(companyId);

  if (!company || !company.user) {
    throw new Error("Company not found");
  }

  if (company.user.status !== "ACTIVE") {
    throw new Error("Company not approved by super admin");
  }

  const uniqueUniversityIds = [...new Set(universityIds)];

  const existing = await findExistingCompanyUniversityPairs(
    companyId,
    uniqueUniversityIds,
  );

  const rejectedSet = new Set(
    existing.filter((e) => e.status === "REJECTED").map((e) => e.universityId),
  );

  const invalidIds = uniqueUniversityIds.filter((id) => !rejectedSet.has(id));

  if (invalidIds.length) {
    throw new Error(
      `Cannot reapply for non-rejected universities: ${invalidIds.join(", ")}`,
    );
  }

  const validIds = [...rejectedSet];

  await reapplyCompanyUniversityRequests(companyId, validIds);

  return getCompanyUniversityRequestsByIds(companyId, validIds);
};
