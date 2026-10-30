import { RestaurantView } from "./restaurant-view";

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <RestaurantView restaurantId={id} />;
}
