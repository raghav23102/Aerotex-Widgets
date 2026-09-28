import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { topic, shop, session, payload } = await authenticate.webhook(request);

  if (!session) {
    // The session may have been deleted if the app was uninstalled
    // But we still continue to process the privacy webhook and return 200 OK
  }

  switch (topic) {
    case "CUSTOMERS_DATA_REQUEST":
    case "customers/data_request":
    case "CUSTOMERS_REDACT":
    case "customers/redact":
    case "SHOP_REDACT":
    case "shop/redact":
      console.log(`Received privacy webhook: ${topic} for ${shop}`);
      // Handle privacy requests here if you store customer data
      break;
    default:
      console.log(`Unhandled webhook topic: ${topic}`);
      break;
  }

  return new Response();
};
