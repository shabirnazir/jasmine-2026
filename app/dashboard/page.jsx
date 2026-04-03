import LandingPage from "@/components/LandingPage/LandingPage";
import Topbar from "@/components/Topbar/Topbar";
import UserInfo from "@/components/UserInfo";

export default function Dashboard() {
  return (
    <div>
      <Topbar />
      {/* <UserInfo /> */}
      <LandingPage />
    </div>
  );
}
