import { sendMail } from "../utils/mails/transporter.mail";

import { getEligibleUnplacedStudentsForJobs } from "../repository/student.repository";

import prisma from "../config/db";

export const sendBulkMailByCompanyService = async ({
  companyId,
  jobUniversityIds,
  subject,
  message,
}: {
  companyId: number;

  jobUniversityIds: number[];

  subject?: string;

  message?: string;
}) => {
  const jobUniversities = await prisma.jobUniversity.findMany({
    where: {
      id: {
        in: jobUniversityIds,
      },

      status: "APPROVED",

      job: {
        companyId,
      },
    },

    include: {
      job: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  if (!jobUniversities.length) {
    throw new Error("No valid job universities selected");
  }

  const validJobUniversityIds = jobUniversities.map((ju) => ju.id);

  const studentGroups = await getEligibleUnplacedStudentsForJobs(
    validJobUniversityIds,
  );

  if (!studentGroups.length) {
    return {
      sent: 0,
    };
  }

  const emails = [
    ...new Set(
      studentGroups.flatMap((group) =>
        group.students.map((student) => student.user.email),
      ),
    ),
  ];

  const jobTitles = jobUniversities.map((ju) => ju.job.title).join(", ");

  const finalSubject = subject || "New Opportunities Available";

  const finalMessage =
    message ||
    `
      <p>New job opportunities are available.</p>

      <p>
        <strong>Roles:</strong>
        ${jobTitles}
      </p>

      <p>
        Please login and apply.
      </p>
    `;

  await sendMail({
    to: emails,

    subject: finalSubject,

    html: finalMessage,
  });

  return {
    sent: emails.length,

    jobs: jobTitles,
  };
};
