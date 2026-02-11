import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetBuiltinNetworks, useSearchNetworks } from '../hooks/useNetworks';
import { useGetFavoriteNetworks, useToggleFavoriteNetwork } from '../hooks/useFavorites';
import { Search, Star, Radio } from 'lucide-react';
import { Mode } from '../backend';
import type { PersistentNetwork } from '../backend';

interface DirectoryBrowserProps {
  onNetworkSelect: (network: PersistentNetwork | null) => void;
  onTalkgroupSelect: (talkgroup: string | null) => void;
  selectedNetwork: PersistentNetwork | null;
  selectedTalkgroup: string | null;
  showFavorites?: boolean;
}

export default function DirectoryBrowser({
  onNetworkSelect,
  onTalkgroupSelect,
  selectedNetwork,
  selectedTalkgroup,
  showFavorites = false,
}: DirectoryBrowserProps) {
  const [selectedMode, setSelectedMode] = useState<Mode | 'all'>('all');
  const [searchText, setSearchText] = useState('');

  const { data: allNetworks = [], isLoading } = useGetBuiltinNetworks();
  const { data: favoriteIds = [] } = useGetFavoriteNetworks();
  const toggleFavorite = useToggleFavoriteNetwork();

  const modes: Array<{ value: Mode | 'all'; label: string }> = [
    { value: 'all', label: 'All Modes' },
    { value: Mode.dmr, label: 'DMR' },
    { value: Mode.dstar, label: 'D-Star' },
    { value: Mode.ysf, label: 'YSF' },
    { value: Mode.p25, label: 'P25' },
    { value: Mode.nxdn, label: 'NXDN' },
  ];

  const filteredNetworks = allNetworks.filter((network) => {
    const modeMatch = selectedMode === 'all' || network.mode === selectedMode;
    const searchMatch =
      !searchText ||
      network.networkLabel.toLowerCase().includes(searchText.toLowerCase()) ||
      network.address.toLowerCase().includes(searchText.toLowerCase());
    return modeMatch && searchMatch;
  });

  const favoriteNetworks = filteredNetworks.filter((n) => favoriteIds.includes(n.networkLabel));

  const handleNetworkClick = (network: PersistentNetwork) => {
    if (selectedNetwork?.networkLabel === network.networkLabel) {
      onNetworkSelect(null);
      onTalkgroupSelect(null);
    } else {
      onNetworkSelect(network);
      onTalkgroupSelect(null);
    }
  };

  const handleTalkgroupClick = (talkgroupId: string) => {
    if (selectedTalkgroup === talkgroupId) {
      onTalkgroupSelect(null);
    } else {
      onTalkgroupSelect(talkgroupId);
    }
  };

  const handleToggleFavorite = (networkLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate(networkLabel);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">Loading networks...</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Network Directory</CardTitle>
          <CardDescription>Browse available digital voice networks and talkgroups.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search networks..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={selectedMode} onValueChange={(v) => setSelectedMode(v as Mode | 'all')}>
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              {modes.map((mode) => (
                <TabsTrigger key={mode.value} value={mode.value} className="text-xs">
                  {mode.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {showFavorites && favoriteNetworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="h-4 w-4 fill-status-warning text-status-warning" />
              Favorites
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {favoriteNetworks.map((network) => (
                <NetworkCard
                  key={network.networkLabel}
                  network={network}
                  isSelected={selectedNetwork?.networkLabel === network.networkLabel}
                  isFavorite={favoriteIds.includes(network.networkLabel)}
                  onClick={() => handleNetworkClick(network)}
                  onToggleFavorite={(e) => handleToggleFavorite(network.networkLabel, e)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {selectedMode === 'all' ? 'All Networks' : `${selectedMode.toUpperCase()} Networks`}
          </CardTitle>
          <CardDescription>
            {filteredNetworks.length} network{filteredNetworks.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNetworks.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No networks found. Try adjusting your filters.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredNetworks.map((network) => (
                <NetworkCard
                  key={network.networkLabel}
                  network={network}
                  isSelected={selectedNetwork?.networkLabel === network.networkLabel}
                  isFavorite={favoriteIds.includes(network.networkLabel)}
                  onClick={() => handleNetworkClick(network)}
                  onToggleFavorite={(e) => handleToggleFavorite(network.networkLabel, e)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedNetwork && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5" />
              Talkgroups
            </CardTitle>
            <CardDescription>Select a talkgroup for {selectedNetwork.networkLabel}</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedNetwork.talkgroups.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No talkgroups available for this network.
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {selectedNetwork.talkgroups.map((tg) => (
                  <button
                    key={tg.id}
                    onClick={() => handleTalkgroupClick(tg.id)}
                    className={`rounded-lg border p-3 text-left transition-colors ${
                      selectedTalkgroup === tg.id
                        ? 'border-status-active bg-status-active/10'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                  >
                    <div className="font-medium text-foreground">{tg.name}</div>
                    <div className="text-xs text-muted-foreground">ID: {tg.id}</div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function NetworkCard({
  network,
  isSelected,
  isFavorite,
  onClick,
  onToggleFavorite,
}: {
  network: PersistentNetwork;
  isSelected: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        isSelected ? 'border-status-active bg-status-active/10' : 'border-border hover:border-muted-foreground'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {network.mode.toUpperCase()}
            </Badge>
            <span className="font-medium text-foreground">{network.networkLabel}</span>
          </div>
          <div className="text-xs text-muted-foreground">{network.address}</div>
          <div className="mt-2 text-xs text-muted-foreground">
            {network.talkgroups.length} talkgroup{network.talkgroups.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={onToggleFavorite}
          className="rounded p-1 hover:bg-accent"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`h-4 w-4 ${isFavorite ? 'fill-status-warning text-status-warning' : 'text-muted-foreground'}`}
          />
        </button>
      </div>
    </button>
  );
}
