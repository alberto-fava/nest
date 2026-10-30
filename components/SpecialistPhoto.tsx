import Image from "next/image";
import type { CSSProperties } from "react";
import type { Specialist } from "@/data/specialists";

/**
 * Foto dello specialista. Con `size` è un cerchio di quella misura;
 * senza, riempie il contenitore (che deve essere position: relative).
 */
export function SpecialistPhoto({
  specialist,
  size,
  ring,
  className,
  style,
  priority,
}: {
  specialist: Specialist;
  size?: number;
  /** Anello attorno alla foto, es. "0 0 0 3px #FFFFFF". */
  ring?: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
}) {
  const alt = `Foto di ${specialist.name}`;
  if (!size) {
    return <Image src={specialist.photo} alt={alt} fill sizes="(max-width: 900px) 100vw, 340px" priority={priority} style={{ objectFit: "cover", ...style }} className={className} />;
  }
  return (
    <span
      className={className}
      style={{ position: "relative", flex: "0 0 auto", display: "block", width: size, height: size, borderRadius: "50%", overflow: "hidden", background: "var(--orb-base)", boxShadow: ring, ...style }}
    >
      <Image src={specialist.photo} alt={alt} width={size * 2} height={size * 2} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </span>
  );
}
