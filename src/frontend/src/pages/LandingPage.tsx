import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useNavigate } from '@tanstack/react-router';
import { Radio, Server, BookOpen, Settings, Activity, Info, CheckCircle2, ExternalLink } from 'lucide-react';
import ColorPageHeader from '../components/ColorPageHeader';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <ColorPageHeader
        title="PTTStar"
        subtitle="Push-to-Talk for Digital Voice Networks"
        variant="landing"
        icon={<Radio className="h-8 w-8" />}
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <Alert className="console-panel">
          <Info className="h-4 w-4" />
          <AlertTitle>Welcome to PTTStar</AlertTitle>
          <AlertDescription>
            PTTStar is a web-based push-to-talk application for amateur radio operators. Connect to IAX/DVSwitch gateways, AllStar nodes, and digital voice networks including DMR, D-Star, YSF, P25, NXDN, and M17.
          </AlertDescription>
        </Alert>

        <Card className="console-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Getting Started</CardTitle>
            <CardDescription>What you need to use PTTStar</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-active mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Valid Amateur Radio License</p>
                  <p className="text-xs text-muted-foreground">
                    You must hold a valid amateur radio license to transmit. PTTStar requires you to acknowledge your license status before enabling transmit functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-active mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Internet Identity Account</p>
                  <p className="text-xs text-muted-foreground">
                    Sign in with Internet Identity to access the app. Your profile and preferences are stored securely on the Internet Computer blockchain.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-active mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">BrandMeister Account (Recommended for DMR)</p>
                  <p className="text-xs text-muted-foreground">
                    If you plan to use DMR networks, a BrandMeister account is commonly needed. BrandMeister is a popular DMR network used by PTTStar.{' '}
                    <a
                      href="https://brandmeister.network/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-foreground underline hover:text-accent-foreground"
                    >
                      Create your account at brandmeister.network
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-active mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Connection Details</p>
                  <p className="text-xs text-muted-foreground">
                    For IAX/DVSwitch: Gateway address and optional credentials. For Digital Voice: Choose your mode (DMR, D-Star, etc.) and select a network/reflector.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-status-active mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">DMR ID (for DMR networks only)</p>
                  <p className="text-xs text-muted-foreground">
                    If using DMR networks, you'll need a registered DMR ID and optional SSID. Register at radioid.net or your regional DMR registry. Configure these in Settings after signing in.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="console-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Basic Workflow</CardTitle>
            <CardDescription>How to use PTTStar in four simple steps</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">1</span>
                  Sign In
                </div>
                <p className="text-xs text-muted-foreground pl-7">
                  Log in with Internet Identity and set up your profile with your callsign and license acknowledgement.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">2</span>
                  Configure Connection
                </div>
                <p className="text-xs text-muted-foreground pl-7">
                  Go to Connection Settings and choose IAX/DVSwitch or Digital Voice. Enter your gateway or select a network/reflector.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">3</span>
                  Browse Directory (Optional)
                </div>
                <p className="text-xs text-muted-foreground pl-7">
                  Explore available networks and talkgroups in the Directory. Select a network and talkgroup to quickly connect.
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">4</span>
                  Go to PTT
                </div>
                <p className="text-xs text-muted-foreground pl-7">
                  Navigate to the PTT page, join your room, and press the PTT button to transmit. Monitor activity in real-time.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="console-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Data Storage</CardTitle>
            <CardDescription>Where your information is stored</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <div className="flex items-start gap-2.5">
              <Server className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Stored in Your Profile (on-chain)</p>
                <p className="text-xs text-muted-foreground">
                  Your callsign, name, license acknowledgement, DMR ID, SSID, and favorite networks are stored in your user profile on the Internet Computer blockchain.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Settings className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Stored Locally (on this device)</p>
                <p className="text-xs text-muted-foreground">
                  Your connection settings (gateway, credentials, network selections) are stored in your browser's session storage and persist only on this device until you disconnect or clear them.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="console-panel">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded bg-card p-1.5 border border-border">
                  <Server className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-sm">Connect</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs mb-3">
                Configure IAX/DVSwitch or Digital Voice connections with your gateway or network details.
              </CardDescription>
              <Button
                onClick={() => navigate({ to: '/connect' })}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                Go to Connect
              </Button>
            </CardContent>
          </Card>

          <Card className="console-panel">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded bg-card p-1.5 border border-border">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-sm">PTT</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs mb-3">
                Join your room and transmit using the push-to-talk button. Monitor real-time connection status.
              </CardDescription>
              <Button
                onClick={() => navigate({ to: '/ptt' })}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                Go to PTT
              </Button>
            </CardContent>
          </Card>

          <Card className="console-panel">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded bg-card p-1.5 border border-border">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-sm">Directory</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs mb-3">
                Browse available networks and talkgroups. Save favorites for quick access.
              </CardDescription>
              <Button
                onClick={() => navigate({ to: '/directory' })}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                Browse Directory
              </Button>
            </CardContent>
          </Card>

          <Card className="console-panel">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="rounded bg-card p-1.5 border border-border">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-sm">Activity</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-xs mb-3">
                View recent transmissions and activity across all networks in real-time.
              </CardDescription>
              <Button
                onClick={() => navigate({ to: '/activity' })}
                variant="outline"
                size="sm"
                className="w-full text-xs"
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
