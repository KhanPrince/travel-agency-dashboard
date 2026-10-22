import { redirect } from "react-router";

// "/" is the public landing page: send everyone to the trips list
export const loader = () => redirect("/dashboard");

export default function Home() {
  return null;
}
