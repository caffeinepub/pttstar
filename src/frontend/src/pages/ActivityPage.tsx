import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import NowHearingList from '../components/NowHearingList';
import { useGetNowHearing } from '../hooks/useNowHearing';
import { RefreshCw, Activity } from 'lucide-react';
import ColorPageHeader from '../components/ColorPageHeader';
import ColorAccentPanel from '../components/ColorAccentPanel';

export default function ActivityPage() {
  const { data: transmissions = [], isLoading, refetch, isFetching } = useGetNowHearing();

  return (
    <div className="container mx-auto px-4 py-8 pb-24 md:pb-8">
      <div className="mb-8 flex items-center justify-between">
        <ColorPageHeader
          title="Activity"
          subtitle="Recent transmissions across networks (updates automatically)."
          variant="activity"
          icon={<Activity className="h-8 w-8" />}
        />
        <Button onClick={() => refetch()} disabled={isFetching} variant="outline" size="sm" className="ml-4">
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <ColorAccentPanel variant="success">
        <Card className="border-0 bg-transparent">
          <CardHeader>
            <CardTitle>Now Hearing</CardTitle>
            <CardDescription>Live activity feed from in-app voice rooms (auto-updating).</CardDescription>
          </CardHeader>
          <CardContent>
            <NowHearingList transmissions={transmissions} isLoading={isLoading} />
          </CardContent>
        </Card>
      </ColorAccentPanel>
    </div>
  );
}
