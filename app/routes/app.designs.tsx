import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Grid,
  Box,
  Badge,
  InlineStack,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  
  const billingCheck = await billing.check({
    plans: ["Starter Plan", "Pro Plan", "Premium Plan"],
    isTest: true,
  });

  const currentPlan = billingCheck.hasActivePayment 
    ? billingCheck.appSubscriptions[0].name 
    : "Free";

  const getPlanLevel = (plan: string) => {
    switch (plan) {
      case "Premium Plan": return 3;
      case "Pro Plan": return 2;
      case "Starter Plan": return 1;
      default: return 0;
    }
  };

  const currentLevel = getPlanLevel(currentPlan);

  // Mock design library
  const designs = [
    { id: 1, name: "Minimal Social Bar", plan: "Free" },
    { id: 2, name: "Modern Floating Icons", plan: "Free" },
    { id: 3, name: "Rounded Social Bar", plan: "Starter Plan" },
    { id: 4, name: "Glass Social Bar", plan: "Starter Plan" },
    { id: 5, name: "Dark Floating Bar", plan: "Starter Plan" },
    { id: 6, name: "Vertical Side Icons", plan: "Starter Plan" },
    { id: 7, name: "Bottom Sticky Social Bar", plan: "Pro Plan" },
    { id: 8, name: "Gradient Social Bar", plan: "Pro Plan" },
    { id: 9, name: "Compact Social Icons", plan: "Pro Plan" },
    { id: 10, name: "Large Floating Icons", plan: "Pro Plan" },
    { id: 11, name: "Pill Social Bar", plan: "Pro Plan" },
    { id: 12, name: "Elegant Outline Icons", plan: "Premium Plan" },
    { id: 13, name: "Social + Contact Widget", plan: "Premium Plan" },
    { id: 14, name: "Modern Contact Bubble", plan: "Premium Plan" },
    { id: 15, name: "Multi-Action Floating Widget", plan: "Premium Plan" },
    { id: 16, name: "Premium Glass Widget", plan: "Premium Plan" },
  ].map(d => ({
    ...d,
    locked: getPlanLevel(d.plan) > currentLevel
  }));

  return { designs };
};

export default function Designs() {
  const { designs } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  return (
    <Page>
      <TitleBar title="Design Library" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card roundedAbove="sm">
               <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Choose a Design</Text>
                  <Text as="p" variant="bodyMd">
                    Select a beautifully crafted layout for your widget. Your widgets start here.
                  </Text>
               </BlockStack>
            </Card>

            <Grid>
              {designs.map((design) => (
                <Grid.Cell key={design.id} columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                  <Card padding="0">
                    <Box background="bg-surface-secondary" minHeight="150px" padding="400" position="relative">
                      {design.locked ? (
                         <Box position="absolute" insetBlockStart="200" insetInlineEnd="200">
                            <Badge tone="warning">Locked ({design.plan.replace(" Plan", "")})</Badge>
                         </Box>
                      ) : (
                         <Box position="absolute" insetBlockStart="200" insetInlineEnd="200">
                            <Badge tone="success">Unlocked</Badge>
                         </Box>
                      )}
                      
                      <InlineStack align="center" blockAlign="center">
                        <Text as="p" variant="bodySm" color="subdued">Design Preview</Text>
                      </InlineStack>
                    </Box>
                    <Divider />
                    <Box padding="400">
                      <BlockStack gap="400">
                        <Text as="h3" variant="headingSm">{design.name}</Text>
                        {design.locked ? (
                          <Button 
                            fullWidth 
                            tone="success"
                            onClick={() => navigate("/app/billing")}
                          >
                            Upgrade to Unlock
                          </Button>
                        ) : (
                          <Button 
                            fullWidth 
                            variant="primary"
                            onClick={() => navigate("/app/widgets/new")}
                          >
                            Use Design
                          </Button>
                        )}
                      </BlockStack>
                    </Box>
                  </Card>
                </Grid.Cell>
              ))}
            </Grid>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
