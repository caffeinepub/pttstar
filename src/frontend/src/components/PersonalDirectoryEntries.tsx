import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus, Trash2, Info } from 'lucide-react';
import { NetworkType } from '../backend';

interface PersonalEntry {
  id: string;
  networkType: NetworkType;
  networkLabel: string;
  address: string;
  talkgroups: string;
}

export default function PersonalDirectoryEntries() {
  const [entries, setEntries] = useState<PersonalEntry[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<PersonalEntry>>({
    networkType: NetworkType.dmr,
    networkLabel: '',
    address: '',
    talkgroups: '',
  });

  useEffect(() => {
    const stored = localStorage.getItem('pttstar-personal-entries');
    if (stored) {
      try {
        setEntries(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse personal entries', e);
      }
    }
  }, []);

  const saveEntries = (newEntries: PersonalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('pttstar-personal-entries', JSON.stringify(newEntries));
  };

  const handleAdd = () => {
    if (!newEntry.networkLabel || !newEntry.address) {
      return;
    }

    const entry: PersonalEntry = {
      id: Date.now().toString(),
      networkType: newEntry.networkType || NetworkType.dmr,
      networkLabel: newEntry.networkLabel,
      address: newEntry.address,
      talkgroups: newEntry.talkgroups || '',
    };

    saveEntries([...entries, entry]);
    setNewEntry({ networkType: NetworkType.dmr, networkLabel: '', address: '', talkgroups: '' });
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    saveEntries(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-xs">
          Personal entries are stored locally on this device only and are not synced to the backend.
        </AlertDescription>
      </Alert>

      {entries.length === 0 && !isAdding && (
        <div className="py-12 text-center text-sm text-muted-foreground">
          No personal entries yet. Add your first network below.
        </div>
      )}

      {entries.map((entry) => (
        <Card key={entry.id}>
          <CardContent className="flex items-start justify-between gap-4 p-4">
            <div className="flex-1">
              <div className="mb-1 font-medium text-foreground">{entry.networkLabel}</div>
              <div className="text-xs text-muted-foreground">
                {entry.networkType.toUpperCase()} • {entry.address}
              </div>
              {entry.talkgroups && (
                <div className="mt-1 text-xs text-muted-foreground">Talkgroups: {entry.talkgroups}</div>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </CardContent>
        </Card>
      ))}

      {isAdding ? (
        <Card>
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <select
                id="mode"
                value={newEntry.networkType}
                onChange={(e) => setNewEntry({ ...newEntry, networkType: e.target.value as NetworkType })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={NetworkType.dmr}>DMR</option>
                <option value={NetworkType.dstar}>D-Star</option>
                <option value={NetworkType.ysf}>YSF</option>
                <option value={NetworkType.p25}>P25</option>
                <option value={NetworkType.nxdn}>NXDN</option>
                <option value={NetworkType.others}>Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="networkLabel">Network Name</Label>
              <Input
                id="networkLabel"
                value={newEntry.networkLabel}
                onChange={(e) => setNewEntry({ ...newEntry, networkLabel: e.target.value })}
                placeholder="e.g., My Local Repeater"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={newEntry.address}
                onChange={(e) => setNewEntry({ ...newEntry, address: e.target.value })}
                placeholder="e.g., 192.168.1.100:8080"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="talkgroups">Talkgroups (optional)</Label>
              <Input
                id="talkgroups"
                value={newEntry.talkgroups}
                onChange={(e) => setNewEntry({ ...newEntry, talkgroups: e.target.value })}
                placeholder="e.g., TG1, TG2, TG3"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={!newEntry.networkLabel || !newEntry.address}>
                Add Entry
              </Button>
              <Button variant="outline" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Personal Entry
        </Button>
      )}
    </div>
  );
}
