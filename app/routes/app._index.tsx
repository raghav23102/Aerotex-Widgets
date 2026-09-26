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
  Icon,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { PlusIcon } from "@shopify/polaris-icons";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // Mock data for now
  return {
    stats: {
      totalWidgets: 3,
      activeWidgets: 2,
      availableDesigns: 16,
      designsUsed: 2,
    },
    billing: {
      plan: "Free",
      status: "Active",
    },
    integration: {
      status: "Not Connected", // "Connected" | "Not Connected"
    }
  };
};

export default function Dashboard() {
  const { stats, billing, integration } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title="Aerotex Widgets Dashboard">
        <button variant="primary" onClick={() => navigate("/app/widgets/new")}>
          Create New Widget
        </button>
      </TitleBar>

      <BlockStack gap="500">
        <Grid>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" color="subdued">Total Widgets</Text>
                <Text as="p" variant="headingXl">{stats.totalWidgets}</Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" color="subdued">Active Widgets</Text>
                <Text as="p" variant="headingXl">{stats.activeWidgets}</Text>
              </BlockStack>
            </Card>
          </Grid.Cell>
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
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
          <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
            <Card roundedAbove="sm">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm" color="subdued">Theme Integration</Text>
                <InlineStack gap="200" align="start" blockAlign="center">
                  <Text as="p" variant="headingLg">
                    {integration.status}
                  </Text>
                  <Badge tone={integration.status === "Connected" ? "success" : "critical"}>
                    {integration.status === "Connected" ? "Active" : "Action Required"}
                  </Badge>
                </InlineStack>
              </BlockStack>
            </Card>
          </Grid.Cell>
        </Grid>

        <Layout>
          <Layout.Section>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Theme Integration Status</Text>
                
                {integration.status === "Not Connected" ? (
                  <BlockStack gap="300">
                    <Box padding="300" background="bg-surface-warning" borderRadius="200">
                      <Text as="p" variant="bodyMd">
                        Aerotex Widgets is not currently enabled in your theme. You must enable the App Embed for your widgets to appear on your storefront.
                      </Text>
                    </Box>
                    <InlineStack>
                      <Button variant="primary">Enable in Theme Editor</Button>
                    </InlineStack>
                  </BlockStack>
                ) : (
                  <Box padding="300" background="bg-surface-success" borderRadius="200">
                    <Text as="p" variant="bodyMd">
                      Aerotex Widgets is successfully connected to your theme. Your active widgets will display on the storefront.
                    </Text>
                  </Box>
                )}
              </BlockStack>
            </Card>

            <Box paddingBlockStart="400">
              <Text as="h2" variant="headingLg">Popular Designs</Text>
            </Box>
            <Grid>
              {/* Mocking popular designs */}
              {[1, 2, 3, 4].map((i) => (
                <Grid.Cell key={i} columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                  <Card padding="0">
                    <Box background="bg-surface-secondary" minHeight="120px" padding="400">
                      {/* Visual placeholder for design */}
                      <InlineStack align="center" blockAlign="center">
                        <Text as="p" variant="bodySm" color="subdued">Preview {i}</Text>
                      </InlineStack>
                    </Box>
                    <Box padding="300">
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingSm">Design Theme {i}</Text>
                        <Button fullWidth onClick={() => navigate("/app/designs")}>Use Design</Button>
                      </BlockStack>
                    </Box>
                  </Card>
                </Grid.Cell>
              ))}
            </Grid>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Quick Actions</Text>
                <BlockStack gap="200">
                  <Button textAlign="left" fullWidth icon={PlusIcon} onClick={() => navigate("/app/widgets/new")}>
                    Create Widget
                  </Button>
                  <Button textAlign="left" fullWidth onClick={() => navigate("/app/designs")}>
                    View Designs
                  </Button>
                  <Button textAlign="left" fullWidth onClick={() => navigate("/app/widgets")}>
                    Manage Integrations
                  </Button>
                  <Button textAlign="left" fullWidth onClick={() => navigate("/app/billing")}>
                    Manage Billing
                  </Button>
                  <Button textAlign="left" fullWidth>
                    Open Theme Editor
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
