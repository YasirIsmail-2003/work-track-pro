Place the provided logo image file (from the attachment) in this folder with the filename:

  logo-worktrack.png

The app references the logo at /logo-worktrack.png (used in `src/components/layout/AppLayout.tsx` and `src/pages/Landing.tsx`).

If you have the SVG version, you can save it as `logo-worktrack.svg` and update references accordingly. Otherwise the app now expects a PNG file.

Example (Windows PowerShell):

  Copy-Item -Path "C:\path\to\WorkTrackPro-logo.png" -Destination "public\logo-worktrack.png"

After adding the image, run the dev servers (instructions in the project README or below).