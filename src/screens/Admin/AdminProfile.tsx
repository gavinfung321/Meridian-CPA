import { AdminLayout } from "../../components/AdminLayout";
import { ProfilePageContent } from "../../components/ProfilePageContent";

export function AdminProfile(): JSX.Element {
  return (
    <AdminLayout>
      <ProfilePageContent idPrefix="admin-profile" />
    </AdminLayout>
  );
}
