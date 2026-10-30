import { ReviewForm } from "./review-form";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  return <ReviewForm restaurantId={restaurantId} />;
}
