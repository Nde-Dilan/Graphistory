"use client";
import type { CameroonEvent } from "@/lib/cameroon-history-data";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./ui/accordion";

interface GridViewProps {
  events: CameroonEvent[];
  onImageSelect: (index: number) => void;
}

const WindowFrame = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) => (
  <div className="bg-[#C0C0C0] border border-[#808080] shadow-lg rounded-sm">
    <div className="h-8 bg-gradient-to-r from-[#000080] to-[#1084d0] flex items-center justify-between px-2 rounded-t-sm">
      <p className="text-white font-code text-sm">{title}</p>
    </div>
    <div className="p-1">{children}</div>
  </div>
);

function extractYear(dateStr: string) {
  // try to find BC notation first
  const bcMatch = dateStr.match(/(c\.\s*\d+\s*BC)/i);
  if (bcMatch) return bcMatch[1];
  const yMatch = dateStr.match(/(\d{4})/);
  if (yMatch) return yMatch[1];
  // fallback to full date string
  return dateStr;
}

export default function GridView({ events, onImageSelect }: GridViewProps) {
  const grouped = events.reduce(
    (acc: Record<string, CameroonEvent[]>, ev, idx) => {
      const year = extractYear(ev.date);
      if (!acc[year]) acc[year] = [];
      acc[year].push(ev);
      return acc;
    },
    {}
  );

  const years = Object.keys(grouped).sort((a, b) => {
    // sort numerically if possible, else alphabetical
    const an = parseInt(a.replace(/[^0-9]/g, ""), 10);
    const bn = parseInt(b.replace(/[^0-9]/g, ""), 10);
    if (!isNaN(an) && !isNaN(bn)) return an - bn;
    return a.localeCompare(b);
  });

  return (
    <ScrollArea className="h-screen w-screen fade-in">
      <div className="p-4 md:p-8 pb-24">
        <div className="w-full">
          <WindowFrame title="C:\\Cameroon\\History_Explorer.exe">
            <div className="p-2 bg-black h-[85vh] overflow-y-auto">
              <Accordion
                type="single"
                collapsible
                defaultValue={years[years.length - 1] || undefined}
              >
                {years.map((year) => (
                  <AccordionItem key={year} value={year}>
                    <AccordionTrigger>{year}</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {grouped[year].map((event, i) => (
                          <div
                            key={event.id}
                            className="cursor-pointer bg-[#101012] border border-[#202023] hover:border-primary p-2 rounded-sm flex items-center gap-2"
                            onClick={() => onImageSelect(events.indexOf(event))}
                            title={event.title}
                          >
                            <div className="relative w-16 h-12 flex-shrink-0 border border-[#303033] bg-black overflow-hidden rounded-sm">
                              <Image
                                src={event.imageUrl}
                                alt={event.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-primary font-code truncate">
                                {event.title}
                              </p>
                              <p className="text-[10px] text-secondary font-code">
                                {event.date}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </WindowFrame>
        </div>
      </div>
    </ScrollArea>
  );
}
