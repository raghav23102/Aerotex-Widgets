import { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useSubmit } from "@remix-run/react";
import {
  Page,
  Card,
  IndexTable,
  useIndexResourceState,
  Text,
  Badge,
  Button,
  EmptyState,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  
  const widgets = await prisma.widget.findMany({
    where: { shop: session.shop },
    orderBy: { createdAt: "desc" },
  });

  return { widgets };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const _action = formData.get("_action") as string;
  const id = formData.get("id") as string;

  if (_action === "delete" && id) {
    await prisma.widget.delete({
      where: { id, shop: session.shop },
    });
  }
  return null;
};

export default function Widgets() {
  const { widgets } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const submit = useSubmit();

  const resourceName = {
    singular: "widget",
    plural: "widgets",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(widgets as any);

  const emptyStateMarkup = (
    <EmptyState
      heading="No widgets yet"
      action={{
        content: "Create Widget",
        onAction: () => navigate("/app/widgets/new"),
      }}
      image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
    >
      <p>Create your first Aerotex Widget and add it to your Shopify store.</p>
    </EmptyState>
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this widget?")) {
      submit({ _action: "delete", id }, { method: "post" });
    }
  };

  const rowMarkup = widgets.map(
    ({ id, widgetId, name, type, design, status }, index) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
        onClick={() => navigate(`/app/widgets/${id}`)}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {name}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <Text variant="bodySm" as="span" color="subdued">
            {widgetId}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{type}</IndexTable.Cell>
        <IndexTable.Cell>{design}</IndexTable.Cell>
        <IndexTable.Cell>
          <Badge tone={status === "Active" ? "success" : "new"}>{status}</Badge>
        </IndexTable.Cell>
        <IndexTable.Cell>
          <InlineStack gap="200" wrap={false}>
             <Button size="micro" onClick={(e) => { e.stopPropagation(); navigate(`/app/widgets/${id}`); }}>Edit</Button>
             <Button size="micro" tone="critical" onClick={(e) => handleDelete(id, e)}>Delete</Button>
          </InlineStack>
        </IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Page>
      <TitleBar title="Widgets">
        <button variant="primary" onClick={() => navigate("/app/widgets/new")}>
          Create Widget
        </button>
      </TitleBar>
      <Card padding="0">
        {widgets.length === 0 ? (
          emptyStateMarkup
        ) : (
          <IndexTable
            resourceName={resourceName}
            itemCount={widgets.length}
            selectedItemsCount={
              allResourcesSelected ? "All" : selectedResources.length
            }
            onSelectionChange={handleSelectionChange}
            headings={[
              { title: "Widget Name" },
              { title: "Widget ID" },
              { title: "Widget Type" },
              { title: "Design" },
              { title: "Status" },
              { title: "Action" },
            ]}
          >
            {rowMarkup}
          </IndexTable>
        )}
      </Card>
    </Page>
  );
}
