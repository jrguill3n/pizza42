import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { ProfileContent } from "@/components/profile/profile-content";
import { getSessionUserServer, getOrdersContext } from "@/lib/auth0";

export default async function ProfilePage() {
  const user = await getSessionUserServer();
  const ordersContext = getOrdersContext(user);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />
      <ProfileContent user={user} ordersContext={ordersContext} />
      <BottomNav />
    </div>
  );
}
