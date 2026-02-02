import { Outlet, redirect } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "~/components";
import { account } from "~/appwrite/client";
import { getExistingUser, storeUserdata } from "~/appwrite/auth";

export async function clientLoader() {
  try {
    const user = await account.get();

    if (!user.$id) {
      console.log(user.$id);
      return redirect("/sign-in");
    }

    const existingUser = await getExistingUser(user.$id);
    // user should not access dashboard
    if (existingUser?.status === "user") {
      return redirect("/");
    }
    return existingUser?.$id ? existingUser : await storeUserdata();
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
      <aside className="children ">
        <Outlet />
      </aside>
    </div>
  );
};

export default AdminLayout;
