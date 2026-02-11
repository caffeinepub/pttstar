import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useGetBuiltinNetworks } from '../hooks/useNetworks';
import { useGetFavoriteNetworks, useToggleFavoriteNetwork } from '../hooks/useFavorites';
import { Search, Star, Radio, Info } from 'lucide-react';
import { NetworkType } from '../backend';
import type { PersistentNetwork } from '../backend';

interface DirectoryBrowserProps {
  onNetworkSelect: (network: PersistentNetwork | null) => void;
  onTalkgroupSelect: (talkgroup: string | null) => void;
  selectedNetwork: PersistentNetwork | null;
  selectedTalkgroup: string | null;
  showFavorites?: boolean;
}

// Human-readable labels for NetworkType values
const networkTypeLabels: Record<NetworkType, string> = {
  [NetworkType.dmr]: 'DMR',
  [NetworkType.dstar]: 'D-Star',
  [NetworkType.ysf]: 'YSF',
  [NetworkType.p25]: 'P25',
  [NetworkType.nxdn]: 'NXDN',
  [NetworkType.analog]: 'Analog',
  [NetworkType.others]: 'Others',
};

export default function DirectoryBrowser({
  onNetworkSelect,
  onTalkgroupSelect,
  selectedNetwork,
  selectedTalkgroup,
  showFavorites = false,
}: DirectoryBrowserProps) {
  const [selectedMode, setSelectedMode] = useState<NetworkType | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const [customTalkgroup, setCustomTalkgroup] = useState('');

  const { data: allNetworks = [], isLoading } = useGetBuiltinNetworks();
  const { data: favoriteIds = [] } = useGetFavoriteNetworks();
  const toggleFavorite = useToggleFavoriteNetwork();

  // Dynamically derive available modes from the dataset
  const modes = useMemo(() => {
    const uniqueTypes = new Set<NetworkType>();
    allNetworks.forEach((network) => {
      uniqueTypes.add(network.networkType);
    });

    const modeList: Array<{ value: NetworkType | 'all'; label: string }> = [
      { value: 'all', label: 'All Modes' },
    ];

    // Add modes in a consistent order, only if they exist in the dataset
    const orderedTypes: NetworkType[] = [
      NetworkType.dmr,
      NetworkType.dstar,
      NetworkType.ysf,
      NetworkType.p25,
      NetworkType.nxdn,
      NetworkType.analog,
      NetworkType.others,
    ];

    orderedTypes.forEach((type) => {
      if (uniqueTypes.has(type)) {
        modeList.push({
          value: type,
          label: networkTypeLabels[type] || type.toUpperCase(),
        });
      }
    });

    return modeList;
  }, [allNetworks]);

  const filteredNetworks = allNetworks.filter((network) => {
    const modeMatch = selectedMode === 'all' || network.networkType === selectedMode;
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
      setCustomTalkgroup('');
    } else {
      onNetworkSelect(network);
      onTalkgroupSelect(null);
      setCustomTalkgroup('');
    }
  };

  const handleTalkgroupClick = (talkgroupId: string) => {
    if (selectedTalkgroup === talkgroupId) {
      onTalkgroupSelect(null);
    } else {
      onTalkgroupSelect(talkgroupId);
      setCustomTalkgroup('');
    }
  };

  const handleCustomTalkgroupSelect = () => {
    if (customTalkgroup.trim()) {
      onTalkgroupSelect(customTalkgroup.trim());
    }
  };

  const handleToggleFavorite = (networkLabel: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite.mutate(networkLabel);
  };

  // Check if network is BrandMeister (any variant)
  const isBrandMeister = selectedNetwork?.networkLabel.toLowerCase().includes('brandmeister') || false;
  const canEnterCustomTG = selectedNetwork && (isBrandMeister || selectedNetwork.talkgroups.length === 0);

  // Get human-readable label for selected mode
  const selectedModeLabel = selectedMode === 'all' 
    ? 'All Networks' 
    : `${networkTypeLabels[selectedMode as NetworkType] || selectedMode.toUpperCase()} Networks`;

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
          <CardDescription>Browse available digital voice networks and talkgroups. Use the search and mode filters to find specific networks.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search networks by name or address..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={selectedMode} onValueChange={(v) => setSelectedMode(v as NetworkType | 'all')}>
            <TabsList className={`grid w-full ${modes.length <= 3 ? 'grid-cols-3' : modes.length <= 6 ? 'grid-cols-3 lg:grid-cols-6' : 'grid-cols-3 lg:grid-cols-4'}`}>
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
            <CardDescription>Your starred networks for quick access</CardDescription>
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
          <CardTitle className="text-lg">{selectedModeLabel}</CardTitle>
          <CardDescription>
            {filteredNetworks.length} network{filteredNetworks.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNetworks.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No networks found matching your search and filter criteria</p>
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
            <CardTitle className="text-lg">Talkgroups</CardTitle>
            <CardDescription>Select a talkgroup for {selectedNetwork.networkLabel}. Talkgroups are conversation groups on the network.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedNetwork.talkgroups.length > 0 && (
              <div className="space-y-2">
                {selectedNetwork.talkgroups.map((tg) => (
                  <button
                    key={tg.id}
                    onClick={() => handleTalkgroupClick(tg.id)}
                    className={`w-full rounded-lg border p-3 text-left transition-colors ${
                      selectedTalkgroup === tg.id
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-accent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{tg.name}</p>
                        <p className="text-xs text-muted-foreground">TG {tg.id}</p>
                      </div>
                      {selectedTalkgroup === tg.id && (
                        <Badge variant="default">
                          <Radio className="mr-1 h-3 w-3" />
                          Selected
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {canEnterCustomTG && (
              <div className="space-y-2 rounded-lg border border-border bg-card/30 p-4">
                <Label htmlFor="custom-tg">Enter Custom Talkgroup</Label>
                <p className="text-xs text-muted-foreground mb-2">
                  {isBrandMeister 
                    ? 'BrandMeister allows custom talkgroup entry. Enter any valid talkgroup number.'
                    : 'This network has no predefined talkgroups. Enter a talkgroup number if you know one.'}
                </p>
                <div className="flex gap-2">
                  <Input
                    id="custom-tg"
                    value={customTalkgroup}
                    onChange={(e) => setCustomTalkgroup(e.target.value)}
                    placeholder="Enter TG number (e.g., 3100)"
                    type="text"
                  />
                  <Button onClick={handleCustomTalkgroupSelect} disabled={!customTalkgroup.trim()}>
                    Select
                  </Button>
                </div>
                {customTalkgroup && selectedTalkgroup === customTalkgroup && (
                  <p className="text-xs text-muted-foreground">
                    Custom TG {customTalkgroup} selected
                  </p>
                )}
              </div>
            )}

            {!canEnterCustomTG && selectedNetwork.talkgroups.length === 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No talkgroups available for this network. Check the network documentation for talkgroup information.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface NetworkCardProps {
  network: PersistentNetwork;
  isSelected: boolean;
  isFavorite: boolean;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

function NetworkCard({ network, isSelected, isFavorite, onClick, onToggleFavorite }: NetworkCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border p-4 text-left transition-colors ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border hover:border-primary/50 hover:bg-accent'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{network.networkLabel}</h3>
            <Badge variant="outline" className="text-xs">
              {network.networkType.toUpperCase()}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{network.address}</p>
          {network.talkgroups.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {network.talkgroups.length} talkgroup{network.talkgroups.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={onToggleFavorite}
          className="ml-2 rounded p-1 hover:bg-accent"
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star
            className={`h-5 w-5 ${
              isFavorite ? 'fill-status-warning text-status-warning' : 'text-muted-foreground'
            }`}
          />
        </button>
      </div>
    </button>
  );
}
