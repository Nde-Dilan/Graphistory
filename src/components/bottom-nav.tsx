'use client';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

type Mode = 'grid' | 'sphere' | 'name';

interface BottomNavProps {
  activeMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
    <path d="M4 4H8V8H4V4Z" fill="currentColor"/>
    <path d="M10 4H14V8H10V4Z" fill="currentColor"/>
    <path d="M16 4H20V8H16V4Z" fill="currentColor"/>
    <path d="M4 10H8V14H4V10Z" fill="currentColor"/>
    <path d="M10 10H14V14H10V10Z" fill="currentColor"/>
    <path d="M16 10H20V14H16V10Z" fill="currentColor"/>
    <path d="M4 16H8V20H4V16Z" fill="currentColor"/>
    <path d="M10 16H14V20H10V16Z" fill="currentColor"/>
    <path d="M16 16H20V20H16V16Z" fill="currentColor"/>
  </svg>
);

const SphereIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4Z" fill="currentColor"/>
    <path d="M6 12C6 8.686 8.686 6 12 6" stroke="currentColor" strokeWidth="2"/>
    <path d="M18 12C18 15.314 15.314 18 12 18" stroke="currentColor" strokeWidth="2"/>
  </svg>
);

const NameIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 w-6">
        <path d="M7 17V7H9V11H13V7H15V17H13V13H9V17H7Z" fill="currentColor" />
    </svg>
);


const navItems = [
  { mode: 'grid', icon: GridIcon, label: 'Grid' },
  { mode: 'sphere', icon: SphereIcon, label: 'Sphere' },
  { mode: 'name', icon: NameIcon, label: 'CAMEROON OS' },
];

export default function BottomNav({ activeMode, onModeChange }: BottomNavProps) {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
      <div className="flex items-center gap-1 rounded-sm bg-[#C0C0C0] p-1 border-t border-l border-[#FFFFFF] border-r border-b border-[#808080] shadow-md">
        <TooltipProvider>
          {navItems.map((item) => (
            <Tooltip key={item.mode}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-sm h-12 w-12 transition-colors font-code ${
                    activeMode === item.mode
                      ? 'bg-primary text-primary-foreground border-t border-l border-[#808080] border-r border-b border-[#FFFFFF] shadow-inner'
                      : 'text-foreground hover:bg-muted/50 hover:text-foreground'
                  }`}
                  onClick={() => onModeChange(item.mode as Mode)}
                >
                  <item.icon />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-background text-foreground border border-border font-code">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}
