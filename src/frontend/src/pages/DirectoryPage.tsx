import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Info, Radio } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import DirectoryBrowser from '../components/DirectoryBrowser';
import PersonalDirectoryEntries from '../components/PersonalDirectoryEntries';
import { saveConnection } from '../hooks/usePreferredConnection';
import ColorPageHeader from '../components/ColorPageHeader';
import type { PersistentNetwork } from '../backend';

export default function DirectoryPage() {
  const navigate = useNavigate();
  const [selectedNetwork, setSelectedNetwork] = useState<PersistentNetwork | null>(null);
  const [selectedTalkgroup, setSelectedTalkgroup] = useState<string | null>(null);

  const handleNetworkSelect = (network: PersistentNetwork | null) => {
    setSelectedNetwork(network);
    setSelectedTalkgroup(null);
  };

  const handleTalkgroupSelect = (talkgroup: string | null) => {
    setSelectedTalkgroup(talkgroup);
  };

  const handleGoToPtt = () => {
    if (!selectedNetwork || !selectedTalkgroup) {
      return;
    }

    // Find the talkgroup name from the network's talkgroups list
    const talkgroupObj = selectedNetwork.talkgroups.find(tg => tg.id === selectedTalkgroup);
    const talkgroupName = talkgroupObj?.name || `TG ${selectedTalkgroup}`;

    const connection = {
      type: 'directory-based' as const,
      networkLabel: selectedNetwork.networkLabel,
      networkAddress: selectedNetwork.address,
      talkgroupId: selectedTalkgroup,
      talkgroupName: talkgroupName,
    };

    saveConnection(connection);
    navigate({ to: '/ptt' });
  };

  const canGoToPtt = selectedNetwork && selectedTalkgroup;

  return (
    <div className="container mx-auto px-4 py-6 pb-20 md:pb-6">
      <ColorPageHeader
        title="Network Directory"
        subtitle="Browse networks and talkgroups"
        variant="directory"
        icon={<BookOpen className="h-7 w-7" />}
      />

      <div className="mx-auto max-w-4xl space-y-4">
        <Alert className="console-panel">
          <Info className="h-3.5 w-3.5" />
          <AlertDescription className="text-xs">
            <strong>Browse vs. Personal Entries:</strong> The directory below shows all available networks and talkgroups. 
            You can browse and select any network/talkgroup to proceed to PTT. 
            Use the Personal Directory section to save your favorite entries for quick access.
          </AlertDescription>
        </Alert>

        {canGoToPtt && (
          <Card className="console-panel border-primary/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ready to Transmit</CardTitle>
              <CardDescription className="text-xs">
                {selectedNetwork.networkLabel} - TG {selectedTalkgroup}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleGoToPtt} className="w-full text-xs">
                <Radio className="mr-2 h-3.5 w-3.5" />
                Go to PTT
              </Button>
            </CardContent>
          </Card>
        )}

        <DirectoryBrowser
          onNetworkSelect={handleNetworkSelect}
          onTalkgroupSelect={handleTalkgroupSelect}
          selectedNetwork={selectedNetwork}
          selectedTalkgroup={selectedTalkgroup}
        />

        <PersonalDirectoryEntries />
      </div>
    </div>
  );
}
