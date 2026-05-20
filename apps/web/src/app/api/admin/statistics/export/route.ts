import { NextResponse } from "next/server";
import { canModerate } from "@/lib/permissions";
import { getAdminStats, type AdminStatsFilters } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

function escapeCsv(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function period(value: string | null): AdminStatsFilters["period"] {
  if (value === "current-month" || value === "last-month") return value;
  return "all";
}

export async function GET(req: Request) {
  const user = await getCurrentUser();

  if (!user || !canModerate(user.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const params = new URL(req.url).searchParams;
  const stats = await getAdminStats({
    period: period(params.get("period")),
    category: params.get("category") || undefined,
  });

  const rows = [
    ["Indicateur", "Valeur"],
    ["Consultations", stats.counters.consultations],
    ["Recherches", stats.counters.searches],
    ["Créations", stats.counters.creations],
    ["Partages", stats.counters.shares],
    ["Commentaires", stats.counters.comments],
  ];

  const csv = rows.map((row) => row.map(escapeCsv).join(";")).join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="statistiques-ressources.csv"',
    },
  });
}
