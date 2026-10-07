// A small uncompressed OOXML package keeps local citation export dependency-free.
// All cells are strings, so text beginning with '=' is never interpreted as a formula.
const xml = (value) =>
  String(value ?? "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "")
    .replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[c],
    );
const encoder = new TextEncoder();
function crc32(data) {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++)
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function zip(files) {
  const local = [],
    central = [];
  let offset = 0;
  const header = (size) => {
    const bytes = new Uint8Array(size);
    return { bytes, view: new DataView(bytes.buffer) };
  };
  for (const [path, content] of files) {
    const name = encoder.encode(path),
      data = encoder.encode(content),
      crc = crc32(data);
    const l = header(30 + name.length);
    l.view.setUint32(0, 0x04034b50, true);
    l.view.setUint16(4, 20, true);
    l.view.setUint16(6, 0x800, true);
    l.view.setUint16(12, 33, true);
    l.view.setUint32(14, crc, true);
    l.view.setUint32(18, data.length, true);
    l.view.setUint32(22, data.length, true);
    l.view.setUint16(26, name.length, true);
    l.bytes.set(name, 30);
    local.push(l.bytes, data);
    const c = header(46 + name.length);
    c.view.setUint32(0, 0x02014b50, true);
    c.view.setUint16(4, 20, true);
    c.view.setUint16(6, 20, true);
    c.view.setUint16(8, 0x800, true);
    c.view.setUint16(14, 33, true);
    c.view.setUint32(16, crc, true);
    c.view.setUint32(20, data.length, true);
    c.view.setUint32(24, data.length, true);
    c.view.setUint16(28, name.length, true);
    c.view.setUint32(42, offset, true);
    c.bytes.set(name, 46);
    central.push(c.bytes);
    offset += l.bytes.length + data.length;
  }
  const centralSize = central.reduce((sum, c) => sum + c.length, 0),
    end = header(22);
  end.view.setUint32(0, 0x06054b50, true);
  end.view.setUint16(8, files.length, true);
  end.view.setUint16(10, files.length, true);
  end.view.setUint32(12, centralSize, true);
  end.view.setUint32(16, offset, true);
  const bytes = new Uint8Array(offset + centralSize + 22);
  let position = 0;
  for (const part of [...local, ...central, end.bytes]) {
    bytes.set(part, position);
    position += part.length;
  }
  return bytes;
}
export function citationsWorkbook(book) {
  const sheets = [
    {
      name: "Literature",
      rows: [["Saved block", "Title", "Author", "Year", "Journal", "URL"]],
    },
    { name: "Web", rows: [["Saved block", "Title", "Author", "Year", "URL"]] },
    {
      name: "Computational",
      rows: [["Saved block", "Dataset", "Calculation / evidence", "URL"]],
    },
  ];
  for (const finding of book.findings) {
    for (const source of finding.result.sources) {
      if (source.type === "web")
        sheets[1].rows.push([
          finding.question,
          source.title,
          source.author,
          source.year,
          source.url,
        ]);
      else if (source.type === "computational")
        sheets[2].rows.push([
          finding.question,
          source.title,
          source.description || "",
          source.url,
        ]);
      else
        sheets[0].rows.push([
          finding.question,
          source.title,
          source.author,
          source.year,
          source.journal,
          source.url,
        ]);
    }
    if (finding.result.filename)
      sheets[2].rows.push([
        finding.question,
        finding.result.filename,
        finding.result.summary,
        "Local uploaded file",
      ]);
  }
  const ns = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
  const rel =
    "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
  const files = [
    [
      "[Content_Types].xml",
      `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((_, i) => `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
    ],
    [
      "_rels/.rels",
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="${rel}/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
    ],
    [
      "xl/workbook.xml",
      `<workbook xmlns="${ns}" xmlns:r="${rel}"><sheets>${sheets.map((s, i) => `<sheet name="${s.name}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`).join("")}</sheets></workbook>`,
    ],
    [
      "xl/_rels/workbook.xml.rels",
      `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="styles" Type="${rel}/styles" Target="styles.xml"/>${sheets.map((_, i) => `<Relationship Id="rId${i + 1}" Type="${rel}/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`).join("")}</Relationships>`,
    ],
    [
      "xl/styles.xml",
      '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="12"/><name val="Calibri"/><color rgb="FF243746"/></font><font><b/><sz val="12"/><name val="Calibri"/><color rgb="FFFFFFFF"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0067A5"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="3"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>',
    ],
    ...sheets.map((s, i) => [
      `xl/worksheets/sheet${i + 1}.xml`,
      `<worksheet xmlns="${ns}"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${s.rows[0].map((_, j) => `<col min="${j + 1}" max="${j + 1}" width="${j === 0 ? 45 : j === 1 ? 60 : 28}" customWidth="1"/>`).join("")}</cols><sheetData>${s.rows.map((row, r) => `<row r="${r + 1}" ht="${r === 0 ? 32 : 90}" customHeight="1">${row.map((value, c) => `<c r="${String.fromCharCode(65 + c)}${r + 1}" t="inlineStr" s="${r === 0 ? 1 : 2}"><is><t xml:space="preserve">${xml(value)}</t></is></c>`).join("")}</row>`).join("")}</sheetData><autoFilter ref="A1:${String.fromCharCode(64 + s.rows[0].length)}${s.rows.length}"/></worksheet>`,
    ]),
  ];
  return {
    body: zip(files),
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: "xlsx",
  };
}
