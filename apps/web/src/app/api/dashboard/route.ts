import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/resources";
import { getCurrentUser } from "@/lib/session";

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const data = await getDashboardData(user.id);
  const favorites = data.progress.filter((resource) => resource.progress?.isFavorite).length;
  const saved = data.progress.filter((resource) => resource.progress?.isSaved).length;
  const completed = data.progress.filter((resource) =>
    ["COMPLETED", "EXPLOITED"].includes(resource.progress?.status ?? ""),
  ).length;

  return NextResponse.json({
    user,
    data,
    counters: { favorites, saved, completed },
  });
}
