'use client';
import { LayoutGrid, Globe, Text } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Mode = 'grid' | 'sphere' | 'name';

interface BottomNavProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const navItems = [
  { mode: 'grid', icon: LayoutGrid, label: 'Grid' },
  { mode: 'sphere', icon: Globe, label: 'Sphere' },
  { mode: 'name', icon: Text, label: 'Name' },
];

export default function BottomNav({ activeMode, onModeChange }: BottomNavProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-2 rounded-full bg-card/80 p-2 border border-border backdrop-blur-sm shadow-lg">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.mode}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full h-12 w-12 transition-colors ${
                    activeMode === item.mode
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                  onClick={() => onModeChange(item.mode as Mode)}
                >
                  <item.icon className="h-6 w-6" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
