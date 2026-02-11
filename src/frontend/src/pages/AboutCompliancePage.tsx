import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, Radio, Globe, AlertTriangle, User } from 'lucide-react';
import ColorPageHeader from '../components/ColorPageHeader';
import ColorAccentPanel from '../components/ColorAccentPanel';

export default function AboutCompliancePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8 text-center">
        <img
          src="/assets/generated/pttstar-logo.dim_512x512.png"
          alt="PTTStar"
          className="mx-auto mb-4 h-16 w-16 ring-2 ring-border rounded-lg"
        />
        <ColorPageHeader
          title="About PTTStar"
          subtitle="Digital voice modes for amateur radio operators."
          variant="about"
        />
      </div>

      <div className="space-y-6">
        <ColorAccentPanel variant="primary">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Creator & Developer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p className="text-base font-semibold text-foreground">
                KO4RXE — Creator & Developer
              </p>
              <p>
                PTTStar is created and developed by KO4RXE, a licensed amateur radio operator dedicated to bringing digital voice modes to the web.
              </p>
            </CardContent>
          </Card>
        </ColorAccentPanel>

        <ColorAccentPanel variant="primary">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5" />
                What is PTTStar?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                PTTStar is a web-based application that allows licensed amateur radio operators to access digital voice
                modes including DMR, D-Star, Yaesu System Fusion (YSF), P25, NXDN, M17, and others directly from a phone or
                computer over the internet.
              </p>
              <p>
                By connecting to digital reflectors and repeaters using your device's data connection, PTTStar eliminates
                the need for dedicated digital radios or hotspot hardware. The app handles digital audio encoding and
                decoding in software, removing the requirement for external AMBE vocoder hardware.
              </p>
              <p>
                PTTStar lets you choose modes, hosts, and talkgroups from within the app, then use push-to-talk with your
                device's microphone. The interface displays call sign and ID information similar to a digital handheld or
                mobile radio.
              </p>
            </CardContent>
          </Card>
        </ColorAccentPanel>

        <ColorAccentPanel variant="warning">
          <Alert variant="destructive" className="border-0 bg-transparent">
            <AlertTriangle className="h-5 w-5 text-status-warning" />
            <AlertTitle className="text-status-warning">Important: Licensing Requirements</AlertTitle>
            <AlertDescription className="space-y-2 text-foreground">
              <p>
                <strong>You must hold a valid amateur radio license to transmit with PTTStar</strong>, just as with any
                other ham radio transmitter. PTTStar is not a toy or a general communication app—it is a tool for licensed
                amateur radio operators.
              </p>
              <p>
                Operating without a license or outside the privileges of your license class is illegal in most
                jurisdictions and may result in significant fines and penalties.
              </p>
            </AlertDescription>
          </Alert>
        </ColorAccentPanel>

        <ColorAccentPanel variant="info">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                DMR ID and SSID
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Many DMR networks require a registered DMR ID linked to your call sign before you can connect and transmit.
              </p>
              <p>
                DMR IDs are typically obtained through services like{' '}
                <a
                  href="https://radioid.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-foreground underline hover:text-accent-foreground"
                >
                  radioid.net
                </a>
                . Registration is free and requires proof of your amateur radio license.
              </p>
              <p>
                Once you have your DMR ID, you can enter it in the Settings page along with an optional SSID (used to identify
                multiple devices under the same DMR ID). These values will be used when configuring connections to DMR networks.
              </p>
            </CardContent>
          </Card>
        </ColorAccentPanel>

        <ColorAccentPanel variant="success">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Regulatory Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                PTTStar is a software client that provides access to amateur radio digital voice networks. As the
                operator, you are responsible for:
              </p>
              <ul className="list-inside list-disc space-y-1">
                <li>Ensuring you hold a valid amateur radio license in your jurisdiction</li>
                <li>Operating within the privileges granted by your license class</li>
                <li>Identifying your station properly according to local regulations</li>
                <li>Following the rules and guidelines of the networks you connect to</li>
                <li>Adhering to all applicable amateur radio regulations and laws</li>
              </ul>
              <p>
                Different countries and regions have different amateur radio regulations. It is your responsibility to
                understand and comply with the rules that apply to you.
              </p>
            </CardContent>
          </Card>
        </ColorAccentPanel>

        <Card>
          <CardHeader>
            <CardTitle>MVP Notice</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              This is a minimum viable product (MVP) version of PTTStar. Current functionality includes profile setup,
              network browsing, and local PTT simulation. Actual transmission to digital voice networks is not yet
              implemented. Activity data shown is simulated for demonstration purposes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
