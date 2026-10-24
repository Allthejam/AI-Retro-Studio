'use client';
import React from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, limit, doc, deleteDoc } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { Download, Trash2, Edit3, ImagePlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type HistoryPanelProps = {
  onSelectImage?: (imageUrl: string, type: string) => void;
};

export function HistoryPanel({ onSelectImage }: HistoryPanelProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const historyQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'transformations'),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
  }, [firestore, user]);

  const { data: history, isLoading } = useCollection(historyQuery);

  const getBadgeVariant = (tool: string) => {
    switch (tool) {
      case 'dehaze':
        return 'default';
      case 'colorize':
        return 'secondary';
      case 'restore':
        return 'outline';
      case 'upscale':
        return 'default';
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

  const handleDownloadItem = async (imageUrl: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const filename = `${type || 'enhanced'}-${Date.now()}.png`;
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      }
    } catch {
      window.open(imageUrl, '_blank');
    }
  };

  const handleDeleteItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!firestore || !user) return;
    try {
      await deleteDoc(doc(firestore, 'users', user.uid, 'transformations', itemId));
      toast({
        title: 'Deleted',
        description: 'Image removed from history.',
      });
    } catch (err: any) {
      toast({
        title: 'Delete Failed',
        description: err.message || 'Could not delete item.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">Transformation History</CardTitle>
        {history && history.length > 0 && (
          <span className="text-xs text-muted-foreground">{history.length} items</span>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : history && history.length > 0 ? (
          <ScrollArea className="h-80">
            <div className="grid gap-3 pr-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (item.transformedImageUrl && onSelectImage) {
                      onSelectImage(item.transformedImageUrl, item.type || 'processed');
                    }
                  }}
                  className="group relative flex items-center gap-3 rounded-lg border border-border/50 bg-card p-2.5 transition-all hover:border-primary/50 hover:bg-accent/15 cursor-pointer shadow-sm"
                  title="Click to reopen and edit this image"
                >
                  {/* Thumbnail */}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
                    {item.transformedImageUrl ? (
                      <Image
                        src={item.transformedImageUrl}
                        alt={item.type || 'Transformed'}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        unoptimized={Boolean(item.transformedImageUrl?.startsWith('data:'))}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        N/A
                      </div>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <Badge variant={getBadgeVariant(item.type) as any} className="capitalize text-[10px] px-1.5 py-0 h-4 font-semibold">
                        {item.type || 'Enhanced'}
                      </Badge>
                      <p className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {getTimeAgo(item.createdAt)}
                      </p>
                    </div>

                    <p className="mt-1 text-xs font-semibold truncate capitalize">
                      {item.type || 'Processed'} Photo
                    </p>

                    <div className="mt-1 flex items-center gap-1 text-[11px] text-primary group-hover:underline">
                      <Edit3 className="h-3 w-3" />
                      <span>Click to edit more</span>
                    </div>
                  </div>

                  {/* Action buttons on hover */}
                  <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100">
                    {item.transformedImageUrl && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Download this image"
                        onClick={(e) => handleDownloadItem(item.transformedImageUrl, item.type, e)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      title="Delete from history"
                      onClick={(e) => handleDeleteItem(item.id, e)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <ImagePlus className="mx-auto mb-2 h-8 w-8 opacity-40" />
            <p className="text-xs">Your transformed photos will appear here.</p>
            <p className="text-[11px] text-muted-foreground/70 mt-1">You can reopen, edit more, download, or delete them anytime.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
