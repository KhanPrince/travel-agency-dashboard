import { Header } from "~/components";
import CreatorCta from "~/components/CreatorCta";
import type { getAccessState } from "~/appwrite/auth";

type Access = Awaited<ReturnType<typeof getAccessState>>;

const AccessGate = ({ title, access }: { title: string; access: Access }) => (
  <main className="wrapper">
    <Header title={title} description="This area is for admins." />
    <CreatorCta
      role={access.role}
      adminRequested={access.adminRequested}
      account={access.account}
    />
  </main>
);
export default AccessGate;
