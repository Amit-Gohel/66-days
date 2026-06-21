import { redirect } from "next/navigation";

// The night session is now merged into the Today page ("Tonight's review").
export default function NightPage() {
  redirect("/home");
}
