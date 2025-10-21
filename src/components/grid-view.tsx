'use client';
import type { CameroonEvent } from '@/lib/cameroon-history-data';
import Image from 'next/image';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface GridViewProps {
  events: CameroonEvent[];
  onImageSelect: (index: number) => void;
}

export default function GridView({ events, onImageSelect }: GridViewProps) {
  return (
    <ScrollArea className="h-screen w-screen fade-in">
      <div className="p-4 md:p-8 pb-24">
        <h1 className="text-4xl md:text-6xl font-headline mb-8 text-center text-white">History of Cameroon</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {events.map((event, index) => (
            <Card
              key={event.id}
              className="group cursor-pointer overflow-hidden shadow-lg transition-all duration-300 hover:shadow-primary/30 hover:shadow-2xl hover:-translate-y-1 bg-stone-800/50 border-green-900/50"
              style={{'--tw-bg-opacity': '0.5', backgroundColor: 'rgba(111, 78, 55, var(--tw-bg-opacity))'}}
              onClick={() => onImageSelect(index)}
            >
              <div className="relative aspect-video">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              </div>
              <CardHeader>
                <CardTitle className="text-white group-hover:text-primary transition-colors">{event.title}</CardTitle>
                <CardDescription className="text-gray-300">{event.date}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}
