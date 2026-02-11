import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DirectoryBrowser from '../components/DirectoryBrowser';
import PersonalDirectoryEntries from '../components/PersonalDirectoryEntries';
import { BookOpen, Star } from 'lucide-react';
import type { PersistentNetwork } from '../backend';

export default function DirectoryPage() {
  const [selectedNetwork, setSelectedNetwork] = useState<PersistentNetwork | null>(null);
  const [selectedTalkgroup, setSelectedTalkgroup] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-foreground">Directory</h1>
        <p className="text-muted-foreground">Browse networks, manage favorites, and save personal entries.</p>
      </div>

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

        <TabsContent value="browse">
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
                Add your own networks and talkgroups. These are stored locally on this device only.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PersonalDirectoryEntries />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
