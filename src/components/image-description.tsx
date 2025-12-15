"use client";
import { useEffect, useState } from "react";

import { Skeleton } from "./ui/skeleton";

interface ImageDescriptionProps {
  imageId: string;
  imageHint: string;
}

export default function ImageDescription({
  imageId,
  imageHint,
}: ImageDescriptionProps) {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Use a dummy description to avoid server/Ai calls during dev which can trigger
    // Server Actions / forwarded header issues in some environments.
    let isMounted = true;
    setLoading(true);
    setDescription("");

    const hintText = imageHint || imageId || "an important historical moment";
    const desc = `A historic image showing ${hintText}.`;

    const t = setTimeout(() => {
      if (isMounted) {
        setDescription(desc);
        setLoading(false);
      }
    }, 250);

    return () => {
      isMounted = false;
      clearTimeout(t);
    };
  }, [imageId, imageHint]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  return <p className="text-muted-foreground">{description}</p>;
}
