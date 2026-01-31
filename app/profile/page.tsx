"use client";

import { User, Mail, Key, LogOut, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { OrderHistoryList } from "@/components/profile/order-history-list";
import { TokenClaimsViewer } from "@/components/profile/token-claims-viewer";
import { SegmentationPreviewCard } from "@/components/profile/segmentation-preview-card";
import { PasskeysRoadmapCallout } from "@/components/profile/passkeys-roadmap-callout";
import { useAuth } from "@/components/providers/app-provider";

export default function ProfilePage() {
  const { session, logout, setUserType } = useAuth();
  const user = session.user;

  // Show login prompt if not authenticated
  if (!session.isAuthenticated) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />

        <main className="container mx-auto px-4 md:px-6 py-6">
          <div className="max-w-md mx-auto glass rounded-2xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground mb-2">
              Sign in to view your profile
            </h1>
            <p className="text-muted-foreground text-sm mb-6">
              Access your orders, settings, and more
            </p>
            <Button
              onClick={() => setUserType("verified")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-cyan"
            >
              Log in
            </Button>
          </div>
        </main>

        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <main className="container mx-auto px-4 md:px-6 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Profile
          </h1>
          <p className="text-muted-foreground">Manage your account and settings</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* Account Card */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">Account</h2>
                  <p className="text-sm text-muted-foreground">Your account details</p>
                </div>
              </div>

              <div className="space-y-3">
                {/* Email */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm text-foreground truncate">{user?.email}</p>
                  </div>
                  {user?.email_verified ? (
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </div>
                  ) : (
                    <div className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                      Unverified
                    </div>
                  )}
                </div>

                {/* Login Method */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <Key className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Login method</p>
                    <p className="text-sm text-foreground">{user?.connection}</p>
                  </div>
                </div>

                {/* Verification Status */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                  <Shield className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Verification status</p>
                    <p className="text-sm text-foreground">
                      {user?.email_verified ? "Email verified" : "Pending verification"}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={logout}
                variant="outline"
                className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Log out
              </Button>
            </div>

            {/* Token Claims */}
            <div className="glass rounded-2xl p-6">
              <TokenClaimsViewer />
            </div>

            {/* Demo Controls */}
            <div className="glass rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Demo: Switch User State
              </h3>
              <p className="text-sm text-muted-foreground">
                Test different authentication states
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => setUserType("verified")}
                  variant="outline"
                  size="sm"
                  className="border-green-500/50 text-green-400 hover:bg-green-500/20"
                >
                  Verified User
                </Button>
                <Button
                  onClick={() => setUserType("unverified")}
                  variant="outline"
                  size="sm"
                  className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                >
                  Unverified User
                </Button>
                <Button
                  onClick={() => setUserType("newVerified")}
                  variant="outline"
                  size="sm"
                  className="border-primary/50 text-primary hover:bg-primary/20"
                >
                  New Verified
                </Button>
                <Button
                  onClick={() => setUserType("logged-out")}
                  variant="outline"
                  size="sm"
                  className="border-muted-foreground/50 text-muted-foreground hover:bg-muted"
                >
                  Logged Out
                </Button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Order History */}
            <div className="glass rounded-2xl p-6">
              <OrderHistoryList userId={user?.email} />
            </div>

            {/* Segmentation Preview */}
            <SegmentationPreviewCard />

            {/* Passkeys Roadmap */}
            <PasskeysRoadmapCallout />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
