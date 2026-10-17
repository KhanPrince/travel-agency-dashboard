import { Link } from "react-router";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-gray-200 py-6">
      <div className="wrapper flex flex-col items-center justify-between gap-4 text-sm text-gray-500 md:flex-row">
        <p>© {year} Tourvisto. All rights reserved.</p>
        <p>© Designed and Developed by Khan Prince</p>

        <nav className="flex gap-5">
          <Link to="/dashboard" className="hover:text-gray-900">
            Dashboard
          </Link>
          <Link to="/trips" className="hover:text-gray-900">
            Trips
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
