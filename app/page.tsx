import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { HomeContent } from "@/components/home/home-content";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Header />
      <HomeContent />
      <BottomNav />
    </div>
  );
}
