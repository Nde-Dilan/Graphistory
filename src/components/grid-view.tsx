'use client';
import type { CameroonEvent } from '@/lib/cameroon-history-data';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';

interface GridViewProps {
  events: CameroonEvent[];
  onImageSelect: (index: number) => void;
}

const WindowFrame = ({ children, title }: { children: React.ReactNode, title: string }) => (
  <div className="bg-[#C0C0C0] border-t border-l border-[#FFFFFF] border-r border-b border-[#808080] shadow-lg rounded-sm">
    <div className="h-8 bg-gradient-to-r from-[#000080] to-[#1084d0] flex items-center justify-between px-2 rounded-t-sm">
      <p className="text-white font-code text-sm">{title}</p>
    </div>
    <div className="p-1">
      {children}
    </div>
  </div>
);


export default function GridView({ events, onImageSelect }: GridViewProps) {
  return (
    <ScrollArea className="h-screen w-screen fade-in">
      <div className="p-4 md:p-8 pb-24">
        <div className="w-full">
           <WindowFrame title="C:\\Cameroon\\History_Grid_View.exe">
            <div className="p-2 bg-black h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="group cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 bg-black border-2 border-transparent hover:border-primary"
                    onClick={() => onImageSelect(index)}
                    title={event.title}
                  >
                    <div className="relative aspect-square">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 p-2">
                        <p className="text-primary font-code text-xs truncate">{event.title}</p>
                        <p className="text-secondary font-code text-[10px]">{event.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
           </WindowFrame>
        </div>
      </div>
    </ScrollArea>
  );
}
