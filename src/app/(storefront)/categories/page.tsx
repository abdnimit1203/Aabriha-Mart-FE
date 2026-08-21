import { redirect } from "next/navigation";

// A standalone category directory duplicated what the homepage's Featured
// Collections and the /products sidebar already do — categories are a
// filter now, not their own section of the site.
export default function CategoriesIndexRedirect() {
  redirect("/products");
}
