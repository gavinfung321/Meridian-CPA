import { DashboardLayout } from "../../components/DashboardLayout";
import { ProfilePageContent } from "../../components/ProfilePageContent";

export function DashboardProfile(): JSX.Element {
  return (
    <DashboardLayout>
      <ProfilePageContent idPrefix="dashboard-profile" />
    </DashboardLayout>
  );
}
