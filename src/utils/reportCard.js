// =============================================================================
// REPORT CARD GENERATOR
// Turns consolidated per-student marks into a printable page — ONE student per
// A4 page — that opens in a new tab where the user can Print / Save as PDF.
//
// Layout: demo card 1's body (Term 1 [FA-1, SA-1] + Term 2 [FA-2, SA-2] +
// Grand Total + Grade + grading scale + obtained/%/result + remark + signatures)
// with demo card 2's header (school name + student info block).
// =============================================================================

// Term / exam column layout of the card.
const TERMS = [
  { term: 'Term 1', exams: ['FA-1', 'SA-1'] },
  { term: 'Term 2', exams: ['FA-2', 'SA-2'] },
];
const EXAM_ORDER = ['FA-1', 'SA-1', 'FA-2', 'SA-2'];

// 8-point grading scale (from the demo report card).
export function computeGrade(pct) {
  if (pct === null || pct === undefined || Number.isNaN(pct)) return '-';
  if (pct >= 91) return 'A1';
  if (pct >= 81) return 'A2';
  if (pct >= 71) return 'B1';
  if (pct >= 61) return 'B2';
  if (pct >= 51) return 'C1';
  if (pct >= 41) return 'C2';
  if (pct >= 33) return 'D';
  return 'E';
}

const GRADE_SCALE_TEXT =
  '8-Point Grading Scale:  A1 (91-100%)  A2 (81-90%)  B1 (71-80%)  B2 (61-70%)  ' +
  'C1 (51-60%)  C2 (41-50%)  D (33-40%)  E (0-32%)';

function esc(v) {
  if (v === null || v === undefined) return '';
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return esc(d);
  const dd = String(dt.getDate()).padStart(2, '0');
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${dt.getFullYear()}`;
}

// Group a student's flat marks[] into { subject -> { exam -> markRow } }.
export function pivotStudentMarks(marks = []) {
  const bySubject = {};
  for (const m of marks) {
    if (!EXAM_ORDER.includes(m.examType)) continue; // ignore legacy exam types on the card
    if (!bySubject[m.subject]) bySubject[m.subject] = {};
    bySubject[m.subject][m.examType] = m;
  }
  return bySubject;
}

// Representative max per exam across all subjects (for the column headers "(10)"/"(40)").
function examMaxes(marks = []) {
  const maxes = {};
  for (const m of marks) {
    if (!EXAM_ORDER.includes(m.examType)) continue;
    if (m.maxMarks && (!maxes[m.examType] || m.maxMarks > maxes[m.examType])) {
      maxes[m.examType] = m.maxMarks;
    }
  }
  return maxes;
}

// Render a single exam cell value: number, "AB" (absent), or "-" (not entered).
function cellValue(mark) {
  if (!mark) return '-';
  if (mark.isAbsent) return 'AB';
  if (mark.marksObtained === null || mark.marksObtained === undefined) return '-';
  return String(mark.marksObtained);
}

// Build the marks table + totals for one student. Returns { html, obtained, total, pct }.
function buildMarksTable(student) {
  const pivot = pivotStudentMarks(student.marks);
  const maxes = examMaxes(student.marks);
  const subjects = Object.keys(pivot).sort();

  let grandObtained = 0;
  let grandMax = 0;
  const termTotals = {}; // exam -> obtained sum (for the Total row)
  EXAM_ORDER.forEach((e) => { termTotals[e] = { obt: 0, has: false }; });

  const rows = subjects.map((subject) => {
    const marksByExam = pivot[subject];
    let subjObtained = 0;
    let subjMax = 0;

    const examCells = EXAM_ORDER.map((exam) => {
      const mk = marksByExam[exam];
      if (mk && !(mk.marksObtained === null && !mk.isAbsent)) {
        const obt = mk.isAbsent ? 0 : Number(mk.marksObtained || 0);
        subjObtained += obt;
        subjMax += mk.maxMarks || 0;
        termTotals[exam].obt += obt;
        termTotals[exam].has = true;
      }
      return `<td class="num">${esc(cellValue(mk))}</td>`;
    }).join('');

    grandObtained += subjObtained;
    grandMax += subjMax;
    const subjPct = subjMax ? (subjObtained / subjMax) * 100 : null;

    return `<tr>
      <td class="subj">${esc(subject)}</td>
      ${examCells}
      <td class="num strong">${subjMax ? subjObtained : '-'}</td>
      <td class="grade">${computeGrade(subjPct)}</td>
    </tr>`;
  }).join('');

  const totalCells = EXAM_ORDER.map(
    (e) => `<td class="num strong">${termTotals[e].has ? termTotals[e].obt : '-'}</td>`
  ).join('');

  const overallPct = grandMax ? (grandObtained / grandMax) * 100 : null;

  const table = `
    <table class="marks">
      <thead>
        <tr>
          <th rowspan="2" class="subj-h">Subject</th>
          ${TERMS.map((t) => `<th colspan="${t.exams.length}">${t.term}</th>`).join('')}
          <th rowspan="2">Grand Total${grandMax ? ` (${grandMax})` : ''}</th>
          <th rowspan="2">Grade</th>
        </tr>
        <tr>
          ${EXAM_ORDER.map(
            (e) => `<th class="exam-h">${e}${maxes[e] ? `<br><span class="mm">(${maxes[e]})</span>` : ''}</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td class="subj" colspan="${EXAM_ORDER.length + 3}" style="text-align:center;color:#888">No marks entered</td></tr>`}
        <tr class="total-row">
          <td class="subj strong">Total</td>
          ${totalCells}
          <td class="num strong">${grandMax ? grandObtained : '-'}</td>
          <td class="grade">${computeGrade(overallPct)}</td>
        </tr>
      </tbody>
    </table>`;

  return { html: table, obtained: grandObtained, total: grandMax, pct: overallPct };
}

// Pick a remark to show at the bottom (prefer the latest term's non-empty remark).
function pickRemark(student) {
  const order = ['SA-2', 'FA-2', 'SA-1', 'FA-1'];
  for (const exam of order) {
    const m = (student.marks || []).find((x) => x.examType === exam && x.remark && x.remark.trim());
    if (m) return m.remark.trim();
  }
  const any = (student.marks || []).find((x) => x.remark && x.remark.trim());
  return any ? any.remark.trim() : '';
}

function buildOneCard(student, meta) {
  const { html: marksTable, obtained, total, pct } = buildMarksTable(student);
  const pctText = total ? `${(Math.round(pct * 100) / 100).toFixed(2)}%` : '-';
  const grade = computeGrade(total ? pct : null);
  const result = total ? (pct >= 33 ? 'Pass' : 'Fail') : '-';
  const remark = pickRemark(student);
  const att = student.attendance || {};
  const classLabel = meta.section ? `${meta.className} (Section - ${meta.section})` : meta.className;

  const logo = meta.schoolLogo
    ? `<img class="logo" src="${esc(meta.schoolLogo)}" alt="" onerror="this.style.display='none'">`
    : '';

  return `
  <section class="card">
    <div class="hdr">
      ${logo}
      <div class="hdr-txt">
        <h1>${esc(meta.schoolName)}</h1>
        ${meta.address ? `<div class="addr">${esc(meta.address)}</div>` : ''}
        <div class="sub">Report Card${meta.sessionLabel ? ` &middot; Academic Session ${esc(meta.sessionLabel)}` : ''}</div>
      </div>
    </div>

    <table class="info">
      <tr>
        <td class="k">Admission No.</td><td class="v">${esc(student.admissionNumber || '')}</td>
        <td class="k">Roll No.</td><td class="v">${esc(student.rollNumber || '')}</td>
      </tr>
      <tr>
        <td class="k">Student's Name</td><td class="v">${esc(student.name || '')}</td>
        <td class="k">Date of Birth</td><td class="v">${esc(fmtDate(student.dateOfBirth))}</td>
      </tr>
      <tr>
        <td class="k">Father's Name</td><td class="v">${esc(student.fatherName || '')}</td>
        <td class="k">Mother's Name</td><td class="v">${esc(student.motherName || '')}</td>
      </tr>
      <tr>
        <td class="k">Class</td><td class="v">${esc(classLabel)}</td>
        <td class="k">Category</td><td class="v">${esc(student.category || '')}</td>
      </tr>
    </table>

    ${marksTable}

    <div class="scale">${esc(GRADE_SCALE_TEXT)}</div>

    <table class="summary">
      <tr>
        <td class="k">Obtained</td><td class="v">${total ? obtained : '-'}</td>
        <td class="k">Total</td><td class="v">${total || '-'}</td>
        <td class="k">Percentage</td><td class="v">${pctText}</td>
        <td class="k">Grade</td><td class="v">${grade}</td>
        <td class="k">Result</td><td class="v">${result}</td>
      </tr>
    </table>

    <table class="summary">
      <tr>
        <td class="k">Total Working Days</td><td class="v">${att.total ?? ''}</td>
        <td class="k">Total Present Days</td><td class="v">${att.present ?? ''}</td>
        <td class="k">Attendance %</td><td class="v">${att.percentage != null ? att.percentage + '%' : ''}</td>
      </tr>
    </table>

    <div class="remark"><span class="k">Remarks:</span> ${esc(remark)}</div>

    <div class="signs">
      <div class="sign">Parent Signature</div>
      <div class="sign">Class Teacher</div>
      <div class="sign">Principal</div>
    </div>
  </section>`;
}

const STYLES = `
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; margin: 0; color: #1a1a1a; background: #f3f4f6; }
  .toolbar { position: sticky; top: 0; background: #5B3A8C; color: #fff; padding: 12px 20px;
             display: flex; gap: 12px; align-items: center; justify-content: space-between; }
  .toolbar button { background: #fff; color: #5B3A8C; border: 0; border-radius: 8px;
             padding: 8px 18px; font-size: 14px; font-weight: 700; cursor: pointer; }
  .toolbar .hint { font-size: 12px; opacity: .9; }
  .sheet { max-width: 800px; margin: 16px auto; }
  .card { background: #fff; border: 1px solid #333; padding: 22px 26px; margin: 0 auto 16px;
          width: 800px; }
  .hdr { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #333;
         padding-bottom: 10px; }
  .hdr .logo { width: 64px; height: 64px; object-fit: contain; }
  .hdr-txt { flex: 1; text-align: center; }
  .hdr-txt h1 { margin: 0; font-size: 22px; letter-spacing: .5px; text-transform: uppercase; }
  .hdr-txt .addr { font-size: 11px; color: #444; margin-top: 2px; }
  .hdr-txt .sub { font-size: 13px; font-weight: 700; margin-top: 4px; }
  table { border-collapse: collapse; width: 100%; }
  .info { margin: 12px 0; }
  .info td { border: 1px solid #999; padding: 5px 8px; font-size: 12px; }
  .info .k { background: #f2f2f2; font-weight: 700; width: 15%; white-space: nowrap; }
  .info .v { width: 35%; }
  .marks th, .marks td { border: 1px solid #333; padding: 4px 6px; font-size: 12px; text-align: center; }
  .marks thead th { background: #f2f2f2; }
  .marks .subj-h, .marks .subj { text-align: left; }
  .marks .exam-h .mm { font-weight: 400; font-size: 10px; color: #555; }
  .marks .num { text-align: center; }
  .marks .strong { font-weight: 700; }
  .marks .grade { font-weight: 700; }
  .marks .total-row td { background: #fafafa; }
  .scale { font-size: 10px; color: #333; border: 1px solid #999; border-top: 0;
           padding: 4px 6px; }
  .summary { margin-top: 10px; }
  .summary td { border: 1px solid #999; padding: 5px 8px; font-size: 12px; text-align: center; }
  .summary .k { background: #f2f2f2; font-weight: 700; }
  .remark { margin-top: 10px; font-size: 12px; border: 1px solid #999; padding: 8px;
            min-height: 34px; }
  .remark .k { font-weight: 700; }
  .signs { display: flex; justify-content: space-between; margin-top: 40px; }
  .signs .sign { border-top: 1px solid #333; padding-top: 4px; font-size: 12px; width: 28%;
                 text-align: center; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .sheet { margin: 0; max-width: none; }
    .card { border: 1px solid #333; margin: 0; width: auto; page-break-after: always; }
    .card:last-child { page-break-after: auto; }
    @page { size: A4; margin: 10mm; }
  }
`;

// Build the full standalone HTML document for the given students.
export function buildReportCardsHtml(students, meta) {
  const cards = students.map((s) => buildOneCard(s, meta)).join('\n');
  const title = `Report Cards — ${meta.className || ''}${meta.section ? '-' + meta.section : ''}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${esc(title)}</title>
  <style>${STYLES}</style>
</head>
<body>
  <div class="toolbar">
    <span>${esc(title)} &middot; ${students.length} student${students.length === 1 ? '' : 's'}</span>
    <span class="hint">Use "Save as PDF" in the print dialog to download.</span>
    <button onclick="window.print()">Print / Save as PDF</button>
  </div>
  <div class="sheet">
    ${cards}
  </div>
</body>
</html>`;
}

// Open the report cards in a new tab for preview + printing.
export function printReportCards(students, meta) {
  if (!students || students.length === 0) {
    alert('No students to print.');
    return;
  }
  const html = buildReportCardsHtml(students, meta);
  const w = window.open('', '_blank');
  if (!w) {
    alert('Please allow pop-ups for this site to open the report cards.');
    return;
  }
  w.document.open();
  w.document.write(html);
  w.document.close();
  w.focus();
}

export default { computeGrade, pivotStudentMarks, buildReportCardsHtml, printReportCards };
