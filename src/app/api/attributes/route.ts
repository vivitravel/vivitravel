import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/public";
import type { AttributeDef } from "@/lib/types";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoria");

  if (!categoryId) return NextResponse.json([]);

  const db = createPublicClient();
  const { data } = await db
    .from("attributes")
    .select("id, key, label, type, options, sort_order")
    .eq("category_id", categoryId)
    .eq("filterable", true)
    .order("sort_order");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: AttributeDef[] = (data ?? []).map((a: any) => ({
    id: a.id,
    key: a.key,
    label: a.label,
    type: a.type as AttributeDef["type"],
    options: Array.isArray(a.options) ? a.options : null,
    sort_order: a.sort_order,
  }));

  return NextResponse.json(result);
}
