class VectorPDF {
  constructor() {
    this.pages = [];
    this.currentPage = null;
  }

  new_page(width_mm, height_mm) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svg.setAttribute("width", `${width_mm}mm`);
    svg.setAttribute("height", `${height_mm}mm`);
    svg.setAttribute("viewBox", `0 0 ${width_mm} ${height_mm}`);

    this.currentPage = {
      width_mm,
      height_mm,
      svg,
    };
    this.pages.push(this.currentPage);
  }

  _require_page() {
    if (!this.currentPage) {
      throw new Error("No active page. Call new_page(width_mm, height_mm) first.");
    }
    return this.currentPage.svg;
  }

  _set_stroke(el, stroke, cap, joint, dash) {
    if (stroke === null) {
      el.setAttribute("stroke", "none");
      return;
    }

    el.setAttribute("stroke", stroke);
    if (cap) {
      el.setAttribute("stroke-linecap", cap);
    }
    if (joint) {
      el.setAttribute("stroke-linejoin", joint);
    }
    if (Array.isArray(dash) && dash.length > 0) {
      el.setAttribute("stroke-dasharray", dash.join(" "));
    }
  }

  _set_fill(el, fill) {
    el.setAttribute("fill", fill === null ? "none" : fill);
  }

  _sheared_oval_points(x1, y1, x2, y2, v_tilt, h_tilt, segments = 64) {
    const cx = (x1 + x2) / 2;
    const cy = (y1 + y2) / 2;
    const rx = Math.abs(x2 - x1) / 2;
    const ry = Math.abs(y2 - y1) / 2;
    const points = [];

    for (let i = 0; i < segments; i += 1) {
      const t = (i / segments) * Math.PI * 2;
      const ex = cx + rx * Math.cos(t);
      const ey = cy + ry * Math.sin(t);
      const sy = ey + v_tilt * (ex - cx);
      const sx = ex + h_tilt * (sy - cy);
      points.push([sx, sy]);
    }

    return points;
  }

  new_line(x1, y1, x2, y2, cap = "butt", joint = "miter", stroke = "#000000", dash = null) {
    const svg = this._require_page();
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    this._set_stroke(line, stroke, cap, joint, dash);
    svg.appendChild(line);
  }

  new_rect(x1, y1, x2, y2, cap = "butt", joint = "miter", stroke = "#000000", fill = null, dash = null) {
    const svg = this._require_page();
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", Math.min(x1, x2));
    rect.setAttribute("y", Math.min(y1, y2));
    rect.setAttribute("width", Math.abs(x2 - x1));
    rect.setAttribute("height", Math.abs(y2 - y1));
    this._set_stroke(rect, stroke, cap, joint, dash);
    this._set_fill(rect, fill);
    svg.appendChild(rect);
  }

  new_polygon(points, cap = "butt", joint = "miter", stroke = "#000000", fill = null, dash = null) {
    const svg = this._require_page();
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", points.map(([x, y]) => `${x},${y}`).join(" "));
    this._set_stroke(polygon, stroke, cap, joint, dash);
    this._set_fill(polygon, fill);
    svg.appendChild(polygon);
  }

  poly_line(points, cap = "butt", joint = "miter", stroke = "#000000", dash = null) {
    const svg = this._require_page();
    const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
    polyline.setAttribute("points", points.map(([x, y]) => `${x},${y}`).join(" "));
    this._set_stroke(polyline, stroke, cap, joint, dash);
    polyline.setAttribute("fill", "none");
    svg.appendChild(polyline);
  }

  new_oval(x1, y1, x2, y2, stroke = "#000000", fill = null, dash = null, v_tilt = 0, h_tilt = 0) {
    const svg = this._require_page();
    if (v_tilt !== 0 || h_tilt !== 0) {
      const oval_poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      const points = this._sheared_oval_points(x1, y1, x2, y2, v_tilt, h_tilt);
      oval_poly.setAttribute("points", points.map(([x, y]) => `${x},${y}`).join(" "));
      this._set_stroke(oval_poly, stroke, "butt", "round", dash);
      this._set_fill(oval_poly, fill);
      svg.appendChild(oval_poly);
      return;
    }

    const oval = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    oval.setAttribute("cx", (x1 + x2) / 2);
    oval.setAttribute("cy", (y1 + y2) / 2);
    oval.setAttribute("rx", Math.abs(x2 - x1) / 2);
    oval.setAttribute("ry", Math.abs(y2 - y1) / 2);
    this._set_stroke(oval, stroke, "butt", "miter", dash);
    this._set_fill(oval, fill);
    svg.appendChild(oval);
  }

  async save(filename = "drawing.pdf") {
    if (this.pages.length === 0) {
      throw new Error("No pages to save.");
    }

    const { jsPDF } = window.jspdf;
    const first = this.pages[0];
    const pdf = new jsPDF({
      orientation: first.width_mm >= first.height_mm ? "landscape" : "portrait",
      unit: "mm",
      format: [first.width_mm, first.height_mm],
    });

    for (let i = 0; i < this.pages.length; i += 1) {
      const page = this.pages[i];
      if (i > 0) {
        pdf.addPage([page.width_mm, page.height_mm], page.width_mm >= page.height_mm ? "landscape" : "portrait");
      }

      await window.svg2pdf(page.svg, pdf, {
        xOffset: 0,
        yOffset: 0,
        scale: 1,
      });
    }

    pdf.save(filename);
  }
}

window.VectorPDF = VectorPDF;
