import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import DirectoryBrowser from '../components/DirectoryBrowser';
import PersonalDirectoryEntries from '../components/PersonalDirectoryEntries';
import { BookOpen, Star, Radio, Info } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { saveConnection } from '../hooks/usePreferredConnection';
import type { PersistentNetwork } from '../backend';

export default function DirectoryPage() {
  const navigate = useNavigate();
  const [selectedNetwork, setSelectedNetwork] = useState<PersistentNetwork | null>(null);
  const [selectedTalkgroup, setSelectedTalkgroup] = useState<string | null>(null);

  const canProceedToPtt = selectedNetwork && selectedTalkgroup;

  const handleGoToPtt = () => {
    if (!selectedNetwork || !selectedTalkgroup) return;

    // Save the directory-based connection
    saveConnection({
      network: selectedNetwork,
      talkgroup: selectedTalkgroup,
    });

    // Navigate to PTT page
    navigate({ to: '/ptt' });
  };

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Directory</h1>
        <p className="text-muted-foreground">Browse available networks, manage your favorites, and save personal directory entries for quick access.</p>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Browse Networks:</strong> Explore built-in digital voice networks and talkgroups. Select a network and talkgroup, then click "Go to PTT" to connect. <strong>Personal Entries:</strong> Add your own custom networks stored locally on this device. <strong>Favorites:</strong> Star networks for quick access.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList>
            <TabsTrigger value="browse">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Networks
            </TabsTrigger>
            <TabsTrigger value="personal">
              <Star className="mr-2 h-4 w-4" />
              Personal Entries
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4">
            {canProceedToPtt && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Ready to connect to <strong>{selectedNetwork.networkLabel}</strong> on TG <strong>{selectedTalkgroup}</strong>
                  </span>
                  <Button onClick={handleGoToPtt} size="sm" className="ml-4">
                    <Radio className="mr-2 h-4 w-4" />
                    Go to PTT
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            <DirectoryBrowser
              onNetworkSelect={setSelectedNetwork}
              onTalkgroupSelect={setSelectedTalkgroup}
              selectedNetwork={selectedNetwork}
              selectedTalkgroup={selectedTalkgroup}
              showFavorites
            />
          </TabsContent>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Directory Entries</CardTitle>
                <CardDescription>
                  Add your own networks and talkgroups. These are stored locally on this device only and are not synced to your profile.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PersonalDirectoryEntries />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
