import { auth0 } from "@/lib/auth0.server";

export default async function DebugSessionPage() {
  const session = await auth0.getSession();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug: Auth0 Session</h1>
        
        <div className="glass rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-lg mb-2">Session Status</h2>
            <p className="text-muted-foreground">
              {session ? "✅ Session exists" : "❌ No session found"}
            </p>
          </div>

          {session && session.user && (
            <>
              <div>
                <h2 className="font-semibold text-lg mb-2">User Info</h2>
                <div className="space-y-2">
                  <p>
                    <span className="text-muted-foreground">Email:</span>{" "}
                    <span className="font-mono">{session.user.email}</span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Email Verified:</span>{" "}
                    <span className="font-mono">
                      {session.user.email_verified ? "✅ Yes" : "❌ No"}
                    </span>
                  </p>
                  <p>
                    <span className="text-muted-foreground">Sub:</span>{" "}
                    <span className="font-mono text-sm">{session.user.sub}</span>
                  </p>
                </div>
              </div>

              <div>
                <h2 className="font-semibold text-lg mb-2">Full Session Object</h2>
                <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs font-mono">
                  {JSON.stringify(session.user, null, 2)}
                </pre>
              </div>
            </>
          )}

          {!session && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No active session found. Please log in.
              </p>
              <a 
                href="/auth/login?returnTo=/debug/session" 
                className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Log in
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
