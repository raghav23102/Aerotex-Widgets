import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
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
  List,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  
  // Mock current plan
  return {
    currentPlan: "Free",
  };
};

export default function Billing() {
  const { currentPlan } = useLoaderData<typeof loader>();

  const plans = [
    {
      name: "FREE",
      price: "$0/month",
      subtitle: "Free Forever",
      features: [
        "2 widget designs",
        "1 active widget",
        "Up to 3 social links",
        "Basic designs & icon styles",
        "App Embed & App Block",
      ],
      isCurrent: currentPlan === "Free",
    },
    {
      name: "STARTER",
      price: "$2.99/month",
      features: [
        "5 widget designs",
        "3 active widgets",
        "All social platforms",
        "Sticky & Floating widgets",
        "Basic animations",
        "Desktop/mobile controls",
        "ID/CSS selector integration",
      ],
      isCurrent: currentPlan === "Starter",
    },
    {
      name: "PRO",
      price: "$5.99/month",
      features: [
        "10 widget designs",
        "10 active widgets",
        "All standard designs",
        "All icon styles & animations",
        "Multiple widgets",
        "Custom styling",
        "Priority support",
      ],
      isCurrent: currentPlan === "Pro",
    },
    {
      name: "PREMIUM",
      price: "$9.99/month",
      features: [
        "All available designs",
        "Unlimited active widgets",
        "Unlimited social links",
        "Premium designs",
        "Custom CSS",
        "Advanced positioning",
        "All integration methods",
      ],
      isCurrent: currentPlan === "Premium",
    }
  ];

  return (
    <Page>
      <TitleBar title="Billing & Plans" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card roundedAbove="sm">
               <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Subscription Plans</Text>
                  <Text as="p" variant="bodyMd">
                    Upgrade to unlock more Aerotex Widgets features.
                  </Text>
               </BlockStack>
            </Card>

            <Grid>
              {plans.map((plan) => (
                <Grid.Cell key={plan.name} columnSpan={{xs: 6, sm: 3, md: 3, lg: 3, xl: 3}}>
                  <Card padding="0">
                    <Box padding="400" background={plan.isCurrent ? "bg-surface-brand" : "bg-surface"}>
                      <BlockStack gap="200">
                        <Text as="h3" variant="headingLg" color={plan.isCurrent ? "text-inverse" : "text"}>{plan.name}</Text>
                        <Text as="p" variant="headingXl" color={plan.isCurrent ? "text-inverse" : "text"}>{plan.price}</Text>
                        {plan.subtitle && <Text as="p" variant="bodyMd" color={plan.isCurrent ? "text-inverse" : "subdued"}>{plan.subtitle}</Text>}
                      </BlockStack>
                    </Box>
                    <Divider />
                    <Box padding="400">
                      <BlockStack gap="400">
                        <List type="bullet">
                           {plan.features.map(feature => (
                              <List.Item key={feature}>{feature}</List.Item>
                           ))}
                        </List>
                        
                        {plan.isCurrent ? (
                          <Button fullWidth disabled>Current Plan</Button>
                        ) : (
                          <Button fullWidth variant="primary">
                            Upgrade
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
