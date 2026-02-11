import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, Wifi, Globe, Shield } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ColorPageHeader from '../components/ColorPageHeader';
import ColorAccentPanel from '../components/ColorAccentPanel';

export default function LandingPage() {
  const { identity, login } = useInternetIdentity();
  const isAuthenticated = !!identity;

  return (
    <div className="relative min-h-[calc(100vh-12rem)] overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(/assets/generated/pttstar-bg.dim_1600x900.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <div className="container relative mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-6 flex justify-center">
            <img
              src="/assets/generated/pttstar-app-icon.dim_1024x1024.png"
              alt="PTTStar"
              className="h-24 w-24 rounded-2xl shadow-lg ring-2 ring-border"
            />
          </div>
          <ColorPageHeader
            title="Digital Voice Modes, Anywhere"
            subtitle="Access DMR, D-Star, YSF, P25, NXDN, and more from your phone or computer. No dedicated radio or hotspot required."
            variant="landing"
          />
          <div className="flex flex-wrap justify-center gap-4">
            {isAuthenticated ? (
              <Button asChild size="lg">
                <Link to="/connect">
                  <Wifi className="mr-2 h-5 w-5" />
                  Get Connected
                </Link>
              </Button>
            ) : (
              <Button onClick={login} size="lg">
                <Radio className="mr-2 h-5 w-5" />
                Get Started
              </Button>
            )}
            <Button asChild variant="outline" size="lg">
              <Link to="/about">
                <Shield className="mr-2 h-5 w-5" />
                Learn More
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid gap-6 md:grid-cols-3">
          <ColorAccentPanel variant="primary">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <Radio className="mb-2 h-8 w-8 text-muted-foreground" />
                <CardTitle>Multiple Modes</CardTitle>
                <CardDescription>
                  Connect to DMR, D-Star, YSF, P25, NXDN networks and reflectors from a single app.
                </CardDescription>
              </CardHeader>
            </Card>
          </ColorAccentPanel>

          <ColorAccentPanel variant="info">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <Wifi className="mb-2 h-8 w-8 text-muted-foreground" />
                <CardTitle>Internet Connected</CardTitle>
                <CardDescription>
                  Use your device's data connection. No external hardware, hotspots, or AMBE vocoder needed.
                </CardDescription>
              </CardHeader>
            </Card>
          </ColorAccentPanel>

          <ColorAccentPanel variant="success">
            <Card className="border-0 bg-transparent">
              <CardHeader>
                <Globe className="mb-2 h-8 w-8 text-muted-foreground" />
                <CardTitle>Cross-Platform</CardTitle>
                <CardDescription>
                  Works on phones, tablets, and computers. Access digital voice modes wherever you are.
                </CardDescription>
              </CardHeader>
            </Card>
          </ColorAccentPanel>
        </div>

        {/* Compliance Notice */}
        <ColorAccentPanel variant="warning" className="mt-12">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-status-warning" />
                Licensing & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground">Valid amateur radio license required.</strong> PTTStar is a software
                client for licensed amateur radio operators.
              </p>
              <p>
                <strong className="text-foreground">DMR ID required for DMR networks.</strong> Register at radioid.net
                before using DMR modes.
              </p>
              <p>
                You are responsible for complying with all applicable amateur radio regulations in your jurisdiction.
              </p>
            </CardContent>
          </Card>
        </ColorAccentPanel>
      </div>
    </div>
  );
}
