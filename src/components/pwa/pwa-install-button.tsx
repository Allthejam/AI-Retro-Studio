'use client';

import React, { useState } from 'react';
import { usePwa } from './pwa-provider';
import { Button } from '@/components/ui/button';
import { Download, Share2, Smartphone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function PwaInstallButton() {
  const { isInstallable, isInstalled, installApp, isIOS } = usePwa();
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => installApp()}
        className="gap-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Install App</span>
      </Button>
    );
  }

  if (isIOS) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowIosGuide(true)}
          className="gap-2 border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium"
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Install App</span>
        </Button>

        <Dialog open={showIosGuide} onOpenChange={setShowIosGuide}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                Install AI Retro Studio on iOS
              </DialogTitle>
              <DialogDescription>
                Install the application directly on your iPhone or iPad for a full-screen, offline-capable experience:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-3 text-sm">
              <div className="flex items-start gap-3 rounded-lg border border-border p-3 bg-muted/40">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                  1
                </div>
                <div>
                  <p className="font-medium text-foreground">Tap the Share icon</p>
                  <p className="text-muted-foreground text-xs">
                    Located in Safari&#39;s bottom toolbar (square with an arrow pointing up <Share2 className="inline h-3.5 w-3.5 mx-1" />).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border p-3 bg-muted/40">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                  2
                </div>
                <div>
                  <p className="font-medium text-foreground">Select &#34;Add to Home Screen&#34;</p>
                  <p className="text-muted-foreground text-xs">
                    Scroll down the share sheet and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-lg border border-border p-3 bg-muted/40">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-xs">
                  3
                </div>
                <div>
                  <p className="font-medium text-foreground">Launch like a Native App</p>
                  <p className="text-muted-foreground text-xs">
                    Tap <strong>Add</strong> in the top right. AI Retro Studio will now appear on your home screen.
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return null;
}
