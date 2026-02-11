import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import IaxDvswitchConnectForm from '../components/IaxDvswitchConnectForm';
import { useNavigate } from '@tanstack/react-router';
import { Server, WifiOff, Info } from 'lucide-react';
import { loadConnection, clearConnection, isIaxDvswitchConnection } from '../hooks/usePreferredConnection';
import { useState, useEffect } from 'react';
import ColorPageHeader from '../components/ColorPageHeader';
import ColorAccentPanel from '../components/ColorAccentPanel';

export default function ConnectPage() {
  const navigate = useNavigate();
  const [hasConnection, setHasConnection] = useState(false);

  useEffect(() => {
    const connection = loadConnection();
    setHasConnection(connection !== null && isIaxDvswitchConnection(connection));
  }, []);

  const handleDisconnect = () => {
    clearConnection();
    setHasConnection(false);
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <ColorPageHeader
        title="IAX / DVSwitch Settings"
        subtitle="Configure your IAX or DVSwitch connection settings."
        variant="connect"
        icon={<Server className="h-8 w-8" />}
      />

      <div className="mx-auto max-w-2xl">
        <ColorAccentPanel variant="info">
          <Tabs defaultValue="connect" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="connect" className="flex items-center gap-2">
                <Server className="h-4 w-4" />
                Connect
              </TabsTrigger>
              <TabsTrigger value="disconnect" className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                Disconnect
              </TabsTrigger>
            </TabsList>

            <TabsContent value="connect">
              <IaxDvswitchConnectForm />
            </TabsContent>

            <TabsContent value="disconnect">
              <Card className="border-0 bg-transparent">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WifiOff className="h-5 w-5" />
                    Disconnect from Network
                  </CardTitle>
                  <CardDescription>Clear your stored connection and return to an unconnected state.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasConnection ? (
                    <>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                          Disconnecting will clear your stored IAX / DVSwitch connection. You will need to reconfigure
                          your connection settings to use PTT again.
                        </AlertDescription>
                      </Alert>
                      <Button onClick={handleDisconnect} variant="destructive" size="lg" className="w-full">
                        <WifiOff className="mr-2 h-4 w-4" />
                        Disconnect
                      </Button>
                    </>
                  ) : (
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        No active IAX / DVSwitch connection found. Use the Connect tab to configure a new connection.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ColorAccentPanel>
      </div>
    </div>
  );
}
