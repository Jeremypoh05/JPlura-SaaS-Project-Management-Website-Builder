import { db } from "@/lib/db";
import AgencyDashboard from "./agency-dashboard";

const Page = async ({ params }: { params: { agencyId: string } }) => {
  // Fetch agency with related data
  const agencyDetails = await db.agency.findUnique({
    where: { id: params.agencyId },
    include: {
      SubAccount: {
        include: {
          Pipeline: {
            include: {
              Lane: {
                include: {
                  Tickets: true,
                },
              },
            },
          },
          Funnels: {
            include: {
              FunnelPages: true,
            },
          },
        },
      },
    },
  });

  if (!agencyDetails) return null;

  return <AgencyDashboard agencyDetails={agencyDetails as any} />;
};

export default Page;
