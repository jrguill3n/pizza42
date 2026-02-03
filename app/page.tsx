import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { HomeContent } from "@/components/home/home-content";
import { getSessionUserServer, getOrdersContext, ORDERS_CONTEXT_CLAIM } from "@/lib/auth0.server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getSessionUserServer();
  const ordersContext = getOrdersContext(user);

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header />
      <HomeContent user={user} ordersContext={ordersContext} />
      <BottomNav />
    </div>
  );
}
