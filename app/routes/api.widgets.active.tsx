import { json, LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");

  if (!shop) {
    return json({ error: "Missing shop domain" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // Find all widgets for this shop that are not Inactive
  const widgets = await prisma.widget.findMany({
    where: { 
      shop: shop,
      status: { in: ["Published", "Active", "Draft"] } 
    },
    include: { socialLinks: true },
  });

  // Mark Draft widgets as Published because they are now loaded on the storefront
  const draftIds = widgets.filter(w => w.status === "Draft").map(w => w.id);
  if (draftIds.length > 0) {
    await prisma.widget.updateMany({
      where: { id: { in: draftIds } },
      data: { status: "Published" }
    });
  }

  // Update in-memory for response
  const responseWidgets = widgets.map(w => ({
    ...w,
    status: w.status === "Draft" ? "Published" : w.status
  }));

  return json(responseWidgets, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
};
