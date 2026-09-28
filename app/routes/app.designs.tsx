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

// ─── Inline SVG Icons used in previews ────────────────────────────────────────
const PREVIEW_ICONS = [
  { color: "#1877F2", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
  { color: "#25D366", path: "M12.031 0C5.397 0 0 5.398 0 12.035c0 2.12.552 4.186 1.597 6.002L.15 23.85l5.962-1.563A11.968 11.968 0 0012.031 24c6.634 0 12.036-5.399 12.036-12.035S18.666 0 12.031 0z" },
  { color: "#F87171", path: "M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" },
];

function PreviewIcon({ color, path, size = 20 }: { color: string; path: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ display: "block", flexShrink: 0 }}>
      <path d={path} />
    </svg>
  );
}

// ─── Design visual preview renderers ──────────────────────────────────────────
function DesignPreview({ name, locked }: { name: string; locked: boolean }) {
  const opacity = locked ? 0.45 : 1;

  const iconSize = 20;
  const icons = PREVIEW_ICONS;

  const baseIconGroup = (direction: "row" | "column", gap: number, iconSize: number, style: React.CSSProperties = {}) => (
    <div style={{ display: "flex", flexDirection: direction, gap, alignItems: "center", justifyContent: "center", ...style }}>
      {icons.map((icon, i) => (
        <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />
      ))}
    </div>
  );

  const previewMap: Record<string, React.ReactNode> = {
    "Minimal Social Bar": (
      <div style={{ display: "flex", flexDirection: "row", gap: 8, background: "#fff", padding: "8px 12px", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.12)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Modern Floating Icons": (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#fff", padding: 12, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Rounded Social Bar": (
      <div style={{ display: "flex", flexDirection: "row", gap: 10, background: "#fff", padding: "10px 16px", borderRadius: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Glass Social Bar": (
      <div style={{ display: "flex", flexDirection: "row", gap: 10, background: "rgba(255,255,255,0.55)", backdropFilter: "blur(8px)", padding: "10px 16px", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.7)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Dark Floating Bar": (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "#1a1a1a", padding: 12, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.5)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Vertical Side Icons": (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#fff", padding: "12px 10px", borderRadius: "0 12px 12px 0", boxShadow: "2px 2px 8px rgba(0,0,0,0.12)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Bottom Sticky Social Bar": (
      <div style={{ display: "flex", flexDirection: "row", gap: 14, background: "#fff", padding: "8px 20px", borderRadius: 0, boxShadow: "0 -2px 8px rgba(0,0,0,0.1)", width: "100%", justifyContent: "center" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Gradient Social Bar": (
      <div style={{ display: "flex", flexDirection: "row", gap: 10, background: "linear-gradient(90deg, #ff9a9e, #fecfef)", padding: "10px 16px", borderRadius: 12, boxShadow: "0 2px 8px rgba(255,154,158,0.4)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color="#fff" path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Compact Social Icons": (
      <div style={{ display: "flex", flexDirection: "row", gap: 6, background: "#fff", padding: "6px 8px", borderRadius: 8, boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={16} />)}
      </div>
    ),
    "Large Floating Icons": (
      <div style={{ display: "flex", flexDirection: "column", gap: 14, background: "#fff", padding: 16, borderRadius: 20, boxShadow: "0 6px 20px rgba(0,0,0,0.15)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={28} />)}
      </div>
    ),
    "Pill Social Bar": (
      <div style={{ display: "flex", flexDirection: "row", gap: 10, background: "#fff", padding: "10px 20px", borderRadius: 50, boxShadow: "0 3px 10px rgba(0,0,0,0.12)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={iconSize} />)}
      </div>
    ),
    "Elegant Outline Icons": (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, background: "#fff", padding: 12, borderRadius: 16, border: "1.5px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.06)" }}>
        {icons.map((icon, i) => (
          <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", border: `1.5px solid ${icon.color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <PreviewIcon color={icon.color} path={icon.path} size={13} />
          </div>
        ))}
      </div>
    ),
    "Social + Contact Widget": (
      <div style={{ display: "flex", flexDirection: "column", gap: 6, background: "#fff", padding: 12, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.12)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color={icon.color} path={icon.path} size={18} />)}
        <div style={{ borderTop: "1px solid #eee", marginTop: 4, paddingTop: 6, display: "flex", gap: 6 }}>
          <PreviewIcon color="#34D399" path="M22.56 16.3l-3.3-1.65a2.23 2.23 0 0 0-2.58.46l-1.56 1.56a15.82 15.82 0 0 1-7.23-7.23l1.56-1.56a2.23 2.23 0 0 0 .46-2.58l-1.65-3.3A2.25 2.25 0 0 0 6.06 1H2.63A1.5 1.5 0 0 0 1.12 2.59 19.5 19.5 0 0 0 21.41 22.88 1.5 1.5 0 0 0 23 21.37v-3.43a2.25 2.25 0 0 0-1.44-2.14z" size={18} />
        </div>
      </div>
    ),
    "Modern Contact Bubble": (
      <div style={{ position: "relative", width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 6px 20px rgba(102,126,234,0.5)" }}>
        <PreviewIcon color="#fff" path="M22.56 16.3l-3.3-1.65a2.23 2.23 0 0 0-2.58.46l-1.56 1.56a15.82 15.82 0 0 1-7.23-7.23l1.56-1.56a2.23 2.23 0 0 0 .46-2.58l-1.65-3.3A2.25 2.25 0 0 0 6.06 1H2.63A1.5 1.5 0 0 0 1.12 2.59 19.5 19.5 0 0 0 21.41 22.88 1.5 1.5 0 0 0 23 21.37v-3.43a2.25 2.25 0 0 0-1.44-2.14z" size={26} />
      </div>
    ),
    "Multi-Action Floating Widget": (
      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "center" }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(245,87,108,0.5)" }}>
          <span style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}>+</span>
        </div>
        <div style={{ display: "flex", flexDirection: "row", gap: 6 }}>
          {icons.slice(0, 2).map((icon, i) => (
            <div key={i} style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              <PreviewIcon color={icon.color} path={icon.path} size={16} />
            </div>
          ))}
        </div>
      </div>
    ),
    "Premium Glass Widget": (
      <div style={{ display: "flex", flexDirection: "column", gap: 10, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(16px)", padding: 14, borderRadius: 20, border: "1px solid rgba(255,255,255,0.2)", boxShadow: "0 8px 32px rgba(0,0,0,0.4)" }}>
        {icons.map((icon, i) => <PreviewIcon key={i} color="#fff" path={icon.path} size={20} />)}
      </div>
    ),
  };

  const preview = previewMap[name] ?? (
    <div style={{ color: "#999", fontSize: 12 }}>Preview</div>
  );

  // Background pattern based on design theme
  const bgColor = 
    name.includes("Dark") || name.includes("Premium Glass") ? "#1a1a2e" :
    name.includes("Gradient") ? "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" :
    name.includes("Glass") ? "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)" :
    name.includes("Contact") || name.includes("Multi") ? "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)" :
    name.includes("Sticky") ? "#f0f4ff" :
    "#f9fafb";

  return (
    <div style={{
      minHeight: 160,
      background: bgColor,
      display: "flex",
      alignItems: "center",
      justifyContent: name === "Bottom Sticky Social Bar" ? "flex-start" : "center",
      flexDirection: "column",
      padding: name === "Bottom Sticky Social Bar" ? "0 0 0 0" : 20,
      opacity,
      position: "relative",
      borderRadius: "var(--p-border-radius-200) var(--p-border-radius-200) 0 0",
      overflow: "hidden",
    }}>
      {name === "Bottom Sticky Social Bar" ? (
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>{preview}</div>
      ) : (
        preview
      )}
    </div>
  );
}

// ─── Loader ───────────────────────────────────────────────────────────────────
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

  const designs = [
    { id: 1,  name: "Minimal Social Bar",           plan: "Free",         tag: "Horizontal flat bar" },
    { id: 2,  name: "Modern Floating Icons",         plan: "Free",         tag: "Vertical floating card" },
    { id: 3,  name: "Rounded Social Bar",            plan: "Starter Plan", tag: "Horizontal pill shape" },
    { id: 4,  name: "Glass Social Bar",              plan: "Starter Plan", tag: "Frosted glass effect" },
    { id: 5,  name: "Dark Floating Bar",             plan: "Starter Plan", tag: "Dark theme vertical" },
    { id: 6,  name: "Vertical Side Icons",           plan: "Starter Plan", tag: "Side-anchored column" },
    { id: 7,  name: "Bottom Sticky Social Bar",      plan: "Pro Plan",     tag: "Full-width bottom bar" },
    { id: 8,  name: "Gradient Social Bar",           plan: "Pro Plan",     tag: "Colorful gradient bar" },
    { id: 9,  name: "Compact Social Icons",          plan: "Pro Plan",     tag: "Tiny minimal icons" },
    { id: 10, name: "Large Floating Icons",          plan: "Pro Plan",     tag: "Big floating card" },
    { id: 11, name: "Pill Social Bar",               plan: "Pro Plan",     tag: "Horizontal pill bar" },
    { id: 12, name: "Elegant Outline Icons",         plan: "Premium Plan", tag: "Circle outline icons" },
    { id: 13, name: "Social + Contact Widget",       plan: "Premium Plan", tag: "Social & contact merged" },
    { id: 14, name: "Modern Contact Bubble",         plan: "Premium Plan", tag: "Floating contact button" },
    { id: 15, name: "Multi-Action Floating Widget",  plan: "Premium Plan", tag: "Expandable action menu" },
    { id: 16, name: "Premium Glass Widget",          plan: "Premium Plan", tag: "Dark glass premium" },
  ].map(d => ({ ...d, locked: getPlanLevel(d.plan) > currentLevel }));

  return { designs, currentPlan };
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Designs() {
  const { designs, currentPlan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const PLAN_COLORS: Record<string, string> = {
    "Free": "#6d7280",
    "Starter Plan": "#0ea5e9",
    "Pro Plan": "#8b5cf6",
    "Premium Plan": "#f59e0b",
  };

  return (
    <Page>
      <TitleBar title="Design Library" />
      <Layout>
        <Layout.Section>
          <BlockStack gap="500">
            <Card roundedAbove="sm">
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack gap="100">
                  <Text as="h2" variant="headingMd">Choose Your Widget Design</Text>
                  <Text as="p" variant="bodyMd" color="subdued">
                    Pick a beautifully crafted layout. Your current plan: <strong>{currentPlan}</strong>
                  </Text>
                </BlockStack>
                <Button variant="primary" onClick={() => navigate("/app/billing")}>Upgrade Plan</Button>
              </InlineStack>
            </Card>

            <Grid>
              {designs.map((design) => (
                <Grid.Cell key={design.id} columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                  <Card padding="0">
                    {/* Visual Preview Area */}
                    <div style={{ position: "relative" }}>
                      <DesignPreview name={design.name} locked={design.locked} />
                      {/* Plan badge overlay */}
                      <div style={{ position: "absolute", top: 10, right: 10 }}>
                        {design.locked ? (
                          <span style={{
                            background: PLAN_COLORS[design.plan] ?? "#888",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 20,
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                          }}>
                            🔒 {design.plan.replace(" Plan", "")}
                          </span>
                        ) : (
                          <span style={{
                            background: "#10b981",
                            color: "#fff",
                            fontSize: 11,
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: 20,
                          }}>
                            ✓ Unlocked
                          </span>
                        )}
                      </div>
                    </div>

                    <Divider />

                    <Box padding="300">
                      <BlockStack gap="200">
                        <BlockStack gap="050">
                          <Text as="h3" variant="headingSm">{design.name}</Text>
                          <Text as="p" variant="bodySm" color="subdued">{design.tag}</Text>
                        </BlockStack>
                        {design.locked ? (
                          <Button
                            fullWidth
                            tone="success"
                            onClick={() => navigate("/app/billing")}
                          >
                            🔓 Upgrade to Unlock
                          </Button>
                        ) : (
                          <Button
                            fullWidth
                            variant="primary"
                            onClick={() => navigate("/app/widgets/new")}
                          >
                            Use This Design
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
