import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  Card,
  IndexTable,
  useIndexResourceState,
  Text,
  Badge,
  Button,
  EmptyState,
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

export default function Widgets() {
  const { widgets } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

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

  const rowMarkup = widgets.map(
    ({ id, widgetId, name, type, design, status, createdAt, updatedAt }, index) => (
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
          <Button size="micro" onClick={() => navigate(`/app/widgets/${id}`)}>Edit</Button>
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
