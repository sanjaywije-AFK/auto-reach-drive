import LegalLayout, { Section } from "./LegalLayout";

export default function RefundPolicy() {
  return (
    <LegalLayout title="Refund & Cancellation Policy" updated="20 November 2026"
      description="How cancellations and refunds work for AutoReach vehicle pickup, drop-off and doorstep maintenance bookings in Sri Lanka.">
      <p className="text-sm text-muted-foreground">This policy explains when you can cancel an AutoReach booking and how refunds are handled for our vehicle concierge (pickup and drop-off) and doorstep minor maintenance services.</p>
      <Section title="1. Cancelling a booking">
        <ul>
          <li><strong>Before a driver is assigned or dispatched:</strong> free cancellation and a full refund of any amount paid.</li>
          <li><strong>After the driver is on the way to you:</strong> a convenience and travel fee may be charged; the rest is refunded.</li>
          <li><strong>After your vehicle has been picked up:</strong> the concierge fee is non-refundable. We will return your vehicle, and any work not yet started will not be charged.</li>
        </ul>
        <p>To cancel, contact us on WhatsApp with your booking reference.</p>
      </Section>
      <Section title="2. Service centre work">
        <p>Repairs and servicing are carried out by partner service centres. We share quotes with you before work starts. Work and parts you have approved cannot be refunded once completed or installed. If you are unhappy with the quality of work, tell us within 7 days and we will take it up with the service centre on your behalf.</p>
      </Section>
      <Section title="3. Doorstep maintenance">
        <p>If a job cannot be done because of bad weather, an unsafe or inaccessible location, or the vehicle not being available, we will reschedule at no extra cost or refund the service fee. Parts already supplied and fitted are not refundable.</p>
      </Section>
      <Section title="4. When we cancel">
        <p>If AutoReach cancels a booking for any reason on our side, you receive a full refund of any amount paid.</p>
      </Section>
      <Section title="5. How refunds are paid">
        <p>Approved refunds are made by bank transfer to an account in your name within 3 to 5 working days. We may ask for your bank details and the original payment slip.</p>
      </Section>
      <Section title="6. Overpayments">
        <p>If you pay more than your invoice total, we will refund the difference or, if you prefer, keep it as credit for your next booking.</p>
      </Section>
    </LegalLayout>
  );
}
