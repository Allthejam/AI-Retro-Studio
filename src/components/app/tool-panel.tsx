import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Palette, Expand, Smile } from 'lucide-react';
import { type Tool } from '@/app/page';

type ToolPanelProps = {
  onToolSelect: (tool: Tool) => void;
  loadingTool: Tool | null;
  hasImage: boolean;
  disabled?: boolean;
};

const tools: {
  id: Tool;
  name: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'restore',
    name: 'Photo Restoration',
    description: 'Fix cracks, scratches, and fading.',
    icon: Wand2,
  },
  {
    id: 'colorize',
    name: 'Colorize Photo',
    description: 'Bring B&W photos to life with color.',
    icon: Palette,
  },
  {
    id: 'upscale',
    name: '4K Upscaling',
    description: 'Enhance resolution to 4K quality.',
    icon: Expand,
  },
  {
    id: 'cartoon',
    name: 'Cartoonize',
    description: 'Turn your photo into a cartoon.',
    icon: Smile,
  },
];

export function ToolPanel({
  onToolSelect,
  loadingTool,
  hasImage,
  disabled,
}: ToolPanelProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>AI Tools</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant="outline"
            className="h-auto justify-start p-4 text-left"
            onClick={() => onToolSelect(tool.id)}
            disabled={!hasImage || !!loadingTool || disabled}
            aria-busy={loadingTool === tool.id}
          >
            <div className="flex w-full items-center gap-4">
              <tool.icon className="h-6 w-6 text-accent" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{tool.name}</p>
                <p className="text-sm text-muted-foreground break-words whitespace-normal">
                  {tool.description}
                </p>
              </div>
              {loadingTool === tool.id && (
                <div className="ml-auto h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
            </div>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
