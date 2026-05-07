# keyTABweb

Vector-based PDF drawing utility scaffold using SVG + jsPDF + svg2pdf.js.

## Files

- `vector_pdf.js`: Drawing utility with methods:
  - `new_page(width_mm, height_mm)`
  - `new_line(x1, y1, x2, y2, cap, joint, stroke, dash)`
  - `new_rect(x1, y1, x2, y2, cap, joint, stroke, fill, dash)`
  - `new_polygon(points, cap, joint, stroke, fill, dash)`
  - `poly_line(points, cap, joint, stroke, dash)`
  - `new_oval(x1, y1, x2, y2, stroke, fill, dash, v_tilt, h_tilt)`
  - `save(filename)`
- `example.html`: Multi-page example using all drawing methods and the required CDN dependencies.

## Usage

Open `example.html` in a browser and click **Generate vector PDF**.
