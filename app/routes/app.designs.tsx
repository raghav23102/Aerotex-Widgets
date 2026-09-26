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
  await authenticate.admin(request);
  
  // Mock design library
  const designs = [
    { id: 1, name: "Minimal Social Bar", plan: "Free", locked: false },
    { id: 2, name: "Modern Floating Icons", plan: "Free", locked: false },
    { id: 3, name: "Rounded Social Bar", plan: "Starter", locked: true },
    { id: 4, name: "Glass Social Bar", plan: "Starter", locked: true },
    { id: 5, name: "Dark Floating Bar", plan: "Starter", locked: true },
    { id: 6, name: "Vertical Side Icons", plan: "Starter", locked: true },
    { id: 7, name: "Bottom Sticky Social Bar", plan: "Pro", locked: true },
    { id: 8, name: "Gradient Social Bar", plan: "Pro", locked: true },
    { id: 9, name: "Compact Social Icons", plan: "Pro", locked: true },
    { id: 10, name: "Large Floating Icons", plan: "Pro", locked: true },
    { id: 11, name: "Pill Social Bar", plan: "Pro", locked: true },
    { id: 12, name: "Elegant Outline Icons", plan: "Premium", locked: true },
    { id: 13, name: "Social + Contact Widget", plan: "Premium", locked: true },
    { id: 14, name: "Modern Contact Bubble", plan: "Premium", locked: true },
    { id: 15, name: "Multi-Action Floating Widget", plan: "Premium", locked: true },
    { id: 16, name: "Premium Glass Widget", plan: "Premium", locked: true },
  ];

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
                      {design.locked && (
                         <Box position="absolute" insetBlockStart="200" insetInlineEnd="200">
                            <Badge tone="warning">Locked ({design.plan})</Badge>
                         </Box>
                      )}
                      {!design.locked && (
                         <Box position="absolute" insetBlockStart="200" insetInlineEnd="200">
                            <Badge tone="success">Available</Badge>
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
                        <Button 
                          fullWidth 
                          variant={design.locked ? "secondary" : "primary"}
                          disabled={design.locked}
                          onClick={() => navigate("/app/widgets/new")}
                        >
                          {design.locked ? `Unlock with ${design.plan}` : "Use Design"}
                        </Button>
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
