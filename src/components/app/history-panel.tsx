'use client';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

export function HistoryPanel() {
  const { user } = useUser();
  const firestore = useFirestore();

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transformations'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );
  }, [firestore, user]);

  const { data: history, isLoading } = useCollection(historyQuery);

  const getBadgeVariant = (tool: string) => {
    switch (tool) {
      case 'colorize':
        return 'default';
      case 'restore':
        return 'secondary';
      case 'upscale':
        return 'outline';
      case 'cartoon':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getTimeAgo = (dateStr?: string) => {
    if (!dateStr) return 'Recently';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? 'Recently' : formatDistanceToNow(d, { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center p-4">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : history && history.length > 0 ? (
          <ScrollArea className="h-72">
            <div className="grid gap-4 pr-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 rounded-lg p-2 transition-colors hover:bg-accent/10"
                >
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {item.transformedImageUrl ? (
                      <Image
                        src={item.transformedImageUrl}
                        alt={item.type || 'Transformed'}
                        fill
                        className="object-cover"
                        unoptimized={Boolean(item.transformedImageUrl?.startsWith('data:'))}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <Badge variant={getBadgeVariant(item.type) as any} className="capitalize">
                        {item.type || 'Image'}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {getTimeAgo(item.createdAt)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-medium truncate capitalize">
                      {item.type || 'Processed'} Image
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-8">
            Your transformation history will appear here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
