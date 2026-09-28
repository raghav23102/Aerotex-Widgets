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
  IndexTable,
  EmptyState,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { PlusIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);

  const widgetsCount = await prisma.widget.count({ where: { shop: session.shop } });
  const publishedWidgets = await prisma.widget.count({ where: { shop: session.shop, status: "Published" } });

  // Fetch 5 most recent widgets
  const recentWidgets = await prisma.widget.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, widgetId: true, name: true, type: true, design: true, status: true, createdAt: true },
  });

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

  const maxWidgetsMap: Record<string, number> = {
    "Free": 1,
    "Starter Plan": 5,
    "Pro Plan": 10,
    "Premium Plan": Infinity
  };
  const maxWidgets = maxWidgetsMap[currentPlan] ?? 1;
  const limitReached = widgetsCount >= maxWidgets;

  return {
    stats: { totalWidgets: widgetsCount, publishedWidgets },
    billing: { plan: currentPlan, status: "Active" },
    recentWidgets,
    limitReached,
  };
};

export default function Dashboard() {
  const { stats, billing, recentWidgets, limitReached } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title="Aerotex Widgets Dashboard">
        <button variant="primary" onClick={() => navigate(limitReached ? "/app/billing" : "/app/widgets/new")}>
          {limitReached ? "Upgrade to Create More" : "Create New Widget"}
        </button>
      </TitleBar>

      <BlockStack gap="500">
        {/* ── Stat Cards ── */}
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
                <Text as="p" variant="headingXl">{stats.publishedWidgets}</Text>
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
          {/* ── Recent Widgets ── */}
          <Layout.Section>
            <Card padding="0">
              <Box padding="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Recent Widgets</Text>
                  <Button onClick={() => navigate("/app/widgets")}>View All</Button>
                </InlineStack>
              </Box>
              <Divider />
              {recentWidgets.length === 0 ? (
                <EmptyState
                  heading="No widgets yet"
                  action={{ content: "Create Widget", onAction: () => navigate("/app/widgets/new"), disabled: limitReached }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>Create your first widget to see it here.</p>
                </EmptyState>
              ) : (
                <IndexTable
                  resourceName={{ singular: "widget", plural: "widgets" }}
                  itemCount={recentWidgets.length}
                  headings={[
                    { title: "Name" },
                    { title: "Type" },
                    { title: "Design" },
                    { title: "Status" },
                    { title: "Action" },
                  ]}
                  selectable={false}
                >
                  {recentWidgets.map(({ id, name, type, design, status }, index) => (
                    <IndexTable.Row
                      id={id}
                      key={id}
                      position={index}
                      onClick={() => navigate(`/app/widgets/${id}`)}
                    >
                      <IndexTable.Cell>
                        <Text variant="bodyMd" fontWeight="bold" as="span">{name || "Unnamed"}</Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Text variant="bodySm" as="span" color="subdued">{type}</Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Text variant="bodySm" as="span" color="subdued">{design}</Text>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Badge tone={status === "Published" ? "success" : "new"}>{status}</Badge>
                      </IndexTable.Cell>
                      <IndexTable.Cell>
                        <Button
                          size="micro"
                          onClick={(e) => { e.stopPropagation(); navigate(`/app/widgets/${id}`); }}
                        >
                          Edit
                        </Button>
                      </IndexTable.Cell>
                    </IndexTable.Row>
                  ))}
                </IndexTable>
              )}
            </Card>
          </Layout.Section>

          {/* ── Quick Actions Sidebar ── */}
          <Layout.Section variant="oneThird">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Quick Actions</Text>
                <BlockStack gap="200">
                  <Button
                    textAlign="left"
                    fullWidth
                    icon={PlusIcon}
                    onClick={() => navigate(limitReached ? "/app/billing" : "/app/widgets/new")}
                    disabled={limitReached}
                  >
                    {limitReached ? "Plan Limit Reached" : "Create Widget"}
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
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
