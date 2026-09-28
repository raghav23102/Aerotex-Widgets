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
  Grid,
  Box,
  Divider,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session, billing } = await authenticate.admin(request);

  const totalWidgets = await prisma.widget.count({ where: { shop: session.shop } });
  const publishedWidgets = await prisma.widget.count({ where: { shop: session.shop, status: "Published" } });
  const draftWidgets = await prisma.widget.count({ where: { shop: session.shop, status: "Draft" } });

  let currentPlan = "Free";
  try {
    const billingCheck = await billing.check({
      plans: ["Starter Plan", "Pro Plan", "Premium Plan"],
      isTest: true,
    });
    if (billingCheck?.hasActivePayment && billingCheck?.appSubscriptions?.length > 0) {
      currentPlan = billingCheck.appSubscriptions[0]?.name ?? "Free";
    }
  } catch (e) {
    // Billing check failed gracefully — default to Free
    currentPlan = "Free";
  }

  return { stats: { totalWidgets, publishedWidgets, draftWidgets }, currentPlan };
};

// ─── Inline icon SVGs ──────────────────────────────────────────────────────────
const FB = "#1877F2"; const WA = "#25D366"; const IG_START = "#fd5949";

function SvgRow({ colors, size = 18 }: { colors: string[]; size?: number }) {
  const circlePaths = [
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
    "M12.031 0C5.397 0 0 5.398 0 12.035c0 2.12.552 4.186 1.597 6.002L.15 23.85l5.962-1.563A11.968 11.968 0 0012.031 24c6.634 0 12.036-5.399 12.036-12.035S18.666 0 12.031 0z",
    "M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z",
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  ];
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {colors.map((c, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill={c}>
          <path d={circlePaths[i % circlePaths.length]} />
        </svg>
      ))}
    </div>
  );
}

// ─── Popular Design Preview Cards ─────────────────────────────────────────────
const POPULAR_DESIGNS = [
  {
    name: "Modern Floating Icons",
    tag: "Most Popular",
    tagColor: "#10b981",
    plan: "Free",
    locked: false,
    description: "Clean vertical card that floats on any page corner.",
    previewBg: "#f0fdf4",
    previewStyle: { flexDirection: "column" as const, bg: "#fff", radius: 16, padding: 12, shadow: "0 4px 16px rgba(0,0,0,0.12)" },
    colors: [FB, WA, IG_START, "#FF0000"],
  },
  {
    name: "Glass Social Bar",
    tag: "Trending",
    tagColor: "#6366f1",
    plan: "Starter",
    locked: true,
    description: "Frosted glass effect that looks premium on any background.",
    previewBg: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    previewStyle: { flexDirection: "row" as const, bg: "rgba(255,255,255,0.55)", radius: 12, padding: "10px 16px", shadow: "0 4px 16px rgba(0,0,0,0.1)" },
    colors: [FB, WA, IG_START],
  },
  {
    name: "Bottom Sticky Social Bar",
    tag: "Best CTR",
    tagColor: "#f59e0b",
    plan: "Pro",
    locked: true,
    description: "Full-width bar pinned to bottom — maximum visibility.",
    previewBg: "#fff7ed",
    previewStyle: { flexDirection: "row" as const, bg: "#fff", radius: 0, padding: "10px 24px", shadow: "0 -2px 12px rgba(0,0,0,0.12)" },
    colors: [FB, WA, IG_START, "#FF0000"],
  },
  {
    name: "Premium Glass Widget",
    tag: "Premium",
    tagColor: "#8b5cf6",
    plan: "Premium",
    locked: true,
    description: "Dark glass widget — ultra-premium feel for luxury brands.",
    previewBg: "#1a1a2e",
    previewStyle: { flexDirection: "column" as const, bg: "rgba(255,255,255,0.12)", radius: 20, padding: 14, shadow: "0 8px 32px rgba(0,0,0,0.5)" },
    colors: ["#fff", "#ccc", "#aaa"],
  },
];

const PLAN_UPGRADE_CARDS = [
  {
    name: "Starter Plan",
    price: "$9/mo",
    color: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
    features: ["6 premium designs", "Unlimited widgets", "Glass & rounded bars", "Priority support"],
    cta: "Upgrade to Starter",
  },
  {
    name: "Pro Plan",
    price: "$19/mo",
    color: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
    features: ["11 designs unlocked", "Sticky bottom bar", "Gradient & pill bars", "Analytics dashboard"],
    cta: "Go Pro",
    popular: true,
  },
  {
    name: "Premium Plan",
    price: "$39/mo",
    color: "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
    features: ["All 16 designs", "Contact widgets", "Multi-action widgets", "White-label option"],
    cta: "Get Premium",
  },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, gradientStart, gradientEnd }: {
  label: string; value: number | string; icon: string; gradientStart: string; gradientEnd: string;
}) {
  return (
    <div style={{
      background: `linear-gradient(135deg, ${gradientStart} 0%, ${gradientEnd} 100%)`,
      borderRadius: 16,
      padding: "24px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      position: "relative",
      overflow: "hidden",
      boxShadow: `0 4px 20px ${gradientStart}40`,
    }}>
      <div style={{
        position: "absolute", right: -10, top: -10,
        width: 80, height: 80, borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
      }} />
      <div style={{ fontSize: 28 }}>{icon}</div>
      <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 500, fontFamily: "sans-serif" }}>{label}</div>
      <div style={{ color: "#fff", fontSize: 36, fontWeight: 800, lineHeight: 1, fontFamily: "sans-serif" }}>{value}</div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { stats, currentPlan } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const planGradient: Record<string, string> = {
    "Free": "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
    "Starter Plan": "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
    "Pro Plan": "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
    "Premium Plan": "linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)",
  };

  return (
    <Page>
      <TitleBar title="Dashboard">
        <button variant="primary" onClick={() => navigate("/app/widgets/new")}>
          + Create Widget
        </button>
      </TitleBar>

      <BlockStack gap="600">

        {/* ── Hero Welcome Banner ── */}
        <div style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          borderRadius: 20,
          padding: "32px 36px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 8px 32px rgba(67,56,202,0.4)",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* decorative circles */}
          <div style={{ position: "absolute", right: 80, top: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
          <div style={{ position: "absolute", right: -20, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: "sans-serif", marginBottom: 6 }}>
              Welcome back 👋
            </div>
            <div style={{ color: "#fff", fontSize: 28, fontWeight: 800, fontFamily: "sans-serif", marginBottom: 8 }}>
              Aerotex Widgets
            </div>
            <div style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, fontFamily: "sans-serif", marginBottom: 20, maxWidth: 420 }}>
              Add beautiful social & contact widgets to your store in minutes. No coding required.
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => navigate("/app/widgets/new")}
                style={{
                  background: "#fff", color: "#4338ca", border: "none", borderRadius: 10,
                  padding: "10px 20px", fontWeight: 700, fontSize: 14, cursor: "pointer",
                  fontFamily: "sans-serif", boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                + Create Widget
              </button>
              <button
                onClick={() => navigate("/app/designs")}
                style={{
                  background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)",
                  borderRadius: 10, padding: "10px 20px", fontWeight: 600, fontSize: 14, cursor: "pointer",
                  fontFamily: "sans-serif",
                }}
              >
                Browse Designs →
              </button>
            </div>
          </div>

          {/* Right side floating widget preview */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", gap: 10, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 20, padding: 16 }}>
            <SvgRow colors={["#fff", "#fff", "#fff", "#fff"]} size={22} />
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <Grid>
          <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
            <StatCard label="Total Widgets" value={stats.totalWidgets} icon="📦" gradientStart="#6366f1" gradientEnd="#818cf8" />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
            <StatCard label="Published Live" value={stats.publishedWidgets} icon="🟢" gradientStart="#10b981" gradientEnd="#34d399" />
          </Grid.Cell>
          <Grid.Cell columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
            <StatCard label="Draft Widgets" value={stats.draftWidgets} icon="✏️" gradientStart="#f59e0b" gradientEnd="#fbbf24" />
          </Grid.Cell>
        </Grid>

        {/* ── Current Plan Banner ── */}
        <div style={{
          background: planGradient[currentPlan] || planGradient["Free"],
          borderRadius: 16,
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "sans-serif" }}>Current Plan</div>
            <div style={{ color: "#fff", fontSize: 22, fontWeight: 800, fontFamily: "sans-serif" }}>{currentPlan}</div>
          </div>
          {currentPlan === "Free" || currentPlan !== "Premium Plan" ? (
            <button
              onClick={() => navigate("/app/billing")}
              style={{
                background: "rgba(255,255,255,0.25)", color: "#fff",
                border: "1.5px solid rgba(255,255,255,0.5)", borderRadius: 10,
                padding: "10px 20px", fontWeight: 700, fontSize: 14,
                cursor: "pointer", fontFamily: "sans-serif",
              }}
            >
              ⚡ Upgrade Now
            </button>
          ) : (
            <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "sans-serif" }}>✅ You have the best plan!</div>
          )}
        </div>

        {/* ── Popular Design Cards ── */}
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text as="h2" variant="headingLg">🔥 Popular Designs</Text>
              <Text as="p" variant="bodyMd" color="subdued">Most loved by Shopify merchants — tap to start using them.</Text>
            </BlockStack>
            <Button onClick={() => navigate("/app/designs")}>View All Designs →</Button>
          </InlineStack>

          <Grid>
            {POPULAR_DESIGNS.map((d, i) => (
              <Grid.Cell key={i} columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <div style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: 16,
                  overflow: "hidden",
                  background: "#fff",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  transition: "box-shadow 0.2s",
                }}>
                  {/* Preview area */}
                  <div style={{
                    minHeight: 140,
                    background: d.previewBg,
                    display: "flex",
                    alignItems: d.name === "Bottom Sticky Social Bar" ? "flex-end" : "center",
                    justifyContent: "center",
                    position: "relative",
                    padding: 16,
                  }}>
                    {/* Tag badge */}
                    <div style={{
                      position: "absolute", top: 10, left: 10,
                      background: d.tagColor, color: "#fff",
                      fontSize: 11, fontWeight: 700, padding: "3px 10px",
                      borderRadius: 20, fontFamily: "sans-serif",
                    }}>{d.tag}</div>

                    {/* Lock overlay */}
                    {d.locked && (
                      <div style={{
                        position: "absolute", inset: 0,
                        background: "rgba(0,0,0,0.15)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: 0,
                      }}>
                        <div style={{ fontSize: 28 }}>🔒</div>
                      </div>
                    )}

                    {/* Widget preview */}
                    <div style={{
                      ...d.name === "Bottom Sticky Social Bar" ? { width: "100%", justifyContent: "center" } : {},
                      display: "flex",
                      flexDirection: d.previewStyle.flexDirection,
                      gap: 8,
                      background: d.previewStyle.bg,
                      padding: d.previewStyle.padding as any,
                      borderRadius: d.previewStyle.radius,
                      boxShadow: d.previewStyle.shadow,
                      alignItems: "center",
                      opacity: d.locked ? 0.5 : 1,
                    }}>
                      <SvgRow colors={d.colors} size={20} />
                    </div>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "16px 16px 14px" }}>
                    <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "sans-serif", marginBottom: 4 }}>{d.name}</div>
                    <div style={{ color: "#6b7280", fontSize: 12, fontFamily: "sans-serif", marginBottom: 12 }}>{d.description}</div>
                    {d.locked ? (
                      <button
                        onClick={() => navigate("/app/billing")}
                        style={{
                          width: "100%", background: "linear-gradient(135deg, #f59e0b, #d97706)",
                          color: "#fff", border: "none", borderRadius: 10,
                          padding: "9px 0", fontWeight: 700, fontSize: 13,
                          cursor: "pointer", fontFamily: "sans-serif",
                        }}
                      >
                        🔓 Unlock ({d.plan})
                      </button>
                    ) : (
                      <button
                        onClick={() => navigate("/app/widgets/new")}
                        style={{
                          width: "100%", background: "linear-gradient(135deg, #4338ca, #6366f1)",
                          color: "#fff", border: "none", borderRadius: 10,
                          padding: "9px 0", fontWeight: 700, fontSize: 13,
                          cursor: "pointer", fontFamily: "sans-serif",
                        }}
                      >
                        ✨ Use This Design
                      </button>
                    )}
                  </div>
                </div>
              </Grid.Cell>
            ))}
          </Grid>
        </BlockStack>

        {/* ── Upgrade Plan Cards ── */}
        <BlockStack gap="400">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text as="h2" variant="headingLg">⚡ Upgrade Your Plan</Text>
              <Text as="p" variant="bodyMd" color="subdued">Unlock more designs, features & priority support.</Text>
            </BlockStack>
          </InlineStack>

          <Grid>
            {PLAN_UPGRADE_CARDS.map((plan, i) => (
              <Grid.Cell key={i} columnSpan={{ xs: 6, sm: 2, md: 2, lg: 4, xl: 4 }}>
                <div style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "#fff",
                  border: plan.popular ? "2px solid #8b5cf6" : "1px solid #e5e7eb",
                  boxShadow: plan.popular ? "0 8px 32px rgba(139,92,246,0.2)" : "0 2px 12px rgba(0,0,0,0.06)",
                  position: "relative",
                }}>
                  {plan.popular && (
                    <div style={{
                      position: "absolute", top: 14, right: 14,
                      background: "#8b5cf6", color: "#fff",
                      fontSize: 11, fontWeight: 700, padding: "3px 10px",
                      borderRadius: 20, fontFamily: "sans-serif",
                    }}>Most Popular</div>
                  )}

                  {/* Gradient Header */}
                  <div style={{ background: plan.color, padding: "24px 20px 20px" }}>
                    <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "sans-serif" }}>{plan.name}</div>
                    <div style={{ color: "#fff", fontSize: 30, fontWeight: 900, fontFamily: "sans-serif", lineHeight: 1.1 }}>
                      {plan.price}
                    </div>
                  </div>

                  {/* Features */}
                  <div style={{ padding: "16px 20px 20px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                      {plan.features.map((f, j) => (
                        <div key={j} style={{ display: "flex", gap: 8, alignItems: "center", fontFamily: "sans-serif", fontSize: 13 }}>
                          <span style={{ color: "#10b981", fontWeight: 700 }}>✓</span>
                          <span style={{ color: "#374151" }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("/app/billing")}
                      style={{
                        width: "100%",
                        background: plan.color,
                        color: "#fff",
                        border: "none",
                        borderRadius: 10,
                        padding: "11px 0",
                        fontWeight: 700,
                        fontSize: 14,
                        cursor: "pointer",
                        fontFamily: "sans-serif",
                        boxShadow: plan.popular ? "0 4px 14px rgba(139,92,246,0.4)" : "none",
                      }}
                    >
                      {plan.cta}
                    </button>
                  </div>
                </div>
              </Grid.Cell>
            ))}
          </Grid>
        </BlockStack>

        {/* ── Quick Actions ── */}
        <Card roundedAbove="sm">
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">Quick Actions</Text>
            <Divider />
            <Grid>
              {[
                { label: "Create Widget", desc: "Add a new social widget", icon: "➕", action: "/app/widgets/new", color: "#4338ca" },
                { label: "Manage Widgets", desc: "View & edit all widgets", icon: "📋", action: "/app/widgets", color: "#10b981" },
                { label: "Design Library", desc: "Browse all 16 designs", icon: "🎨", action: "/app/designs", color: "#f59e0b" },
                { label: "Billing & Plans", desc: "Upgrade your plan", icon: "⚡", action: "/app/billing", color: "#8b5cf6" },
              ].map((a, i) => (
                <Grid.Cell key={i} columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                  <button
                    onClick={() => navigate(a.action)}
                    style={{
                      width: "100%",
                      background: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: 12,
                      padding: "16px 14px",
                      cursor: "pointer",
                      textAlign: "left",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f4ff")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "#f9fafb")}
                  >
                    <div style={{
                      width: 40, height: 40, borderRadius: 10,
                      background: `${a.color}15`, display: "flex",
                      alignItems: "center", justifyContent: "center",
                      fontSize: 20, flexShrink: 0,
                    }}>
                      {a.icon}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, fontFamily: "sans-serif", color: "#111827" }}>{a.label}</div>
                      <div style={{ fontSize: 12, fontFamily: "sans-serif", color: "#6b7280" }}>{a.desc}</div>
                    </div>
                  </button>
                </Grid.Cell>
              ))}
            </Grid>
          </BlockStack>
        </Card>

      </BlockStack>
    </Page>
  );
}
