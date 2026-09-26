import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  List,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Help() {
  return (
    <Page title="Help / Support">
      <TitleBar title="Help / Support" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card roundedAbove="sm">
               <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Getting Started with Aerotex Widgets</Text>
                  <Text as="p" variant="bodyMd">
                    Follow these simple steps to add beautiful widgets to your storefront:
                  </Text>
                  <List type="number">
                     <List.Item>Go to the <b>Widgets</b> tab and click <b>Create Widget</b>.</List.Item>
                     <List.Item>Select a widget type and design.</List.Item>
                     <List.Item>Add your social media URLs.</List.Item>
                     <List.Item>Go to the <b>Theme Implementation</b> tab inside the Widget Editor.</List.Item>
                     <List.Item>Click <b>Open Theme Editor</b> to enable the App Embed for Aerotex Widgets.</List.Item>
                     <List.Item>Save and activate!</List.Item>
                  </List>
               </BlockStack>
            </Card>

            <Card roundedAbove="sm">
               <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Need more help?</Text>
                  <Text as="p" variant="bodyMd">
                    Our support team is ready to help you set up your widgets or resolve any issues.
                  </Text>
                  <Button variant="primary">Contact Support</Button>
               </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
