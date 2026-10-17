import { Outlet, redirect } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "~/components";
import { account } from "~/appwrite/client";
import { getCurrentRole } from "~/appwrite/auth";
import Footer from "~/components/Footer";

export async function clientLoader() {
  try {
    const { role, user } = await getCurrentRole();

    if (role === "guest") return redirect("/sign-in");
    if (role === "user") return redirect("/travel");
    return user;
  } catch (e) {
    console.log("Error in clientLoader", e);
    return redirect("/sign-in");
  }
}
const AdminLayout = () => {
  return (
    <div className="admin-layout">
      {/* MobileSidebar */}
      <MobileSidebar />

      {/* largeScreen sidebar  */}
      <aside className="w-full max-w-2xs hidden lg:block">
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>

      {/* content */}
      <main className="children ">
        <div className="flex-1">
          <Outlet />
        </div>
        <Footer />
      </main>
    </div>
  );
};

export default AdminLayout;
