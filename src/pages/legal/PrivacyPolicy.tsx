import LegalLayout, { Section } from "./LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="20 November 2026"
      description="What personal and vehicle information AutoReach collects, why, who can see it and how it is protected.">
      <p className="text-sm text-muted-foreground">AutoReach ("we") provides vehicle pickup, drop-off and doorstep maintenance services in Sri Lanka. This policy explains what information we collect and how we use it, in line with Sri Lanka's Personal Data Protection Act No. 9 of 2022.</p>
      <Section title="1. Information we collect">
        <ul>
          <li><strong>Account details:</strong> name, email address, phone and WhatsApp number.</li>
          <li><strong>Addresses:</strong> pickup, drop-off and doorstep service locations.</li>
          <li><strong>Vehicle details:</strong> registration number, make, model, year, mileage and service notes.</li>
          <li><strong>Photos:</strong> vehicle condition photos taken by drivers at pickup and return.</li>
          <li><strong>Payment records:</strong> bank transfer slips, transfer references and payment status. We do not collect or store card numbers.</li>
          <li><strong>Feedback:</strong> ratings and comments you leave after a service.</li>
        </ul>
      </Section>
      <Section title="2. How we use it">
        <ul>
          <li>To schedule, carry out and track your bookings.</li>
          <li>To contact you by phone or WhatsApp about your vehicle and payments.</li>
          <li>To record vehicle condition and resolve any disputes or insurance claims.</li>
          <li>To confirm payments and keep accounting records.</li>
          <li>To improve our service.</li>
        </ul>
        <p>We do not sell your information or use it for third-party advertising.</p>
      </Section>
      <Section title="3. Who can see your information">
        <ul>
          <li><strong>AutoReach admins</strong> who manage bookings and payments.</li>
          <li><strong>The driver assigned to your booking</strong>, only for that job.</li>
          <li><strong>The partner service centre</strong> handling your vehicle, only the details needed for the work.</li>
          <li>Authorities, where required by Sri Lankan law.</li>
        </ul>
        <p>Your account is protected so that other customers and unassigned drivers cannot see your bookings, photos or payment slips.</p>
      </Section>
      <Section title="4. Website statistics">
        <p>Our website uses Lovable's visitor analytics. It uses no cookies, stores nothing on your device, doesn't keep IP addresses and doesn't identify visitors. It records the pages visited, where visitors came from, their country, browser, operating system and device type, how long they stay, how fast pages load, errors, and which buttons and links are clicked. This is recorded for every visitor. Detailed data is kept for 90 days and daily summaries for a year. Lovable collects this data for us. <a className="text-primary hover:underline" href="https://lovable.dev/privacy" target="_blank" rel="noreferrer">Lovable's privacy policy</a> explains how it handles it.</p>
        <p>When you sign in, your browser keeps a sign-in token so you stay logged in. Account data and photos are stored with our hosting provider. Tapping a WhatsApp button opens WhatsApp, which is covered by WhatsApp's own privacy policy.</p>
      </Section>
      <Section title="5. How long we keep it">
        <p>We keep booking, photo and payment records for as long as your account is active and as needed for accounting and legal obligations. You can ask us to delete your account at any time.</p>
      </Section>
      <Section title="6. Your rights">
        <p>You can ask to see, correct or delete your personal information, or withdraw consent, by contacting us on WhatsApp. We will respond within a reasonable time.</p>
      </Section>
      <Section title="7. Changes">
        <p>We may update this policy. The date at the top shows the latest version.</p>
      </Section>
    </LegalLayout>
  );
}
