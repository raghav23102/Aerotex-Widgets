import { useState, useCallback } from "react";
import { ActionFunctionArgs, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useParams, useSubmit, useNavigation } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Button,
  Tabs,
  Box,
  Banner,
  Divider,
  Grid,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const isNew = params.id === "new";

  let widget;

  if (isNew) {
    widget = {
      id: "new",
      widgetId: `aerotex-widget-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      name: "",
      type: "Social Media",
      design: "Modern Floating Icons",
      status: "Active",
      settings: JSON.stringify({
        iconSize: "Medium",
        spacing: "Normal",
        backgroundColor: "#ffffff",
        position: "Bottom Right"
      })
    };
  } else {
    widget = await prisma.widget.findUnique({
      where: { id: params.id, shop: session.shop },
    });
    
    if (!widget) {
      return redirect("/app/widgets");
    }
  }

  return { isNew, widget };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const formData = await request.formData();
  const name = formData.get("name") as string;
  const type = formData.get("type") as string;
  const design = formData.get("design") as string;
  const settings = formData.get("settings") as string;
  const widgetId = formData.get("widgetId") as string;

  let store = await prisma.store.findUnique({ where: { shop: session.shop } });
  if (!store) {
     store = await prisma.store.create({ data: { shop: session.shop } });
  }

  if (params.id === "new") {
    await prisma.widget.create({
      data: {
        shop: session.shop,
        widgetId,
        name,
        type,
        design,
        settings,
      },
    });
  } else {
    await prisma.widget.update({
      where: { id: params.id, shop: session.shop },
      data: {
        name,
        type,
        design,
        settings,
      },
    });
  }

  return redirect("/app/widgets");
};

export default function WidgetEditor() {
  const { isNew, widget } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();
  const shopify = useAppBridge();
  
  const [name, setName] = useState(widget.name);
  const [type, setType] = useState(widget.type);
  const [design, setDesign] = useState(widget.design);
  const [settings, setSettings] = useState(() => JSON.parse(widget.settings));
  
  const [selectedTab, setSelectedTab] = useState(0);
  
  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelectedTab(selectedTabIndex),
    [],
  );

  const handleSave = () => {
    submit(
      {
        name,
        type,
        design,
        settings: JSON.stringify(settings),
        widgetId: widget.widgetId,
      },
      { method: "post" }
    );
    shopify.toast.show("Widget saved successfully.");
  };

  const isSaving = navigation.state === "submitting";

  const tabs = [
    { id: 'basic', content: 'Basic', panelID: 'basic-content' },
    { id: 'design', content: 'Design', panelID: 'design-content' },
    { id: 'social', content: 'Social Media', panelID: 'social-content' },
    { id: 'appearance', content: 'Appearance', panelID: 'appearance-content' },
    { id: 'position', content: 'Position & Behavior', panelID: 'position-content' },
    { id: 'implementation', content: 'Theme Implementation', panelID: 'implementation-content' }
  ];

  return (
    <Page
      backAction={{ content: 'Widgets', onAction: () => navigate('/app/widgets') }}
      title={isNew ? "Create Widget" : "Edit Widget"}
      primaryAction={{ content: 'Save Widget', onAction: handleSave, loading: isSaving }}
    >
      <TitleBar title={isNew ? "Create Widget" : "Edit Widget"}>
        <button variant="primary" onClick={handleSave}>
          Save Widget
        </button>
      </TitleBar>
      <Layout>
        {/* LEFT COLUMN: Settings */}
        <Layout.Section>
          <BlockStack gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Widget Information</Text>
                  <Box>
                    <Text as="span" variant="bodySm" color="subdued">Widget ID: </Text>
                    <Text as="span" variant="bodyMd" fontWeight="bold">{widget.widgetId}</Text>
                    <Button variant="plain" onClick={() => {
                        navigator.clipboard.writeText(widget.widgetId);
                        shopify.toast.show("Widget ID copied!");
                    }}>Copy ID</Button>
                  </Box>
                </InlineStack>
                <TextField
                  label="Widget Name"
                  value={name}
                  onChange={setName}
                  autoComplete="off"
                  placeholder="e.g. Homepage Social Bar"
                />
              </BlockStack>
            </Card>

            <Card padding="0">
              <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} fitted>
                <Box padding="400">
                  {selectedTab === 0 && (
                    <BlockStack gap="400">
                      <Select
                        label="Widget Type"
                        options={['Social Media', 'Sticky Social Bar', 'Floating Social Icons', 'Contact Widget', 'Floating Action Widget']}
                        value={type}
                        onChange={setType}
                      />
                      <Select
                        label="Design"
                        options={['Modern Floating Icons', 'Minimal Social Bar', 'Glass Social Bar', 'Bottom Sticky Social Bar']}
                        value={design}
                        onChange={setDesign}
                      />
                    </BlockStack>
                  )}
                  {selectedTab === 1 && (
                     <BlockStack gap="400">
                       <Text as="h3" variant="headingMd">Design Theme</Text>
                       <Text as="p" variant="bodyMd">Available designs will go here (Visual grid).</Text>
                     </BlockStack>
                  )}
                  {selectedTab === 2 && (
                    <BlockStack gap="400">
                      <Button fullWidth>Add Social Platform</Button>
                      <Text as="p" color="subdued">You can drag to reorder these links.</Text>
                    </BlockStack>
                  )}
                  {selectedTab === 3 && (
                    <BlockStack gap="400">
                      <Grid>
                         <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                           <Select label="Icon Size" options={['Small', 'Medium', 'Large']} value={settings.iconSize} onChange={(val) => setSettings({...settings, iconSize: val})} />
                         </Grid.Cell>
                         <Grid.Cell columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
                            <Select label="Spacing" options={['Compact', 'Normal', 'Spacious']} value={settings.spacing} onChange={(val) => setSettings({...settings, spacing: val})} />
                         </Grid.Cell>
                      </Grid>
                    </BlockStack>
                  )}
                  {selectedTab === 4 && (
                    <BlockStack gap="400">
                      <Select label="Desktop Position" options={['Bottom Right', 'Bottom Left', 'Top Right', 'Left Center']} value={settings.position} onChange={(val) => setSettings({...settings, position: val})} />
                    </BlockStack>
                  )}
                  {selectedTab === 5 && (
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Theme Implementation</Text>
                      
                      <Card background="bg-surface-secondary">
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingSm">Option A: Theme App Embed (Recommended)</Text>
                          <Text as="p" variant="bodyMd">Enable Aerotex Widgets from your Shopify Theme Editor to display this widget across your storefront.</Text>
                          <InlineStack>
                            <Button>Open Theme Editor</Button>
                          </InlineStack>
                        </BlockStack>
                      </Card>

                      <Card background="bg-surface-secondary">
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingSm">Option B: Theme App Block</Text>
                          <Text as="p" variant="bodyMd">Add this widget directly to a supported theme section using the Aerotex Widgets app block.</Text>
                          <InlineStack>
                            <Button>Open Theme Editor</Button>
                          </InlineStack>
                        </BlockStack>
                      </Card>

                      <Card background="bg-surface-secondary">
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingSm">Option C: Advanced ID/CSS Selector Integration</Text>
                          <Text as="p" variant="bodyMd">Target a specific section in your theme manually using its CSS ID or Class.</Text>
                          <Text as="p" variant="bodyMd">Your Widget ID is: <b>{widget.widgetId}</b></Text>
                        </BlockStack>
                      </Card>
                    </BlockStack>
                  )}
                </Box>
              </Tabs>
            </Card>
          </BlockStack>
        </Layout.Section>

        {/* RIGHT COLUMN: Preview */}
        <Layout.Section variant="oneThird">
          <Box style={{ position: 'sticky', top: '16px' }}>
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Live Preview</Text>
                <Divider />
                <Box minHeight="300px" background="bg-surface-secondary" borderRadius="200" padding="400" position="relative">
                   <Text as="p" variant="bodyMd" color="subdued" alignment="center">
                     {name || "Widget Preview"}
                   </Text>
                   
                   {/* Mock Widget floating at bottom right */}
                   <Box position="absolute" insetBlockEnd="400" insetInlineEnd="400">
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: settings.spacing === 'Compact' ? '8px' : settings.spacing === 'Spacious' ? '16px' : '12px',
                        background: '#fff',
                        padding: '12px',
                        borderRadius: '24px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{width: 32, height: 32, borderRadius: '50%', background: '#3b5998'}}></div>
                        <div style={{width: 32, height: 32, borderRadius: '50%', background: '#C13584'}}></div>
                        <div style={{width: 32, height: 32, borderRadius: '50%', background: '#000000'}}></div>
                      </div>
                   </Box>
                </Box>
              </BlockStack>
            </Card>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
