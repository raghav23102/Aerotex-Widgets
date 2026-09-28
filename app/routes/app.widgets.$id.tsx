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
  Divider,
  Grid,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);
  const isNew = params.id === "new";

  const billingCheck = await billing.check({
    plans: ["Starter Plan", "Pro Plan", "Premium Plan"],
    isTest: true,
  });

  const currentPlan = billingCheck.hasActivePayment 
    ? billingCheck.appSubscriptions[0].name 
    : "Free";

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
        position: "Bottom Right",
        socialLinks: {
          facebook: "",
          twitter: "",
          instagram: "",
          youtube: "",
          tiktok: "",
          pinterest: "",
          linkedin: ""
        },
        contactLinks: {
          whatsapp: "",
          phone: "",
          email: "",
          messenger: "",
          instagram: "",
          linkedin: "",
          location: ""
        }
      })
    };
  } else {
    widget = await prisma.widget.findUnique({
      where: { id: params.id, shop: session.shop },
    });
    
    if (!widget) {
      return redirect("/app/widgets");
    }
    const parsedSettings = JSON.parse(widget.settings);
    if (!parsedSettings.socialLinks) parsedSettings.socialLinks = {};
    if (!parsedSettings.contactLinks) parsedSettings.contactLinks = {};
    widget.settings = JSON.stringify(parsedSettings);
  }

  return { isNew, widget, currentPlan };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  
  const _action = formData.get("_action") as string;

  if (_action === "delete") {
    if (params.id !== "new") {
      await prisma.widget.delete({
        where: { id: params.id, shop: session.shop },
      });
    }
    return redirect("/app/widgets");
  }

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

export const ALL_DESIGNS = [
  { name: "Minimal Social Bar", plan: "Free" },
  { name: "Modern Floating Icons", plan: "Free" },
  { name: "Rounded Social Bar", plan: "Starter Plan" },
  { name: "Glass Social Bar", plan: "Starter Plan" },
  { name: "Dark Floating Bar", plan: "Starter Plan" },
  { name: "Vertical Side Icons", plan: "Starter Plan" },
  { name: "Bottom Sticky Social Bar", plan: "Pro Plan" },
  { name: "Gradient Social Bar", plan: "Pro Plan" },
  { name: "Compact Social Icons", plan: "Pro Plan" },
  { name: "Large Floating Icons", plan: "Pro Plan" },
  { name: "Pill Social Bar", plan: "Pro Plan" },
  { name: "Elegant Outline Icons", plan: "Premium Plan" },
  { name: "Social + Contact Widget", plan: "Premium Plan" },
  { name: "Modern Contact Bubble", plan: "Premium Plan" },
  { name: "Multi-Action Floating Widget", plan: "Premium Plan" },
  { name: "Premium Glass Widget", plan: "Premium Plan" },
];

const ICON_MAP: Record<string, string> = {
  facebook: '<svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  twitter: '<svg viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.15H5.078z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24" fill="url(#instagram-grad)"><defs><linearGradient id="instagram-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#fdf497"/><stop offset="5%" stop-color="#fdf497"/><stop offset="45%" stop-color="#fd5949"/><stop offset="60%" stop-color="#d6249f"/><stop offset="90%" stop-color="#285AEB"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.203 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>',
  youtube: '<svg viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  tiktok: '<svg viewBox="0 0 24 24" fill="#000000"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.78-1.15 5.54-3.33 7.31-1.9 1.57-4.49 2.15-6.84 1.54-2.73-.71-5.14-2.81-5.96-5.59-.72-2.5.02-5.32 1.83-7.15 1.59-1.61 4.12-2.4 6.36-1.74v4.13c-2.4-.23-4.52 2.11-3.92 4.47.45 1.88 2.5 3.12 4.39 2.52 1.58-.5 2.53-2.1 2.53-3.76-.02-6.52-.01-13.05-.01-19.57z"/></svg>',
  pinterest: '<svg viewBox="0 0 24 24" fill="#E60023"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.624 0 12.017 0z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  whatsapp: '<svg viewBox="0 0 24 24" fill="#25D366"><path d="M12.031 0C5.397 0 0 5.398 0 12.035c0 2.12.552 4.186 1.597 6.002L.15 23.85l5.962-1.563A11.968 11.968 0 0012.031 24c6.634 0 12.036-5.399 12.036-12.035S18.666 0 12.031 0zm0 21.986c-1.815 0-3.593-.487-5.15-1.411l-.369-.22-3.829 1.004 1.025-3.73-.241-.384A9.972 9.972 0 012.015 12.03c0-5.525 4.498-10.024 10.023-10.024 5.524 0 10.023 4.499 10.023 10.024 0 5.525-4.499 10.024-10.024 10.024zm5.503-7.518c-.302-.151-1.787-.881-2.064-.982-.276-.1-.478-.151-.679.15-.201.302-.781.983-.956 1.184-.176.202-.352.227-.654.076-.301-.151-1.275-.47-2.43-1.503-.898-.804-1.504-1.796-1.68-2.098-.176-.301-.019-.464.132-.614.135-.135.301-.352.453-.528.15-.176.201-.301.301-.502.1-.202.05-.378-.025-.529-.076-.151-.679-1.634-.93-2.238-.246-.59-.496-.511-.679-.52-.176-.008-.378-.009-.579-.009s-.528.075-.805.377c-.276.302-1.055 1.031-1.055 2.516s1.08 2.918 1.231 3.12c.15.201 2.128 3.249 5.155 4.557.719.31 1.28.495 1.718.634.721.23 1.378.197 1.895.12.58-.086 1.787-.73 2.038-1.434.251-.705.251-1.309.176-1.435-.075-.126-.276-.201-.578-.352z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="#34D399"><path d="M22.56 16.3l-3.3-1.65a2.23 2.23 0 0 0-2.58.46l-1.56 1.56a15.82 15.82 0 0 1-7.23-7.23l1.56-1.56a2.23 2.23 0 0 0 .46-2.58l-1.65-3.3A2.25 2.25 0 0 0 6.06 1H2.63A1.5 1.5 0 0 0 1.12 2.59 19.5 19.5 0 0 0 21.41 22.88 1.5 1.5 0 0 0 23 21.37v-3.43a2.25 2.25 0 0 0-1.44-2.14z"/></svg>',
  email: '<svg viewBox="0 0 24 24" fill="#F87171"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>',
  messenger: '<svg viewBox="0 0 24 24" fill="#00B2FF"><path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.505 5.503 3.844 7.218V22l3.504-1.926c.846.234 1.737.36 2.652.36 5.522 0 10-4.145 10-9.258S17.522 2 12 2zm1.18 12.046l-2.548-2.723-4.966 2.723 5.45-5.786 2.6 2.723 4.908-2.723-5.444 5.786z"/></svg>',
  location: '<svg viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>',
};

export default function WidgetEditor() {
  const { isNew, widget, currentPlan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();
  const navigation = useNavigation();
  const shopify = useAppBridge();
  
  const [name, setName] = useState(widget.name);
  const [type, setType] = useState(widget.type);
  const [design, setDesign] = useState(widget.design);
  const [settings, setSettings] = useState(() => JSON.parse(widget.settings));
  
  const [selectedTab, setSelectedTab] = useState(0);

  const getPlanLevel = (plan: string) => {
    switch (plan) {
      case "Premium Plan": return 3;
      case "Pro Plan": return 2;
      case "Starter Plan": return 1;
      default: return 0;
    }
  };

  const currentLevel = getPlanLevel(currentPlan);

  const designOptions = ALL_DESIGNS.map(d => ({
    label: d.name + (getPlanLevel(d.plan) > currentLevel ? ` (Locked - ${d.plan.replace(' Plan','')})` : ''),
    value: d.name,
    disabled: getPlanLevel(d.plan) > currentLevel
  }));
  
  const handleTabChange = useCallback(
    (selectedTabIndex: number) => setSelectedTab(selectedTabIndex),
    [],
  );

  const handleSave = () => {
    submit(
      {
        _action: "save",
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

  const handleDelete = () => {
    submit(
      { _action: "delete" },
      { method: "post" }
    );
  };

  const tabs = [
    { id: 'basic', content: 'Basic', panelID: 'basic-content' },
    { id: 'settings', content: type === 'Contact Widget' ? 'Contact Details' : 'Social Media Links', panelID: 'settings-content' },
    { id: 'appearance', content: 'Appearance', panelID: 'appearance-content' },
    { id: 'position', content: 'Position & Behavior', panelID: 'position-content' },
    { id: 'implementation', content: 'Integration', panelID: 'implementation-content' }
  ];

  const renderSocialIcon = (key: string) => {
    if (ICON_MAP[key]) {
      return (
        <div 
          style={{ width: '32px', height: '32px' }} 
          dangerouslySetInnerHTML={{ __html: ICON_MAP[key] }} 
        />
      );
    }
    return <div style={{width: 32, height: 32, borderRadius: '50%', background: '#ccc'}}></div>;
  };

  const updateSocialLink = (platform: string, value: string) => {
    setSettings({
      ...settings,
      socialLinks: {
        ...settings.socialLinks,
        [platform]: value
      }
    });
  };

  const updateContactLink = (method: string, value: string) => {
    setSettings({
      ...settings,
      contactLinks: {
        ...settings.contactLinks,
        [method]: value
      }
    });
  };

  const activeLinks = type === 'Contact Widget' 
    ? Object.entries(settings.contactLinks || {}).filter(([_, val]) => val)
    : Object.entries(settings.socialLinks || {}).filter(([_, val]) => val);

  const getPositionStyles = () => {
    // If it's sticky bottom, override inset
    if (design === 'Bottom Sticky Social Bar') return { insetBlockEnd: '0', insetInlineStart: '0', width: '100%' };

    switch(settings.position) {
      case 'Bottom Left': return { insetBlockEnd: '400', insetInlineStart: '400' };
      case 'Top Right': return { insetBlockStart: '400', insetInlineEnd: '400' };
      case 'Left Center': return { top: '50%', insetInlineStart: '400', transform: 'translateY(-50%)' };
      case 'Bottom Right':
      default:
        return { insetBlockEnd: '400', insetInlineEnd: '400' };
    }
  };

  const getDesignStyles = (): React.CSSProperties => {
    let baseStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: settings.position === 'Left Center' ? 'row' : 'column',
      gap: settings.spacing === 'Compact' ? '8px' : settings.spacing === 'Spacious' ? '16px' : '12px',
      background: '#fff',
      padding: '12px',
      borderRadius: '24px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      justifyContent: 'center',
      alignItems: 'center',
    };

    if (design === 'Minimal Social Bar') {
      baseStyles.flexDirection = 'row';
      baseStyles.borderRadius = '8px';
      baseStyles.padding = '8px';
    } else if (design === 'Modern Floating Icons') {
      baseStyles.borderRadius = '16px';
    } else if (design === 'Rounded Social Bar') {
      baseStyles.flexDirection = 'row';
      baseStyles.borderRadius = '40px';
    } else if (design === 'Glass Social Bar' || design.includes('Glass')) {
      baseStyles.flexDirection = 'row';
      baseStyles.background = 'rgba(255,255,255,0.7)';
      baseStyles.backdropFilter = 'blur(10px)';
    } else if (design === 'Dark Floating Bar') {
      baseStyles.background = '#1a1a1a';
      // Icons might be dark natively but we don't change SVGs easily without filter, so keep it simple
    } else if (design === 'Vertical Side Icons') {
      baseStyles.flexDirection = 'column';
      baseStyles.borderRadius = '0 12px 12px 0';
    } else if (design === 'Bottom Sticky Social Bar') {
      baseStyles.flexDirection = 'row';
      baseStyles.width = '100%';
      baseStyles.borderRadius = '0';
    } else if (design === 'Gradient Social Bar') {
      baseStyles.flexDirection = 'row';
      baseStyles.background = 'linear-gradient(90deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)';
    } else if (design === 'Pill Social Bar') {
      baseStyles.flexDirection = 'row';
      baseStyles.borderRadius = '50px';
    } else if (design === 'Compact Social Icons') {
      baseStyles.padding = '6px';
      baseStyles.gap = '6px';
    } else if (design === 'Large Floating Icons') {
      baseStyles.padding = '16px';
      baseStyles.gap = '16px';
    } else if (design === 'Premium Glass Widget') {
      baseStyles.background = 'rgba(0,0,0,0.6)';
      baseStyles.backdropFilter = 'blur(16px)';
      baseStyles.border = '1px solid rgba(255,255,255,0.2)';
    }

    return baseStyles;
  };

  return (
    <Page backAction={{ content: 'Widgets', onAction: () => navigate('/app/widgets') }}>
      {/* TitleBar is the ONLY place we put the save button */}
      <TitleBar title={isNew ? "Create Widget" : "Edit Widget"}>
        <button variant="primary" onClick={handleSave}>Save</button>
        {!isNew && (
          <button tone="critical" onClick={handleDelete}>Delete Widget</button>
        )}
      </TitleBar>

      <Layout>
        {/* LEFT COLUMN: Settings */}
        <Layout.Section>
          <BlockStack gap="400">
            <Card roundedAbove="sm">
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingMd">Widget Information</Text>
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span" variant="bodySm" color="subdued">ID: {widget.widgetId}</Text>
                    <Button size="micro" onClick={() => {
                        navigator.clipboard.writeText(widget.widgetId);
                        shopify.toast.show("Widget ID copied!");
                    }}>Copy</Button>
                  </InlineStack>
                </InlineStack>
                
                <TextField
                  label="Widget Name"
                  value={name}
                  onChange={setName}
                  autoComplete="off"
                  placeholder="e.g. My Awesome Widget"
                />

                <Select
                  label="Widget Type"
                  options={[
                    'Social Media', 
                    'Sticky Social Bar', 
                    'Floating Social Icons', 
                    'Contact Widget', 
                    'Floating Action Widget'
                  ]}
                  value={type}
                  onChange={setType}
                />
              </BlockStack>
            </Card>

            <Card padding="0">
              <Tabs tabs={tabs} selected={selectedTab} onSelect={handleTabChange} fitted>
                <Box padding="400">
                  {selectedTab === 0 && (
                    <BlockStack gap="400">
                      <Select
                        label="Design Template"
                        options={designOptions as any}
                        value={design}
                        onChange={setDesign}
                      />
                       <Text as="p" variant="bodyMd" color="subdued">Choose a base design template. You can customize the specific appearance in the Appearance tab.</Text>
                    </BlockStack>
                  )}

                  {/* Dynamic Settings Tab (Social Media or Contact) */}
                  {selectedTab === 1 && type !== 'Contact Widget' && (
                    <BlockStack gap="400">
                      <Text as="h3" variant="headingMd">Social Media Links</Text>
                      <Text as="p" variant="bodySm" color="subdued">Leave the field blank to hide the icon from the widget.</Text>
                      
                      {['facebook', 'twitter', 'instagram', 'youtube', 'tiktok', 'pinterest', 'linkedin'].map(platform => (
                        <InlineStack key={platform} gap="400" blockAlign="center">
                           <Box minWidth="32px">{renderSocialIcon(platform)}</Box>
                           <Box style={{ flexGrow: 1 }}>
                             <TextField 
                                labelHidden 
                                label={`${platform} URL`} 
                                value={settings.socialLinks?.[platform] || ""}
                                onChange={(val) => updateSocialLink(platform, val)}
                                placeholder={`https://${platform}.com/yourprofile`}
                                autoComplete="off"
                             />
                           </Box>
                        </InlineStack>
                      ))}
                    </BlockStack>
                  )}

                  {selectedTab === 1 && type === 'Contact Widget' && (
                    <BlockStack gap="400">
                      <Text as="h3" variant="headingMd">Contact Methods</Text>
                      <Text as="p" variant="bodySm" color="subdued">Provide your contact details. Leave blank to hide.</Text>
                      
                      {['whatsapp', 'phone', 'email', 'messenger', 'instagram', 'linkedin', 'location'].map(method => (
                        <InlineStack key={method} gap="400" blockAlign="center">
                           <Box minWidth="32px">{renderSocialIcon(method)}</Box>
                           <Box style={{ flexGrow: 1 }}>
                             <TextField 
                                labelHidden 
                                label={`${method} value`} 
                                value={settings.contactLinks?.[method] || ""}
                                onChange={(val) => updateContactLink(method, val)}
                                placeholder={method === 'email' ? 'contact@store.com' : method === 'phone' ? '+1234567890' : 'Enter details...'}
                                autoComplete="off"
                             />
                           </Box>
                        </InlineStack>
                      ))}
                    </BlockStack>
                  )}

                  {selectedTab === 2 && (
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
                  {selectedTab === 3 && (
                    <BlockStack gap="400">
                      <Select label="Desktop Position" options={['Bottom Right', 'Bottom Left', 'Top Right', 'Left Center']} value={settings.position} onChange={(val) => setSettings({...settings, position: val})} />
                    </BlockStack>
                  )}
                  {selectedTab === 4 && (
                    <BlockStack gap="400">
                      <Text as="h2" variant="headingMd">Integration Options</Text>
                      <Card background="bg-surface-secondary">
                        <BlockStack gap="200">
                          <Text as="h3" variant="headingSm">Automated Theme App Embed</Text>
                          <Text as="p" variant="bodyMd">This widget is securely embedded into your active theme automatically. You do not need to edit any theme files or click any "Open Theme Editor" buttons to make it work. Just make sure the widget is saved and set to "Active".</Text>
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
                <Box minHeight="300px" background="bg-surface-secondary" borderRadius="200" padding="0" position="relative" overflow="hidden">
                   
                   {/* Realistic Preview */}
                   <Box position="absolute" {...getPositionStyles()}>
                      <div style={getDesignStyles()}>
                        {activeLinks.length > 0 ? (
                          activeLinks.map(([key, value]) => {
                            // Ensure the link has http:// or https:// or mailto: / tel:
                            let href = value;
                            if (key === 'email' && !href.startsWith('mailto:')) href = `mailto:${href}`;
                            else if (key === 'phone' && !href.startsWith('tel:')) href = `tel:${href}`;
                            else if (key === 'whatsapp' && !href.startsWith('https://')) href = `https://wa.me/${href.replace(/[^0-9]/g, '')}`;
                            else if (!href.startsWith('http') && key !== 'email' && key !== 'phone' && key !== 'whatsapp') href = `https://${href}`;
                            
                            return (
                              <a 
                                key={key} 
                                href={href || "#"}
                                target="_blank"
                                rel="noreferrer"
                                style={{ transition: 'transform 0.2s', cursor: 'pointer', display: 'block' }} 
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} 
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                              >
                                {renderSocialIcon(key)}
                              </a>
                            );
                          })
                        ) : (
                          <Text as="p" variant="bodySm" color="subdued">Fill out links to preview.</Text>
                        )}
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
