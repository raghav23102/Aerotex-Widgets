import { LoaderFunctionArgs, ActionFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Grid,
  Box,
  List,
  Divider,
  Banner,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const MONTHLY_PLAN_STARTER = "Starter Plan";
export const MONTHLY_PLAN_PRO = "Pro Plan";
export const MONTHLY_PLAN_PREMIUM = "Premium Plan";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  
  // Check active plan
  let currentPlan = "Free";
  try {
    const billingCheck = await billing.check({
      plans: [MONTHLY_PLAN_STARTER, MONTHLY_PLAN_PRO, MONTHLY_PLAN_PREMIUM],
      isTest: true,
    });
    if (billingCheck?.hasActivePayment && billingCheck?.appSubscriptions?.length > 0) {
      currentPlan = billingCheck.appSubscriptions[0]?.name ?? "Free";
    }
  } catch (e) {
    currentPlan = "Free";
  }

  return { currentPlan };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { billing } = await authenticate.admin(request);
  const formData = await request.formData();
  const planName = formData.get("plan") as string;
  
  if (planName === "Free") {
    // To downgrade to free, we cancel the current subscription.
    const billingCheck = await billing.check({
      plans: [MONTHLY_PLAN_STARTER, MONTHLY_PLAN_PRO, MONTHLY_PLAN_PREMIUM],
      isTest: true,
    });
    
    if (billingCheck.hasActivePayment) {
      await billing.cancel({
        subscriptionId: billingCheck.appSubscriptions[0].id,
        isTest: true,
        prorate: true,
      });
    }
    return null;
  }

  // Let Shopify App Remix auto-generate the return URL to prevent routing errors.
  // We use try/catch to ensure if it's not a redirect, we don't crash with 500.
  try {
    await billing.request({
      plan: planName,
      isTest: true,
    });
  } catch (error) {
    if (error instanceof Response) {
      throw error;
    }
    console.error("Billing Request Error:", error);
    return json({ error: String(error) }, { status: 400 });
  }

  return null;
};

export default function Billing() {
  const { currentPlan } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  const handlePlanChange = (planName: string) => {
    submit({ plan: planName }, { method: "post" });
  };

  const getPlanLevel = (planName: string) => {
    if (planName === "Free") return 0;
    if (planName === MONTHLY_PLAN_STARTER) return 1;
    if (planName === MONTHLY_PLAN_PRO) return 2;
    if (planName === MONTHLY_PLAN_PREMIUM) return 3;
    return 0;
  };

  const currentLevel = getPlanLevel(currentPlan);

  const plans = [
    {
      name: "Free",
      id: "Free",
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
      level: 0
    },
    {
      name: "STARTER",
      id: MONTHLY_PLAN_STARTER,
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
      isCurrent: currentPlan === MONTHLY_PLAN_STARTER,
      level: 1
    },
    {
      name: "PRO",
      id: MONTHLY_PLAN_PRO,
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
      isCurrent: currentPlan === MONTHLY_PLAN_PRO,
      level: 2
    },
    {
      name: "PREMIUM",
      id: MONTHLY_PLAN_PREMIUM,
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
      isCurrent: currentPlan === MONTHLY_PLAN_PREMIUM,
      level: 3
    }
  ];

  return (
    <Page>
      <TitleBar title="Billing & Plans" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            {actionData?.error && (
              <Banner tone="critical" title="Billing Request Failed">
                <p>{actionData.error}</p>
              </Banner>
            )}
            <Card roundedAbove="sm">
               <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Subscription Plans</Text>
                  <Text as="p" variant="bodyMd">
                    Upgrade to unlock more Aerotex Widgets features. Shopify handles prorated billing automatically.
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
                        ) : plan.level < currentLevel ? (
                          <Button 
                            fullWidth 
                            onClick={() => handlePlanChange(plan.id)}
                            loading={isSubmitting}
                            tone="critical"
                          >
                            Downgrade
                          </Button>
                        ) : (
                          <Button 
                            fullWidth 
                            variant="primary" 
                            onClick={() => handlePlanChange(plan.id)}
                            loading={isSubmitting}
                          >
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
