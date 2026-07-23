import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/studio")({
  component: AdminLayout,
  head: () => ({ meta: [{ title: "Admin — South Delhi Farms & Floors" }] }),
});

function AdminLayout() {
  // Children render their own AdminShell or bare layout (login/accept-invite).
  return <Outlet />;
}
