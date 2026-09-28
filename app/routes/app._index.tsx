import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Grid,
  Box,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { PlusIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);

  const widgetsCount = await prisma.widget.count({ where: { shop: session.shop } });
  const publishedWidgets = await prisma.widget.count({ where: { shop: session.shop, status: "Published" } });

  let currentPlan = "Free";
  try {
    const billingCheck = await billing.check({
      plans: ["Starter Plan", "Pro Plan", "Premium Plan"],
      isTest: true,
    });
    if (billingCheck?.hasActivePayment && billingCheck?.appSubscriptions?.length > 0) {
      currentPlan = billingCheck.appSubscriptions[0]?.name ?? "Free";
    }
  } catch (e) {
    currentPlan = "Free";
  }

  return {
    stats: {
      totalWidgets: widgetsCount,
      activeWidgets: publishedWidgets,
    },
    billing: {
      plan: currentPlan,
      status: "Active",
    },
  };
};

const POPULAR_DESIGNS = [
  { id: 1, name: "Modern Floating Icons",    plan: "Free",         tag: "Most Popular" },
  { id: 2, name: "Glass Social Bar",         plan: "Starter Plan", tag: "Trending" },
  { id: 3, name: "Bottom Sticky Bar",        plan: "Pro Plan",     tag: "Best CTR" },
  { id: 4, name: "Premium Glass Widget",     plan: "Premium Plan", tag: "Premium" },
];

export default function Dashboard() {
  const { stats, billing } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title="Aerotex Widgets Dashboard">
        <button variant="primary" onClick={() => navigate("/app/widgets/new")}>
          Create New Widget
        </button>
      </TitleBar>

      <BlockStack gap="500">
        {/* ── Stats Row ── */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" color="subdued">Total Widgets</Text>
                <Text as="p" variant="headingXl">{stats.totalWidgets}</Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" color="subdued">Published Widgets</Text>
                <Text as="p" variant="headingXl">{stats.activeWidgets}</Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 4, md: 4, lg: 4, xl: 4 }}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" color="subdued">Current Plan</Text>
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Text as="p" variant="headingXl">{billing.plan}</Text>
                  <Badge tone="success">{billing.status}</Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>

        <Layout>
          <Layout.Section>
            {/* ── Popular Designs ── */}
            <Box paddingBlockStart="400">
              <Text as="h2" variant="headingLg">Popular Designs</Text>
            </Box>
            <Box paddingBlockStart="400">
              <Grid>
                {POPULAR_DESIGNS.map((d) => (
                  <Grid.Cell key={d.id} columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                    <Card padding="0">
                      <Box background="bg-surface-secondary" minHeight="120px" padding="400" position="relative">
                        <Box position="absolute" insetBlockStart="200" insetInlineEnd="200">
                          <Badge>{d.plan.replace(" Plan", "")}</Badge>
                        </Box>
                        <InlineStack align="center" blockAlign="center">
                          <Text as="p" variant="bodySm" color="subdued">{d.tag}</Text>
                        </InlineStack>
                      </Box>
                      <Box padding="300">
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingSm">{d.name}</Text>
                          <InlineStack gap="200" wrap={false}>
                            <Box style={{ flexGrow: 1 }}>
                              <Button fullWidth onClick={() => navigate("/app/widgets/new")}>
                                Use Design
                              </Button>
                            </Box>
                            {d.plan !== "Free" && (
                              <Button tone="success" onClick={() => navigate("/app/billing")}>
                                Upgrade
                              </Button>
                            )}
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    </Card>
                  </Grid.Cell>
                ))}
              </Grid>
            </Box>
          </Layout.Section>

          {/* ── Quick Actions Sidebar ── */}
          <Layout.Section variant="oneThird">
            <Box paddingBlockStart="400">
              <Card roundedAbove="sm">
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Quick Actions</Text>
                  <BlockStack gap="200">
                    <Button
                      textAlign="left"
                      fullWidth
                      icon={PlusIcon}
                      onClick={() => navigate("/app/widgets/new")}
                    >
                      Create Widget
                    </Button>
                    <Button
                      textAlign="left"
                      fullWidth
                      onClick={() => navigate("/app/widgets")}
                    >
                      Manage Widgets
                    </Button>
                    <Button
                      textAlign="left"
                      fullWidth
                      onClick={() => navigate("/app/designs")}
                    >
                      View Designs
                    </Button>
                    <Button
                      textAlign="left"
                      fullWidth
                      tone="success"
                      onClick={() => navigate("/app/billing")}
                    >
                      Upgrade Plan
                    </Button>
                  </BlockStack>
                </BlockStack>
              </Card>
            </Box>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
