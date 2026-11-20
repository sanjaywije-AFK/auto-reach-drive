import LegalLayout, { Section } from "./LegalLayout";

export default function Terms() {
  return (
    <LegalLayout title="Terms & Conditions" updated="20 November 2026"
      description="The terms for using AutoReach vehicle pickup, drop-off and doorstep minor maintenance services in Sri Lanka.">
      <p className="text-sm text-muted-foreground">By creating an account or booking with AutoReach, you agree to these terms.</p>
      <Section title="1. Our services">
        <p>AutoReach offers vehicle concierge services (collecting your vehicle, taking it to a partner service centre and returning it) and doorstep minor maintenance. Repairs at service centres are performed by the partner centre, not by AutoReach.</p>
      </Section>
      <Section title="2. Your responsibilities">
        <ul>
          <li>You own the vehicle or are authorised to hand it over.</li>
          <li>The vehicle is legally registered, has valid insurance and revenue licence, and is safe to drive.</li>
          <li>There is enough fuel for the trip to and from the service centre.</li>
          <li>You remove valuables and personal items. AutoReach is not responsible for items left inside.</li>
          <li>You give accurate addresses and contact details and are reachable during the booking.</li>
        </ul>
      </Section>
      <Section title="3. Handover and condition photos">
        <p>Our driver takes photos of the vehicle at pickup and return. These photos are the agreed record of the vehicle's condition. Please raise any concerns at the time of return.</p>
      </Section>
      <Section title="4. Prices and extra work">
        <p>Prices shown when booking are estimates. The final invoice depends on the service centre's quote and any parts used. We will ask for your approval before any extra work is done.</p>
      </Section>
      <Section title="5. Payment">
        <p>Payment is made by bank transfer to the account shown on your booking, using your booking reference, or as agreed with us. A booking is treated as paid once we have confirmed the transfer.</p>
      </Section>
      <Section title="6. Cancellations and refunds">
        <p>Cancellations and refunds follow our <a className="text-primary hover:underline" href="/refund-policy">Refund Policy</a>.</p>
      </Section>
      <Section title="7. Liability">
        <p>We take care with every vehicle. If damage is caused by our driver's negligence while the vehicle is in our care, we will work with you and the relevant insurer to resolve it. We are not liable for existing faults, wear and tear, mechanical failures not caused by us, or work performed by partner service centres beyond our reasonable control. Our liability for any booking is limited to the extent allowed by Sri Lankan law.</p>
      </Section>
      <Section title="8. Accounts">
        <p>Keep your password private. We may suspend accounts that are misused or give false information.</p>
      </Section>
      <Section title="9. Governing law">
        <p>These terms are governed by the laws of the Democratic Socialist Republic of Sri Lanka, and disputes fall under the courts of Sri Lanka.</p>
      </Section>
      <Section title="10. Changes">
        <p>We may update these terms. Continued use of AutoReach means you accept the latest version.</p>
      </Section>
    </LegalLayout>
  );
}
