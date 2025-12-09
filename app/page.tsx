import { redirect } from "next/navigation";

// redirect to tickets page
export default function Home() {
  redirect("/tickets");
}
