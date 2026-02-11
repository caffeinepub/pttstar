import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';
import { Radio, Server, BookOpen, Settings, Activity, Info, CheckCircle2 } from 'lucide-react';
import ColorPageHeader from '../components/ColorPageHeader';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <ColorPageHeader
        title="PTTStar"
        subtitle="Push-to-Talk for Digital Voice Networks"
        variant="landing"
        icon={<Radio className="h-10 w-10" />}
      />

      <div className="mx-auto max-w-4xl space-y-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Welcome to PTTStar</AlertTitle>
          <AlertDescription>
            PTTStar is a web-based push-to-talk application for amateur radio operators. Connect to IAX/DVSwitch gateways, AllStar nodes, and digital voice networks including DMR, D-Star, YSF, P25, NXDN, and M17.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>What you need to use PTTStar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Valid Amateur Radio License</p>
                  <p className="text-sm text-muted-foreground">
                    You must hold a valid amateur radio license to transmit. PTTStar requires you to acknowledge your license status before enabling transmit functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Internet Identity Account</p>
                  <p className="text-sm text-muted-foreground">
                    Sign in with Internet Identity to access the app. Your profile and preferences are stored securely on the Internet Computer blockchain.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">Connection Details</p>
                  <p className="text-sm text-muted-foreground">
                    For IAX/DVSwitch: Gateway address and optional credentials. For Digital Voice: Choose your mode (DMR, D-Star, etc.) and select a network/reflector.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-status-success mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-foreground">DMR ID (for DMR networks only)</p>
                  <p className="text-sm text-muted-foreground">
                    If using DMR networks, you'll need a registered DMR ID and optional SSID. Register at radioid.net or your regional DMR registry. Configure these in Settings after signing in.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Basic Workflow</CardTitle>
            <CardDescription>How to use PTTStar in four simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">1</span>
                  Sign In
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Log in with Internet Identity and set up your profile with your callsign and license acknowledgement.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">2</span>
                  Configure Connection
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Go to Connection Settings and choose IAX/DVSwitch or Digital Voice. Enter your gateway or select a network/reflector.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">3</span>
                  Browse Directory (Optional)
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Explore available networks and talkgroups in the Directory. Select a network and talkgroup to quickly connect.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm">4</span>
                  Go to PTT
                </div>
                <p className="text-sm text-muted-foreground pl-8">
                  Navigate to the PTT page, join your room, and press the PTT button to transmit. Monitor activity in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Storage</CardTitle>
            <CardDescription>Where your information is stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <Server className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Stored in Your Profile (on-chain)</p>
                <p className="text-sm text-muted-foreground">
                  Your callsign, name, license acknowledgement, DMR ID, SSID, and favorite networks are stored in your user profile on the Internet Computer blockchain.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-foreground">Stored Locally (on this device)</p>
                <p className="text-sm text-muted-foreground">
                  Your connection settings (gateway, credentials, network selections) are stored in your browser's session storage and persist only on this device until you disconnect or clear them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-card p-2 border border-border">
                  <Server className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Connect</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Configure IAX/DVSwitch or Digital Voice connections with your gateway or network details.
              </CardDescription>
              <Button
                onClick={() => navigate({ to: '/connect' })}
                variant="outline"
                size="sm"
                className="mt-4 w-full"
              >
                Go to Connect
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-card p-2 border border-border">
                  <Radio className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">PTT</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Join your room and transmit using the push-to-talk button. Monitor real-time connection status.
              </CardDescription>
              <Button
                onClick={() => navigate({ to: '/ptt' })}
                variant="outline"
                size="sm"
                className="mt-4 w-full"
              >
                Go to PTT
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-card p-2 border border-border">
                  <BookOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Directory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                Browse networks, manage favorites, and save personal directory entries for quick access.
              </CardDescription>
              <Button
                onClick={() => navigate({ to: '/directory' })}
                variant="outline"
                size="sm"
                className="mt-4 w-full"
              >
                Browse Directory
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-card p-2 border border-border">
                  <Activity className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle className="text-base">Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm">
                View recent transmissions and monitor network activity in real-time across all users.
              </CardDescription>
              <Button
                onClick={() => navigate({ to: '/activity' })}
                variant="outline"
                size="sm"
                className="mt-4 w-full"
              >
                View Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
