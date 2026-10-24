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
      limit(25)
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
        description: 'Photo removed from your history.',
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
    <Card className="shadow-lg border-border">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold">Transformation History</CardTitle>
        {history && history.length > 0 && (
          <Badge variant="outline" className="text-xs font-normal">
            {history.length} {history.length === 1 ? 'photo' : 'photos'}
          </Badge>
        )}
      </CardHeader>
      <CardContent className="p-3 pt-0">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : history && history.length > 0 ? (
          <ScrollArea className="h-[460px] pr-2">
            <div className="flex flex-col gap-3">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-3 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
                >
                  {/* Top: Thumbnail & Details */}
                  <div
                    onClick={() => {
                      if (item.transformedImageUrl && onSelectImage) {
                        onSelectImage(item.transformedImageUrl, item.type || 'processed');
                      }
                    }}
                    className="flex items-center gap-3 cursor-pointer group"
                    title="Click to reopen in editor"
                  >
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted">
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

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <Badge
                          variant={getBadgeVariant(item.type) as any}
                          className="capitalize text-[10px] px-1.5 py-0 h-4 font-semibold"
                        >
                          {item.type || 'Enhanced'}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {getTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <p className="mt-1 text-xs font-semibold truncate capitalize text-foreground">
                        {item.type || 'Processed'} Photo
                      </p>

                      <p className="text-[11px] text-primary group-hover:underline flex items-center gap-1 mt-0.5">
                        <Edit3 className="h-2.5 w-2.5" />
                        <span>Reopen & edit</span>
                      </p>
                    </div>
                  </div>

                  {/* Bottom: Contained Card Actions */}
                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-border/40">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-7 text-xs gap-1.5 px-2 font-medium hover:bg-primary/10 hover:text-primary hover:border-primary/40"
                      onClick={() => {
                        if (item.transformedImageUrl && onSelectImage) {
                          onSelectImage(item.transformedImageUrl, item.type || 'processed');
                        }
                      }}
                      title="Reopen photo in editor"
                    >
                      <Edit3 className="h-3 w-3" />
                      <span>Reopen</span>
                    </Button>

                    {item.transformedImageUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
                        title="Download this photo"
                        onClick={(e) => handleDownloadItem(item.transformedImageUrl, item.type, e)}
                      >
                        <Download className="h-3.5 w-3.5" />
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 w-7 p-0 shrink-0 text-destructive/80 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/40"
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
            <p className="text-[11px] text-muted-foreground/70 mt-1">
              You can reopen, edit more, download, or delete them anytime.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
