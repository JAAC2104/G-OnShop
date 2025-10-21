import { Outlet } from "react-router";
import ScrollToTop from "../components/ScrollToTop";

export default function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}