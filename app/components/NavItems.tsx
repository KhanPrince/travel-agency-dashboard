import { Link, NavLink, useLoaderData, useNavigate } from "react-router";
import { logoutUser } from "~/appwrite/auth";
import { sidebarItems } from "~/constants";
import { cn } from "~/lib/utils";

const NavItems = ({ handleClick }: { handleClick?: () => void }) => {
  // useLoaderData gets the data from the nearest loader function of the nearest route.NavItems itself is not a route but it is used in admin-layout
  const { user } = useLoaderData() as { role: string; user: any };

  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/dashboard");
  };

  return (
    <section className="nav-items">
      <Link to="/dashboard" className="link-logo">
        <img src="/assets/icons/logo.svg" alt="logo" className="size-7.5" />
        <h1>Tourvisto</h1>
      </Link>

      <div className="container">
        <nav>
          {sidebarItems.map(({ id, href, icon, label }) => (
            <NavLink to={href} key={id}>
              {({ isActive }: { isActive: boolean }) => (
                <div
                  onClick={handleClick}
                  className={cn("group nav-item", {
                    "bg-primary-100 text-white!": isActive,
                  })}
                >
                  <img
                    src={icon}
                    alt={label}
                    className={`group-hover:brightness-0 size-5 group-hover:invert ${isActive ? "brightness-0 invert" : "text-dark-200"}`}
                  />
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {user ? (
          <footer className="nav-footer">
            <img
              src={user?.imageUrl || "/assets/images/avatar.png"}
              alt={user?.name || "User"}
              referrerPolicy="no-referrer"
            />

            <article>
              <h2>{user?.name}</h2>
              <p>{user?.email}</p>
            </article>
            <button onClick={handleLogout} className="cursor-pointer">
              <img
                src="/assets/icons/logout.svg"
                alt="logout"
                className="size-6"
              />
            </button>
          </footer>
        ) : (
          <footer className="nav-footer">
            <div className="w-full">
              <Link
                to="/sign-in"
                className="button-class text-white px-4 py-2 rounded-lg"
              >
                Sign in
              </Link>
            </div>
          </footer>
        )}
      </div>
    </section>
  );
};

export default NavItems;
