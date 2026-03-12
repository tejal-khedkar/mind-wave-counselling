# MindWave Counselling — Site Management Guide
**For: Tejal Khedkar**
**Site:** https://www.mindwavecounselling.com

---

## How Everything Connects

```
Google Calendar  ──►  Google Apps Script  ──►  Website (mindwavecounselling.com)
(you add slots)        (the "brain")             (clients book slots)
                            │
                            ▼
                      Google Sheets
                    (all bookings saved)
                            │
                            ▼
                   Email to you (notification)
                            │
                            ▼
              You review → Send Confirmation to client
```

---

## 1. Managing Your Available Appointment Slots

This is your most frequent task. Clients can only book slots that exist in your Google Calendar.

### How to Add an Available Slot

1. Open **Google Calendar** (calendar.google.com) — use the same Google account the Apps Script runs on
2. Create a new event on the date/time you want to offer
3. Set the event title to exactly: **`Available`** (capital A, nothing else)
4. In the **Description** field, type one of:
   - `type: online` — for online sessions
   - `type: in-person` — for in-person sessions (Nagpur)
5. Save the event

That slot will immediately appear on your website for clients to book.

### Rules to Remember
- Title must be **exactly** `Available` — any typo (e.g. `available`, `AVAILABLE`) and it won't show
- Description **must** have `type: online` or `type: in-person` — without this, the slot is ignored
- The event must have a **specific start and end time** — all-day events are ignored
- Slots show for the **next 14 days** from today

### When a Client Books a Slot
- The calendar event automatically renames to **"Booked — [Client Name]"** and turns **red**
- That slot disappears from the website so no one else can book it
- You receive a notification email with full details

### How to Remove/Block a Slot
Simply delete the "Available" event from your calendar. It will disappear from the website within seconds.

---

## 2. Receiving & Reviewing Booking Requests

### The Notification Email
When a client submits the booking form, you receive an email at **tejalkhedkar@mindwavecounselling.com** with:
- Client name, email, phone
- Requested date/time, mode (online/in-person), session type
- Their message (if any)
- Self-assessment scores (BDI / BAI) if they completed them

### The Bookings Google Sheet
All bookings are saved to your Google Sheet (ID: `10bBWNfWLrlnDbY5s_4Sen6dR0FzflqdtNZNXsAMX848`).

Open it at: **sheets.google.com** → look for "MindWave Bookings" (or search by the ID above).

**Columns in the Bookings tab:**
| Column | Content |
|--------|---------|
| A | Timestamp |
| B | First Name |
| C | Last Name |
| D | Email |
| E | Phone |
| F | Mode (Online / In-Person) |
| G | Session Type |
| H | Slot Date |
| I | Slot Time |
| J | Message |
| K–N | Assessment scores |

There is also an **Assessment Responses** tab with the full Q&A if a client completed the BDI/BAI questionnaires.

---

## 3. Sending a Confirmation Email to a Client

Once you've reviewed a booking and are ready to confirm:

1. Open the **Google Sheet** (Bookings tab)
2. Click on **any cell in the client's row**
3. In the top menu, click **MindWave → ✉️ Send Confirmation to Client**
4. A popup will ask you to confirm — click **Yes**
5. The client receives a branded confirmation email with their session details
6. You receive a BCC copy for your records

> **Note:** If you don't see the "MindWave" menu, refresh the sheet page — it loads when the sheet opens.

---

## 4. Updating Website Content

### The Golden Rule
> **Never edit `index.html` directly.** Always edit the relevant file in the `sections/` folder, then run the build command.

### Which File to Edit

| Section on Website | File to Edit |
|-------------------|--------------|
| Navigation bar | `sections/nav.html` |
| Hero (top banner) | `sections/hero.html` |
| About Me | `sections/about.html` |
| Services & Pricing | `sections/contact.html` *(and `index.html` search for `.si-row`)* |
| My Approach | `sections/approach.html` |
| Assessments | `sections/assessments.html` |
| Booking Form | `sections/booking.html` |
| Social Links | `sections/social.html` |
| Footer | `sections/footer.html` |

### How to Edit Content (Step by Step)

1. Open the relevant file in any text editor (TextEdit on Mac works, but VS Code is better)
2. Find the text you want to change and update it
3. Save the file
4. Open **Terminal**, navigate to the site folder:
   ```
   cd /path/to/mind-wave-counselling
   ```
5. Run:
   ```
   node build.js
   ```
6. This regenerates `index.html` — your changes are now ready to publish

### Things You Can Safely Change
- Any visible text (headings, paragraphs, quotes)
- Pricing figures in `sections/contact.html`
- Your qualifications/bio in `sections/about.html`
- Social media links in `sections/social.html`
- The testimonials in `sections/testimonials.html`

### Things to Be Careful With
- Do **not** change CSS class names (e.g. `class="hero-lead"`)
- Do **not** remove `id=` attributes (they're used for navigation links)
- Do **not** edit `style.css` unless you're comfortable with CSS

---

## 5. Publishing Changes to the Website

The website is hosted on **GitHub Pages**. To publish any changes:

1. Open **Terminal**
2. Navigate to the site folder:
   ```
   cd /path/to/mind-wave-counselling
   ```
3. Run these commands one by one:
   ```
   git add .
   git commit -m "describe what you changed"
   git push
   ```
4. Wait ~2 minutes, then refresh your site — changes are live

> GitHub automatically publishes whenever you push to the `main` branch.

### If You Get a Git Error
- If it says "not logged in" — you need to authenticate with GitHub. Contact your developer.
- If it says "conflict" — do not force push. Contact your developer.

---

## 6. Updating Prices or Session Types

### Prices shown on the website
Edit `sections/contact.html` — find the `.si-row` lines like:
```html
<div class="si-row"><span>Individual (Online)</span><span>₹800 / session</span></div>
```
Change the number. Then run `node build.js` and push to GitHub.

### Session types in the booking form dropdown
Edit `sections/booking.html` — find the `<select id="bt">` block and add/edit `<option>` lines.

---

## 7. Managing the Google Apps Script

The Apps Script is the backend that:
- Serves available slots to the website
- Saves bookings to the Sheet
- Marks calendar events as booked
- Sends emails

**You should rarely need to touch this.** Only update it if you need to change email content, add new features, or fix something.

### If You Need to Redeploy
1. Go to **script.google.com**
2. Open the MindWave project
3. Make your changes to `Code.gs`
4. Click **Deploy → Manage Deployments → Edit (pencil icon)**
5. Change version to **"New version"**
6. Click **Deploy**
7. Copy the new Web App URL
8. Update `main.js` line 6 in the site folder with the new URL:
   ```js
   var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR-NEW-URL/exec';
   ```
9. Run `node build.js` and push to GitHub

### Important Deployment Settings
- **Execute as:** Me (Tejal Khedkar)
- **Who has access:** Anyone *(not "Anyone with a Google account")*

### Calendar Advanced Service
The script uses the Google Calendar API (Advanced Service). If you create a brand new script project from scratch, you must enable it:
1. In the script editor, click **Services** (+ icon in left sidebar)
2. Find **Google Calendar API** → click **Add**

---

## 8. Domain & Email Management

### Your Domain
- **Domain:** mindwavecounselling.com
- **Registered & hosted via:** Squarespace Domains (squarespace.com/domains)
- **Email & Workspace:** Google Workspace Business Starter — India plan

### Logging In

| Service | URL | Login |
|---------|-----|-------|
| Squarespace Domains | squarespace.com/domains | Your Squarespace account |
| Google Workspace Admin | admin.google.com | tejalkhedkar@mindwavecounselling.com |
| Gmail (your business email) | mail.google.com | tejalkhedkar@mindwavecounselling.com |

---

### Google Workspace — Business Starter (India)
Your Google Workspace plan gives you:
- **Professional email** — tejalkhedkar@mindwavecounselling.com
- **Google Drive, Calendar, Meet, Sheets, Docs** — all tied to your business account
- **30 GB storage** per user

**Renewing your plan:**
1. Go to **admin.google.com**
2. Sign in with your business email
3. Click **Billing** in the left menu
4. You can see your next renewal date and update payment here

**Adding a new user (e.g. an assistant):**
1. admin.google.com → **Directory → Users → Add new user**
2. This adds to your monthly cost — Business Starter charges per user

> Keep your Google Workspace active — if it lapses, your business email stops working and the Apps Script (which runs as your account) will also stop.

---

### Squarespace Domain Records — How the Website Works

Your domain (mindwavecounselling.com) is pointed to **GitHub Pages** using DNS records managed in Squarespace. This is what makes `mindwavecounselling.com` load your GitHub-hosted website.

**To view/edit DNS records:**
1. Log in to squarespace.com
2. Go to **Domains → mindwavecounselling.com → DNS Settings**

**Current DNS setup (do not change these unless you know what you're doing):**

| Type | Host | Value |
|------|------|-------|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | mindwavecounselling.com |

These `A` records point to GitHub Pages servers. The `CNAME` ensures `www.mindwavecounselling.com` also works.

> **Never delete these records** — doing so will take your website offline.

---

### Domain Renewal
Your domain renews annually through Squarespace.
1. Log in to squarespace.com → **Domains**
2. Check the expiry date shown next to mindwavecounselling.com
3. Auto-renew should be enabled — verify your payment card is up to date

> If the domain expires, your website and email both go offline. Set a calendar reminder ~1 month before renewal.

---

### If Your Email Stops Working
1. Check Google Workspace billing — admin.google.com → Billing
2. Check domain status — squarespace.com → Domains (make sure it hasn't expired)
3. Check MX records in Squarespace DNS — they should point to Google's mail servers (aspmx.l.google.com etc.)

---

### If Your Website Goes Down
1. Check GitHub Pages status — github.com → your repository → Settings → Pages (should say "Your site is live")
2. Check DNS records in Squarespace — the 4 `A` records above must be present
3. Check domain hasn't expired — squarespace.com → Domains

---

## 9. Social Media Links

All social links are in `sections/social.html`. Find the `href="..."` for each platform and update the URL.

Current links:
- **LinkedIn:** https://www.linkedin.com/in/tejal-khedkar-44a15a232/
- **Instagram:** https://www.instagram.com/_mindwavecounselling_

---

## 9. Favicon & Logo

- **Logo file:** `assets/logo-8.png`
- **Favicon files:** `assets/favicon_io/` folder (favicon.ico, various sizes, apple-touch-icon)

If you ever update your logo, replace `assets/logo-8.png` with the new file (keep the same filename), and regenerate the favicon set at **favicon.io** — then replace the files in `assets/favicon_io/`.

---

## 10. Quick Reference — Common Tasks

| Task | Where |
|------|-------|
| Add a bookable slot | Google Calendar → new event titled "Available" |
| View all bookings | Google Sheets → Bookings tab |
| Send confirmation to client | Google Sheets → MindWave menu → Send Confirmation |
| Change pricing | `sections/contact.html` → `node build.js` → git push |
| Update bio/about text | `sections/about.html` → `node build.js` → git push |
| Update social links | `sections/social.html` → `node build.js` → git push |
| Publish any website change | Terminal → `git add .` → `git commit -m "..."` → `git push` |
| Change Apps Script code | script.google.com → edit → redeploy → update URL in main.js |

---

## 11. Who to Contact for Help

For anything beyond the above — broken functionality, design changes, new features — contact your developer with:
1. A description of what you're trying to do
2. A screenshot if something looks wrong
3. The URL of the page if it's a live site issue

---

*Document prepared for MindWave Counselling — mindwavecounselling.com*
