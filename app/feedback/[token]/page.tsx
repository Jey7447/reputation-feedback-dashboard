import { CustomerFeedbackForm } from "@/components/feedback/customer-feedback-form";

export default async function CustomerFeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <CustomerFeedbackForm token={token} />;
}
