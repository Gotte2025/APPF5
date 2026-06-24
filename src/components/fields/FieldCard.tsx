import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { Field } from "@/types/field";

interface FieldCardProps {
  field: Field;
  complexName?: string;
}

export function FieldCard({ field, complexName }: FieldCardProps) {
  return (
    <Link href={`/fields/${field.id}`}>
      <Card className="transition-colors hover:border-cono/40">
        <p className="text-sm font-semibold text-linea">{field.name}</p>
        {complexName && <p className="text-xs text-linea-dim">{complexName}</p>}
        <div className="mt-3 flex items-center gap-3 text-xs text-linea-dim">
          <span>Cupo: {field.capacity}</span>
          {field.surface && <span>· {field.surface}</span>}
        </div>
      </Card>
    </Link>
  );
}
