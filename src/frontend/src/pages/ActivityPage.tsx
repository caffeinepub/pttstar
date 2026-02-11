import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NowHearingList from '../components/NowHearingList';
import { useGetNowHearing } from '../hooks/useNowHearing';
import { RefreshCw } from 'lucide-react';

export default function ActivityPage() {
  const { data: transmissions = [], isLoading, refetch, isFetching } = useGetNowHearing();

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">Activity</h1>
          <p className="text-muted-foreground">Recent transmissions across networks (updates automatically).</p>
        </div>
        <Button onClick={() => refetch()} disabled={isFetching} variant="outline" size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Now Hearing</CardTitle>
          <CardDescription>Live activity feed from in-app voice rooms (auto-updating).</CardDescription>
        </CardHeader>
        <CardContent>
          <NowHearingList transmissions={transmissions} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
}
