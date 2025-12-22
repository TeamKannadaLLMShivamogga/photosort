
# PhotoSort Pro 📸

PhotoSort Pro is a comprehensive photo selection and delivery platform designed for professional photographers and their clients. It streamlines the post-production workflow using AI-powered organization, intuitive selection tools, and a structured review process.

## 🌟 Features by User Role

### 1. Super Admin 🛡️
The platform overseer who manages the SaaS aspect of the application.
*   **Global Dashboard**: Visual analytics for platform revenue, storage usage, and system uptime.
*   **Revenue Analytics**: Interactive charts showing financial growth over time.
*   **User Governance**: Search, filter, and manage all users (Photographers and Clients). Ability to ban/suspend accounts.
*   **Event Oversight**: View all events across the platform with status and revenue details.
*   **Subscription Management**: Track studio subscription tiers (Free, Pro, Studio) and expiry dates.
*   **System Config**: "Danger Zone" to reset the database and configure system-wide settings.

### 2. Photographer (Partner) 📷
The studio owner managing events and deliveries.
*   **Studio Dashboard**: At-a-glance view of active events, pending actions (e.g., "Start Editing"), and financial balance to collect.
*   **Event Management**: 
    *   **Create Event Wizard**: Set up events with details, cover photos, sub-events (e.g., Haldi, Wedding), and pricing packages.
    *   **Client Access Control**: Invite clients via email/phone and manage their access permissions.
*   **Smart Gallery**:
    *   **Upload Raw**: Bulk upload raw images which are automatically processed by AI.
    *   **Upload Edits**: Upload finished edits corresponding to user selections.
*   **AI Integration**: Automatic tagging, face grouping, and quality scoring (AI Best Picks) for uploaded photos.
*   **Portfolio Builder**: customizable profile page with bio, sample galleries, and YouTube video integration.
*   **Service Menu**: Define packages and add-on services (e.g., Album printing) for clients to purchase.

### 3. Client (User) 👤
The end-user selecting their favorite moments.
*   **Event Selector**: Switch between multiple assigned events (e.g., Engagement, Wedding).
*   **Smart Gallery**:
    *   **AI Filtering**: Filter photos by "Best Picks", specific People (Face recognition), Event type, or Tags.
    *   **Selection**: Simple tap-to-select interface with persistent indicators.
*   **Workflow Tracking**: Visual timeline showing the project status (Selection Open -> Submitted -> Editing -> Review -> Accepted).
*   **My Selections**:
    *   Review selected photos.
    *   **Submit for Edit**: Lock selections and notify the photographer.
*   **Review & Approve**:
    *   View uploaded edits.
    *   **Comments**: Request specific changes on individual photos.
    *   **Approve**: Finalize the project.
*   **Family Mapping**: Upload reference selfies for family members to improve AI face detection.
*   **Add-ons Store**: Request additional services like premium albums directly from the app.

---

## 🔄 The Selection-to-Delivery Workflow

This section explains the core lifecycle of a project within PhotoSort Pro, detailing the actions required by the Photographer and the Client.

### Phase 1: Event Setup & Ingestion
**Actor:** Photographer

1.  **Create Event**: 
    *   Navigate to **Events List** -> Click **"New Event"**.
    *   Fill in details (Name, Date, Location, Package).
    *   Add Clients (Name, Email).
    *   Click **"Complete Deployment"**.
2.  **Upload Assets**:
    *   Open the new event -> Click **"Manage Photos"**.
    *   Click **"Upload Raw"** (Top Right).
    *   Select and upload all raw images.
    *   *System Action*: The backend tags images, detects faces, and scores quality.

### Phase 2: Client Selection
**Actor:** Client

1.  **Login & Browse**: 
    *   Log in using the email assigned by the photographer.
    *   Enter the **Gallery**.
2.  **Select Photos**:
    *   Browse the "Grid" or use "People" filters to find photos.
    *   Click the **Circle/Check icon** on photos to select them.
    *   Selected photos appear with a blue border and checkmark.
3.  **Review Selection**:
    *   Navigate to the **"My Selections"** tab (Sidebar).
    *   Review the "Selected Originals" list.
4.  **Submit**:
    *   Click the **"Submit for edit"** button (Header) OR the **"Submit for reviewing"** floating button (Bottom Right).
    *   Confirm the dialog.
    *   *System Action*: Selection status changes to **Submitted**. The gallery is now locked for the client.

### Phase 3: Editing
**Actor:** Photographer

1.  **Receive Selection**:
    *   Dashboard shows an alert: **"Start Editing"** for the specific event.
    *   Filter gallery by "Selected" tab to see client choices.
2.  **Process & Upload**:
    *   Edit the photos externally.
    *   Go to Event Gallery -> Click **"Upload Edits"**.
    *   Upload the finished JPEGs.
    *   *System Action*: The system maps edits to originals (based on filename logic or manual matching) and changes status to **Review**.

### Phase 4: Final Review & Delivery
**Actor:** Client

1.  **Review Edits**:
    *   Log in and go to **"My Selections"**.
    *   Switch tab to **"Edited Pics"**.
2.  **Feedback (Optional)**:
    *   Click "Comment" on a specific photo to request changes (e.g., "Make brighter").
    *   Status updates to "Changes Requested".
3.  **Final Approval**:
    *   If satisfied, click the **"Approve All"** button (Top Right of Edited tab).
    *   *System Action*: Project status changes to **Accepted**. Workflow is complete.

---

## 🔮 Future Scope & Roadmap

Critical features identified to enhance the platform's utility for all actors.

### 1. Workflow Enhancements
*   **Download High-Res**: A dedicated "Download" button for clients to retrieve finalized/approved images in high resolution (ZIP format) directly from the dashboard.
*   **Global View Mode**: A "View All" mode in the gallery to see all photos without pagination or tab constraints, ideal for quick scanning.
*   **Payment Gateway Integration**: Direct integration with Stripe/Razorpay allowing clients to pay event balances and order add-ons within the app.
*   **Lightroom Sync (XMP)**: Ability for photographers to export client selections as XMP sidecar files or CSVs to automate tagging in Lightroom/Capture One.

### 2. Experience Upgrades
*   **Guest Face Search**: A public portal where wedding guests can upload a selfie to find their specific photos without accessing the private client gallery.
*   **Social Sharing Engine**: One-click sharing to Instagram Stories/WhatsApp with automated studio watermarking and branding.
*   **Watermarking Tool**: Server-side watermarking for "Raw" uploads to protect photographer IP before final payment.
*   **Offline Mobile App**: A React Native companion app allowing clients to select photos on airplanes or low-connectivity zones.

### 3. Platform Growth
*   **White-Labeling**: Domain mapping (e.g., `gallery.mystudio.com`) for Studio-tier subscribers.
*   **Automated Notifications**: Email and SMS triggers (via SendGrid/Twilio) for workflow state changes (e.g., "Selection Reminder", "Edits Ready").
*   **Archival Storage**: Policy to auto-move completed event assets to AWS Glacier after 6 months to reduce hosting costs.

---

## 🛠️ Technical Stack

*   **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons.
*   **Backend**: Node.js (Express) or Python (FastAPI) - *Configurable*.
*   **Database**: MongoDB (via Mongoose/Motor).
*   **AI Service**: Python microservice using mock or real vision models (CLIP/FaceNet) for tagging and clustering.

## 🚀 Getting Started

1.  Ensure you have **Node.js** and **MongoDB** installed (or use the provided `run_app.sh` if using Conda).
2.  Run the startup script:
    ```bash
    ./run_app.sh
    ```
3.  Access the application at `http://localhost:5173`.
4.  Default Demo Credentials:
    *   **Admin**: `admin@photosort.com`
    *   **Photographer**: `photographer@photosort.com`
    *   **Client**: `user@photosort.com`
