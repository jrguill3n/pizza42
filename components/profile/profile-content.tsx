"use client";

import Link from "next/link";
import { User, Mail, Key, LogOut, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderHistoryList } from "@/components/profile/order-history-list";
import { TokenClaimsViewer } from "@/components/profile/token-claims-viewer";
import { SegmentationPreviewCard } from "@/components/profile/segmentation-preview-card";
import { PasskeysRoadmapCallout } from "@/components/profile/passkeys-roadmap-callout";
import type { Auth0User, OrdersContext } from "@/lib/auth0";
import { getLoginUrl, getLogoutUrl, getSignupUrl } from "@/lib/auth0";
import { t } from "@/lib/copy";

interface ProfileContentProps {
  user: Auth0User | null;
  ordersContext: OrdersContext | null;
}

export function ProfileContent({ user, ordersContext }: ProfileContentProps) {
  // Show login prompt if not authenticated
  if (!user) {
    return (
      <main className="container mx-auto px-4 md:px-6 py-6">
        <div className="max-w-md mx-auto glass rounded-2xl p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            {t("profile_login_title")}
          </h1>
          <p className="text-muted-foreground text-sm mb-6">
            {t("profile_login_subtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90 neon-glow-subtle"
            >
              <a href={getLoginUrl("/profile")}>{t("profile_login_cta")}</a>
            </Button>
            <Button
              asChild
              variant="outline"
              className="border-primary/40 text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
            >
              <a href={getSignupUrl("/profile")}>{t("profile_signup_cta")}</a>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // Determine connection display name
  const connectionDisplay = user.sub?.startsWith("google-oauth2")
    ? t("profile_auth_google")
    : user.sub?.startsWith("auth0")
      ? t("profile_auth_email")
      : t("profile_auth_social");

  return (
    <main className="container mx-auto px-4 md:px-6 py-6">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t("profile_title")}
        </h1>
        <p className="text-muted-foreground">{t("profile_subtitle")}</p>
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
                <h2 className="text-lg font-semibold text-foreground">{t("profile_account")}</h2>
                <p className="text-sm text-muted-foreground">
                  {t("profile_account_subtitle")}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Email */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <Mail className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{t("profile_email")}</p>
                  <p className="text-sm text-foreground truncate">{user.email}</p>
                </div>
                {user.email_verified ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    {t("profile_email_verified")}
                  </div>
                ) : (
                  <div className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-medium">
                    {t("profile_email_unverified")}
                  </div>
                )}
              </div>

              {/* Login Method */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <Key className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{t("profile_login_method")}</p>
                  <p className="text-sm text-foreground">{connectionDisplay}</p>
                </div>
              </div>

              {/* Verification Status */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">
                    {t("profile_verification_status")}
                  </p>
                  <p className="text-sm text-foreground">
                    {user.email_verified
                      ? t("profile_email_verified_status")
                      : t("profile_pending_verification")}
                  </p>
                </div>
              </div>
            </div>

            <Button
              asChild
              variant="outline"
              className="w-full border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
            >
              <a href={getLogoutUrl("/")}>
                <LogOut className="w-4 h-4 mr-2" />
                {t("profile_logout")}
              </a>
            </Button>
          </div>

          {/* Token Claims */}
          <div className="glass rounded-2xl p-6">
            <TokenClaimsViewer user={user} ordersContext={ordersContext} />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Order History */}
          <div className="glass rounded-2xl p-6">
            <OrderHistoryList 
              userId={user.email} 
              isAuthenticated={true}
              emailVerified={user.email_verified}
            />
          </div>

          {/* Segmentation Preview */}
          <SegmentationPreviewCard ordersContext={ordersContext} />

          {/* Passkeys Roadmap */}
          <PasskeysRoadmapCallout />
        </div>
      </div>
    </main>
  );
}
