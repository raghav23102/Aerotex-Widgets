import { json, LoaderFunctionArgs } from "@remix-run/node";
import prisma from "../db.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const widgetId = params.id;
  if (!widgetId) {
    return json({ error: "Missing widget ID" }, { status: 400, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  const widget = await prisma.widget.findUnique({
    where: { widgetId: widgetId },
    include: { socialLinks: true },
  });

  if (!widget) {
    return json({ error: "Widget not found" }, { status: 404, headers: { "Access-Control-Allow-Origin": "*" } });
  }

  // If the widget is being fetched by the storefront and it's a Draft, mark it as Published
  if (widget.status === "Draft") {
    await prisma.widget.update({
      where: { id: widget.id },
      data: { status: "Published" }
    });
    widget.status = "Published";
  }

  return json(widget, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
};
