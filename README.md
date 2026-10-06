# Caffernaum — Coffee Shop Website

## Project Structure

- `index.html` — main page layout
- `styles.css` — stylesheet with responsive design
- `images/` — folder for image files (created)

## Setup Instructions

1. **Images folder created** — The `images/` folder is ready in your workspace.

2. **Add your image files** to the `images/` folder:
   - `kape nasa pitchel.png` — Hero image (top section pour-over)
   - `honey latter.png` — Spiced Honey Latte product card
   - `cold brew.png` — Cold Brew Tonic product card
   - `maple-latte.webp` — Maple Pecan Flat White product card
   - `small espresso.png` — Oak-Aged Espresso product card
   - `table and chair.png` — Cafe interior image (locations section)

3. **Preview the site**:
   - Open the project folder in VS Code and start `index.html` with the Live Server extension.
   - Use the local address shown by Live Server on the computer.

4. **Open the site on a phone or another device on the same Wi-Fi**:
   - Restart Live Server after opening this workspace so it loads the network host setting.
   - Find the computer's IPv4 address with `ipconfig` in PowerShell.
   - On the other device, open `http://<computer-ip>:5500/index.html` (replace `<computer-ip>` with the computer's IPv4 address). Use `/inventory.html` or another page to open a different section.
   - If Windows Firewall asks, allow Live Server on the private network. Sign in separately on each device.

   Live Server's local-network address is HTTP. Camera scanning on a phone requires a secure HTTPS origin, so use an HTTPS deployment for the barcode camera; the manual SKU entry remains available in the local preview.

## Pricing & Customization

The site uses Philippine Peso (₱) for pricing. You can edit prices, text, and colors in `index.html` and `styles.css`.

## Features

- Responsive design (mobile, tablet, desktop)
- Clean, modern coffee shop aesthetic
- Product showcase with image cards
- Location & rewards sections
- Dark green & orange accent colors
## Access the inventory
Open `inventory.html` through Live Server or use the same-Wi-Fi phone address described above. Avoid opening the file directly when testing Firebase features.