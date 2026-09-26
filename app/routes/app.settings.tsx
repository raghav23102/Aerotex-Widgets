import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  Text,
  Button,
  Select,
  TextField,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export default function Settings() {
  return (
    <Page
      title="Settings"
      primaryAction={{ content: 'Save Settings' }}
    >
      <TitleBar title="Settings">
        <button variant="primary">Save Settings</button>
      </TitleBar>
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card roundedAbove="sm">
               <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">General</Text>
                  <Select label="App Status" options={['Enabled', 'Disabled']} value="Enabled" onChange={()=>{}} />
                  <Select label="Default Widget Behavior" options={['Show on load', 'Show on scroll']} value="Show on load" onChange={()=>{}} />
               </BlockStack>
            </Card>

            <Card roundedAbove="sm">
               <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Storefront</Text>
                  <Select label="Default Desktop Position" options={['Bottom Right', 'Bottom Left']} value="Bottom Right" onChange={()=>{}} />
                  <Select label="Default Mobile Position" options={['Bottom Center', 'Hidden']} value="Bottom Center" onChange={()=>{}} />
               </BlockStack>
            </Card>

            <Card roundedAbove="sm">
               <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">Advanced (Premium Only)</Text>
                  <TextField label="Custom CSS" value="" onChange={()=>{}} multiline={4} autoComplete="off" placeholder=".aerotex-widget { z-index: 9999; }" />
                  <Select label="Loading Behavior" options={['Async (Recommended)', 'Synchronous']} value="Async (Recommended)" onChange={()=>{}} />
               </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
