'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  SunMedium,
  Contrast,
  Droplets,
  Eye,
  Sparkles,
  RotateCcw,
  ZoomIn,
  Flame,
  Sun,
  Camera,
  Layers,
  Wand,
} from 'lucide-react';

export interface ImageAdjustments {
  brightness: number; // 50 to 150 (default 100)
  contrast: number;   // 50 to 180 (default 100)
  saturation: number; // 0 to 200 (default 100)
  dehaze: number;     // 0 to 100 (default 0) - cuts through sun haze and fog
  sharpen: number;    // 0 to 100 (default 0) - enhances micro-details and face edges
  hue: number;        // -180 to 180 (default 0)
  warmth: number;     // -50 to 50 (default 0)
  zoom: number;       // 1 to 3 (default 1)
  panX: number;       // -50 to 50 (default 0)
  panY: number;       // -50 to 50 (default 0)
}

export const DEFAULT_ADJUSTMENTS: ImageAdjustments = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  dehaze: 0,
  sharpen: 0,
  hue: 0,
  warmth: 0,
  zoom: 1,
  panX: 0,
  panY: 0,
};

interface AdjustmentsPanelProps {
  adjustments: ImageAdjustments;
  onChange: (adjustments: ImageAdjustments) => void;
  disabled?: boolean;
}

export function AdjustmentsPanel({
  adjustments,
  onChange,
  disabled,
}: AdjustmentsPanelProps) {
  const update = (key: keyof ImageAdjustments, value: number) => {
    onChange({ ...adjustments, [key]: value });
  };

  const applyPreset = (preset: Partial<ImageAdjustments>) => {
    onChange({ ...DEFAULT_ADJUSTMENTS, ...preset });
  };

  const isModified =
    adjustments.brightness !== 100 ||
    adjustments.contrast !== 100 ||
    adjustments.saturation !== 100 ||
    adjustments.dehaze !== 0 ||
    adjustments.sharpen !== 0 ||
    adjustments.hue !== 0 ||
    adjustments.warmth !== 0 ||
    adjustments.zoom !== 1 ||
    adjustments.panX !== 0 ||
    adjustments.panY !== 0;

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Studio Tuning
        </CardTitle>
        {isModified && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChange(DEFAULT_ADJUSTMENTS)}
            disabled={disabled}
            className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Reset
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-4 text-sm">
        {/* Quick 1-Click Presets */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Quick Backlight & Haze Presets
          </Label>
          <div className="grid grid-cols-2 gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                applyPreset({
                  dehaze: 60,
                  contrast: 130,
                  brightness: 110,
                  saturation: 115,
                  sharpen: 45,
                })
              }
              disabled={disabled}
              className="text-xs justify-start h-8 px-2"
            >
              <Sun className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              Sunset Dehaze
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                applyPreset({
                  sharpen: 65,
                  contrast: 125,
                  brightness: 105,
                  dehaze: 40,
                })
              }
              disabled={disabled}
              className="text-xs justify-start h-8 px-2"
            >
              <Eye className="mr-1.5 h-3.5 w-3.5 text-sky-500" />
              Face Clarifier
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                applyPreset({
                  contrast: 135,
                  saturation: 125,
                  dehaze: 30,
                  sharpen: 40,
                })
              }
              disabled={disabled}
              className="text-xs justify-start h-8 px-2"
            >
              <Layers className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
              Crisp HDR
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                applyPreset({
                  warmth: 20,
                  saturation: 120,
                  brightness: 105,
                  contrast: 110,
                })
              }
              disabled={disabled}
              className="text-xs justify-start h-8 px-2"
            >
              <Flame className="mr-1.5 h-3.5 w-3.5 text-orange-500" />
              Golden Hour
            </Button>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-3 pt-1">
          {/* Dehaze & Backlight Recovery */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Sun className="h-3.5 w-3.5 text-amber-500" />
                Dehaze & Glare Cut
              </span>
              <span className="text-muted-foreground">{adjustments.dehaze}%</span>
            </div>
            <Slider
              value={[adjustments.dehaze]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) => update('dehaze', val)}
              disabled={disabled}
            />
          </div>

          {/* Sharpen / Clarity */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Eye className="h-3.5 w-3.5 text-sky-500" />
                Face & Detail Sharpen
              </span>
              <span className="text-muted-foreground">{adjustments.sharpen}%</span>
            </div>
            <Slider
              value={[adjustments.sharpen]}
              min={0}
              max={100}
              step={1}
              onValueChange={([val]) => update('sharpen', val)}
              disabled={disabled}
            />
          </div>

          {/* Brightness */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <SunMedium className="h-3.5 w-3.5 text-yellow-500" />
                Brightness (Shadow Lift)
              </span>
              <span className="text-muted-foreground">{adjustments.brightness}%</span>
            </div>
            <Slider
              value={[adjustments.brightness]}
              min={50}
              max={160}
              step={1}
              onValueChange={([val]) => update('brightness', val)}
              disabled={disabled}
            />
          </div>

          {/* Contrast */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Contrast className="h-3.5 w-3.5 text-indigo-500" />
                Contrast
              </span>
              <span className="text-muted-foreground">{adjustments.contrast}%</span>
            </div>
            <Slider
              value={[adjustments.contrast]}
              min={60}
              max={160}
              step={1}
              onValueChange={([val]) => update('contrast', val)}
              disabled={disabled}
            />
          </div>

          {/* Saturation */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5 text-rose-500" />
                Saturation
              </span>
              <span className="text-muted-foreground">{adjustments.saturation}%</span>
            </div>
            <Slider
              value={[adjustments.saturation]}
              min={0}
              max={200}
              step={1}
              onValueChange={([val]) => update('saturation', val)}
              disabled={disabled}
            />
          </div>

          {/* Hue Tint */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-purple-500" />
                Hue Color Shift
              </span>
              <span className="text-muted-foreground">{adjustments.hue}°</span>
            </div>
            <Slider
              value={[adjustments.hue]}
              min={-180}
              max={180}
              step={2}
              onValueChange={([val]) => update('hue', val)}
              disabled={disabled}
            />
          </div>

          {/* Zoom In / Out */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium flex items-center gap-1.5">
                <ZoomIn className="h-3.5 w-3.5 text-teal-500" />
                Zoom (Crop In on Crowd)
              </span>
              <span className="text-muted-foreground">{adjustments.zoom.toFixed(1)}x</span>
            </div>
            <Slider
              value={[adjustments.zoom]}
              min={1}
              max={3}
              step={0.1}
              onValueChange={([val]) => update('zoom', val)}
              disabled={disabled}
            />
          </div>

          {/* Pan X and Y when zoomed in */}
          {adjustments.zoom > 1 && (
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Pan Left/Right</span>
                  <span className="text-muted-foreground">{adjustments.panX}%</span>
                </div>
                <Slider
                  value={[adjustments.panX]}
                  min={-40}
                  max={40}
                  step={1}
                  onValueChange={([val]) => update('panX', val)}
                  disabled={disabled}
                />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Pan Up/Down</span>
                  <span className="text-muted-foreground">{adjustments.panY}%</span>
                </div>
                <Slider
                  value={[adjustments.panY]}
                  min={-40}
                  max={40}
                  step={1}
                  onValueChange={([val]) => update('panY', val)}
                  disabled={disabled}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
