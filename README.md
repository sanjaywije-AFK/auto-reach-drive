# AutoReach MVP App

Build an MVP web/mobile-responsive application for AutoReach, a Sri Lanka-based vehicle concierge and doorstep minor maintenance service. The MVP should help customers book vehicle pickup/drop-off servicing or doorstep minor maintenance, allow admins to manage bookings and assign drivers, and allow drivers to update job progress. The app should be optimized for mobile use first, but also work well as a web app.

Business context:
AutoReach provides a convenient vehicle maintenance concierge service. Customers do not need to visit service centers themselves. AutoReach picks up the customer’s vehicle from home/office, takes it to a trusted or authorized service center, monitors the service progress, and returns the vehicle. AutoReach also supports minor doorstep maintenance such as battery jump-start, fluid top-up, tyre pressure check, oil change coordination, and basic inspection. The business targets busy professionals, corporate fleet customers, elderly customers, expats, and everyday vehicle owners in Colombo and suburbs, with later expansion to Kandy, Galle, and other cities.

Branding and design direction:
- Brand name: AutoReach
- Tagline: We Pick Up. We Service. We Deliver.
- Style: clean, modern, trustworthy, professional, automotive-tech feeling
- Primary color: deep blue / navy (#18468B or similar)
- Secondary color: bright blue (#3D8FFF or similar)
- Neutral colors: white, light grey (#EAEAEA), dark charcoal (#333333)
- Typography: Montserrat or similar modern sans-serif
- UI style: rounded cards, blue gradient headers, clear icons, strong CTAs, mobile-first layout
- Tone: reliable, safe, insured, transparent, convenient

Core MVP user roles:
1. Customer
2. Admin / Operations Manager
3. Driver / Service Handler

Authentication:
- Allow signup/login using email and password for MVP.
- Include role-based access: customer, admin, driver.
- For demo purposes, seed/sample users can be included: customer, admin, and driver.

Customer-facing features:
1. Landing / Home Page
- Hero section with AutoReach branding and tagline.
- Main CTA: Book a Service.
- Secondary CTA: Track My Vehicle.
- Explain three-step process: 1) We pick up, 2) We service, 3) We deliver.
- Show launch offer: Rs. 1,500 limited-time pickup offer.
- Show trust badges: Safe Handling, Photo Updates, Transparent Pricing, Authorized Service Centers.

2. Customer Dashboard / Mobile Home
- Greeting: Welcome, [Name]
- Quick action cards:
  - Book a Service
  - Track My Vehicle
  - Service History
  - Offers
- Show active booking status if any.

3. Vehicle Profile Management
- Customer can add/edit vehicle details:
  - Vehicle owner name
  - Vehicle number / registration plate
  - Vehicle make
  - Vehicle model
  - Year
  - Fuel type
  - Notes / special instructions
- Customer can have multiple vehicles.

4. Booking Flow
Create a simple booking wizard or form with:
- Select existing vehicle or add new vehicle
- Service category:
  - Pickup & Service
  - Doorstep Minor Maintenance
  - Emergency Assistance
  - Vehicle Inspection
- Preferred service center type:
  - Authorized service agent
  - Trusted partner service center
  - Customer preferred center
- Pickup location with address field and optional map link field
- Drop-off location, default same as pickup
- Preferred date and time
- Notes / known vehicle issue
- Upload optional photos of current vehicle condition
- Estimated price display:
  - Pickup & Drop: Rs. 1,500 introductory price or Rs. 2,000–4,000 standard range
  - Doorstep Minor Maintenance: Rs. 1,000–2,500 range
- Confirmation screen with booking summary

5. Booking Status / Track My Vehicle
Show active job progress with a visual timeline:
- Booking Requested
- Booking Confirmed
- Driver Assigned
- Vehicle Picked Up
- At Service Center
- Service In Progress
- Ready for Delivery
- Out for Delivery
- Delivered / Completed
Include driver name and contact field when assigned.
Include service center name when assigned.
Include admin/driver notes and uploaded photos.
Add button: Contact Driver / Contact AutoReach via WhatsApp placeholder.

6. Service History
- List completed jobs by date and vehicle.
- Show service category, service center, total amount, status, and details.
- Detail view includes timeline, invoice summary, notes, and photos.

7. Customer Feedback
- After job completion, allow customer to rate service 1–5 stars.
- Add comment/testimonial.

Admin features:
1. Admin Dashboard
- Summary cards:
  - Today’s bookings
  - Pending bookings
  - In-progress jobs
  - Completed jobs
  - Total revenue
  - Estimated profit
- Table/list of all bookings with filters by status, date, service type, driver, and customer.

2. Booking Management
Admin can:
- View customer and vehicle details.
- Edit booking details.
- Update booking status.
- Assign driver.
- Assign service center.
- Add estimated service cost.
- Add amount charged to customer.
- Calculate profit = amount charged - cost.
- Add internal notes.
- Upload/attach status photos if possible.

3. Driver Management
- List drivers.
- Add/edit driver profile:
  - Name
  - Phone
  - License number
  - Availability status
- Assign bookings to drivers.

4. Service Center Management
- Add/edit service centers:
  - Name
  - Type: Authorized / Trusted Partner / Customer Preferred
  - Address
  - Contact person
  - Phone
  - Supported vehicle brands

5. CRM / Customer Management
- Customer list with search.
- Customer profile showing contact, vehicles, completed jobs, total revenue, last service date, feedback, next follow-up date.
- Allow admin to set follow-up date.
- Customer lifecycle status: Lead, First-Time Customer, Repeat Customer, VIP Customer.

6. Invoice / Payment Summary
- For each completed booking, generate a simple invoice summary screen with:
  - Customer name
  - Vehicle number
  - Service type
  - Pickup/drop fee
  - Maintenance/service cost
  - Additional charges
  - Discount
  - Total amount
  - Payment method: Cash, Bank Transfer, Online Payment placeholder
  - Payment status: Pending, Paid, Partially Paid

Driver features:
1. Driver Dashboard
- View assigned jobs.
- Each job card should show customer name, vehicle number, pickup location, date/time, service type, and current status.

2. Driver Job Detail
Driver can update statuses:
- On the way to pickup
- Vehicle picked up
- Arrived at service center
- Service completed
- Out for delivery
- Delivered
Driver can add notes.
Driver can upload or attach condition photos if possible.

Data models/tables needed:
User:
- id
- name
- email
- phone
- role: customer/admin/driver
- createdAt

Vehicle:
- id
- customerId
- ownerName
- registrationNumber
- make
- model
- year
- fuelType
- notes
- createdAt

Booking:
- id
- customerId
- vehicleId
- serviceCategory
- preferredServiceCenterType
- pickupAddress
- pickupMapLink
- dropoffAddress
- preferredDateTime
- notes
- status
- assignedDriverId
- assignedServiceCenterId
- estimatedPrice
- serviceCost
- amountCharged
- discount
- profit
- paymentStatus
- paymentMethod
- createdAt
- updatedAt

BookingStatusUpdate:
- id
- bookingId
- status
- note
- updatedByUserId
- createdAt

Driver:
- id
- userId
- name
- phone
- licenseNumber
- availabilityStatus

ServiceCenter:
- id
- name
- type
- address
- contactPerson
- phone
- supportedBrands

Feedback:
- id
- bookingId
- customerId
- rating
- comment
- createdAt

CustomerCRM:
- id
- customerId
- lifecycleStatus
- totalJobs
- totalRevenue
- lastServiceDate
- nextFollowUpDate
- notes

Operations and workflow rules:
- New booking starts as Booking Requested.
- Admin confirms booking and assigns driver.
- Driver/admin can update booking status through the service timeline.
- Completed booking should allow customer feedback and invoice summary.
- Admin dashboard should update key metrics based on booking statuses and revenue fields.
- For MVP, payments do not need real integration; use payment status and method fields only.
- For MVP, map integration can be placeholder fields or embedded map link, not full live GPS.

Important screens/pages to build:
Customer:
- Landing page
- Customer dashboard
- Register/Login
- Vehicle list and vehicle form
- Book service form
- Booking confirmation
- Track booking/status timeline
- Service history
- Booking detail/invoice
- Feedback form
- Profile page

Admin:
- Admin dashboard
- All bookings table
- Booking detail/edit page
- Driver management
- Service center management
- Customer CRM list
- Customer CRM detail
- Revenue/operations summary

Driver:
- Driver dashboard
- Assigned job detail
- Status update form

Sample status values:
- Booking Requested
- Booking Confirmed
- Driver Assigned
- On the Way to Pickup
- Vehicle Picked Up
- At Service Center
- Service In Progress
- Ready for Delivery
- Out for Delivery
- Delivered
- Completed
- Cancelled

Sample services and prices:
- Pickup & Service: Rs. 1,500 introductory / Rs. 2,000–4,000 standard
- Doorstep Minor Maintenance: Rs. 1,000–2,500
- Battery Jump Start: Rs. 1,500–2,500
- Fluid Top-up Visit: Rs. 1,000–2,000
- Inspection Visit: Rs. 1,500–3,000

MVP limitations:
- No real payment gateway integration yet.
- No real-time GPS required yet.
- No complex mechanic inventory required.
- WhatsApp contact buttons can be links/placeholders.
- Admin can manually update costs, status, and service center details.

Desired quality:
Build a polished clickable MVP that looks investor-ready and usable for pilot operations. It should be simple, clean, and easy for non-technical staff to use. The app should clearly demonstrate AutoReach’s business model, customer journey, operational workflow, and scalability potential.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://auto-reach-drive.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/705b9084-dcda-4d04-9ca9-cf90858a290e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
