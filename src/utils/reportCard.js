// =============================================================================
// REPORT CARD GENERATOR
// Turns consolidated per-student marks into a printable page — ONE student per
// A4 page — that opens in a new tab where the user can Print / Save as PDF.
//
// Layout: demo card 1's body (Term 1 [FA-1, SA-1] + Term 2 [FA-2, SA-2] +
// Grand Total + Grade + grading scale + obtained/%/result + remark + signatures)
// with demo card 2's header (school name + student info block).
// =============================================================================

// Canonical term / exam layout. UT-1/UT-2 live inside their term alongside
// the formative/summative exams. The card only renders the exams that actually
// have marks for the class being printed (see resolveExamLayout), so a term or
// a UT column simply disappears when no marks were uploaded for it.
const TERM_LAYOUT = [
  { term: 'Term 1', exams: ['UT-1', 'FA-1', 'SA-1'] },
  { term: 'Term 2', exams: ['UT-2', 'FA-2', 'SA-2'] },
];
const CANONICAL_ORDER = TERM_LAYOUT.flatMap((t) => t.exams);
// Fallback layout for a class with no marks at all — keeps the old FA/SA look
// so an empty card doesn't render blank UT columns.
const FALLBACK_ORDER = ['FA-1', 'SA-1', 'FA-2', 'SA-2'];

// Inspect the students being printed and build the exam-column layout from the
// exam types that actually have marks. Canonical order is preserved; any
// unrecognised exam type is appended under an "Other" term so nothing is
// silently dropped.
function resolveExamLayout(students = []) {
  const present = new Set();
  students.forEach((s) =>
    (s.marks || []).forEach((m) => { if (m && m.examType) present.add(m.examType); })
  );

  const known = CANONICAL_ORDER.filter((e) => present.has(e));
  const extras = [...present].filter((e) => !CANONICAL_ORDER.includes(e)).sort();

  if (known.length === 0 && extras.length === 0) {
    // No marks anywhere — fall back to the classic FA/SA columns.
    return {
      examOrder: FALLBACK_ORDER,
      terms: [
        { term: 'Term 1', exams: ['FA-1', 'SA-1'] },
        { term: 'Term 2', exams: ['FA-2', 'SA-2'] },
      ],
    };
  }

  const terms = TERM_LAYOUT
    .map((t) => ({ term: t.term, exams: t.exams.filter((e) => present.has(e)) }))
    .filter((t) => t.exams.length > 0);
  if (extras.length) terms.push({ term: 'Other', exams: extras });

  return { examOrder: [...known, ...extras], terms };
}

// 8-point grading scale (from the demo report card). Single source of truth for
// both computeGrade() and the printed Grading Scale box in the lower section.
const GRADE_SCALE = [
  { grade: 'A1', range: '91-100%' },
  { grade: 'A2', range: '81-90%' },
  { grade: 'B1', range: '71-80%' },
  { grade: 'B2', range: '61-70%' },
  { grade: 'C1', range: '51-60%' },
  { grade: 'C2', range: '41-50%' },
  { grade: 'D', range: '33-40%' },
  { grade: 'E', range: '0-32%' },
];

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

// Co-scholastic areas printed in the lower section. Grades are shown only if the
// data model carries them (it currently doesn't), so the Grade cell stays blank.
const CO_SCHOLASTIC_AREAS = [
  'Academic Performance',
  'Co-curricular Activities',
  'Behaviour & Discipline',
];

// Subject display order the school asked for. Subjects not in this list are
// appended (alphabetically) after these, so nothing is dropped.
const SUBJECT_PRIORITY = [
  'Hindi', 'English', 'Mathematics', 'Science',
  'Social Science', 'Computer', 'General Knowledge', 'Drawing',
];

// Normalise raw subject strings (from the DB) to their canonical display name,
// so common variants line up with the priority order and read cleanly.
const SUBJECT_ALIASES = {
  'maths': 'Mathematics',
  'math': 'Mathematics',
  'mathematics': 'Mathematics',
  'sst': 'Social Science',
  'social studies': 'Social Science',
  'social science': 'Social Science',
  'g.k': 'General Knowledge',
  'g.k.': 'General Knowledge',
  'gk': 'General Knowledge',
  'general knowledge': 'General Knowledge',
};

function displaySubject(raw) {
  const key = String(raw || '').trim().toLowerCase().replace(/\s+/g, ' ');
  return SUBJECT_ALIASES[key] || String(raw || '').trim();
}

// Order raw subject keys by the requested priority (using their display name),
// then alphabetically for any extras.
function orderSubjects(subjects = []) {
  return subjects.slice().sort((a, b) => {
    const ia = SUBJECT_PRIORITY.indexOf(displaySubject(a));
    const ib = SUBJECT_PRIORITY.indexOf(displaySubject(b));
    const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia;
    const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib;
    if (ra !== rb) return ra - rb;
    return displaySubject(a).localeCompare(displaySubject(b));
  });
}

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

// Group a student's flat marks[] into { subject -> { exam -> markRow } },
// keeping only the exams in the resolved column layout.
export function pivotStudentMarks(marks = [], examOrder = CANONICAL_ORDER) {
  const bySubject = {};
  for (const m of marks) {
    if (!examOrder.includes(m.examType)) continue; // outside the card's columns
    if (!bySubject[m.subject]) bySubject[m.subject] = {};
    bySubject[m.subject][m.examType] = m;
  }
  return bySubject;
}

// Representative max per exam across all subjects (for the column headers "(10)"/"(40)").
function examMaxes(marks = [], examOrder = CANONICAL_ORDER) {
  const maxes = {};
  for (const m of marks) {
    if (!examOrder.includes(m.examType)) continue;
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
// `layout` = { examOrder, terms } resolved once for the whole print batch so
// every card shares the same columns.
function buildMarksTable(student, layout) {
  const { examOrder, terms } = layout;
  const pivot = pivotStudentMarks(student.marks, examOrder);
  const maxes = examMaxes(student.marks, examOrder);
  const subjects = orderSubjects(Object.keys(pivot));

  let grandObtained = 0;
  let grandMax = 0;
  const termTotals = {}; // exam -> obtained sum (for the Total row)
  examOrder.forEach((e) => { termTotals[e] = { obt: 0, has: false }; });

  const rows = subjects.map((subject, i) => {
    const marksByExam = pivot[subject];
    let subjObtained = 0;
    let subjMax = 0;

    const examCells = examOrder.map((exam) => {
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
      <td class="num sno">${i + 1}</td>
      <td class="subj">${esc(displaySubject(subject))}</td>
      ${examCells}
      <td class="num strong">${subjMax ? subjObtained : '-'}</td>
      <td class="grade">${computeGrade(subjPct)}</td>
    </tr>`;
  }).join('');

  const totalCells = examOrder.map(
    (e) => `<td class="num strong">${termTotals[e].has ? termTotals[e].obt : '-'}</td>`
  ).join('');

  const overallPct = grandMax ? (grandObtained / grandMax) * 100 : null;

  const table = `
    <table class="marks">
      <thead>
        <tr>
          <th rowspan="2" class="sno-h">S.No.</th>
          <th rowspan="2" class="subj-h">Subject</th>
          ${terms.map((t) => `<th colspan="${t.exams.length}">${t.term}</th>`).join('')}
          <th rowspan="2">Grand Total${grandMax ? ` (${grandMax})` : ''}</th>
          <th rowspan="2">Grade</th>
        </tr>
        <tr>
          ${examOrder.map(
            (e) => `<th class="exam-h">${e}${maxes[e] ? `<br><span class="mm">(${maxes[e]})</span>` : ''}</th>`
          ).join('')}
        </tr>
      </thead>
      <tbody>
        ${rows || `<tr><td class="subj" colspan="${examOrder.length + 4}" style="text-align:center;color:#888">No marks entered</td></tr>`}
        <tr class="total-row">
          <td class="subj strong" colspan="2">Total</td>
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
  const order = ['SA-2', 'FA-2', 'UT-2', 'SA-1', 'FA-1', 'UT-1'];
  for (const exam of order) {
    const m = (student.marks || []).find((x) => x.examType === exam && x.remark && x.remark.trim());
    if (m) return m.remark.trim();
  }
  const any = (student.marks || []).find((x) => x.remark && x.remark.trim());
  return any ? any.remark.trim() : '';
}

function buildOneCard(student, meta, layout) {
  const { html: marksTable, obtained, total, pct } = buildMarksTable(student, layout);
  const pctText = total ? `${(Math.round(pct * 100) / 100).toFixed(2)}%` : '-';
  const grade = computeGrade(total ? pct : null);
  const result = total ? (pct >= 33 ? 'Pass' : 'Fail') : '-';
  const remark = pickRemark(student);
  const att = student.attendance || {};
  const workingDays = att.total ?? null;
  const presentDays = att.present ?? null;
  const absentDays = (workingDays != null && presentDays != null)
    ? Math.max(0, workingDays - presentDays)
    : null;
  const classLabel = meta.section ? `${meta.className} (Section - ${meta.section})` : meta.className;

  const logo = meta.schoolLogo
    ? `<img class="logo" src="${esc(meta.schoolLogo)}" alt="" onerror="this.style.display='none'">`
    : '';
  // Board affiliation, top-right: show the board logo if the school has one, and
  // fall back to the board name text if the image is missing.
  const board = meta.board
    ? `<div class="hdr-board">
        ${meta.boardLogo
          ? `<img class="hdr-board-logo" src="${esc(meta.boardLogo)}" alt="${esc(meta.board)}"
                onerror="this.style.display='none'; if (this.nextElementSibling) this.nextElementSibling.style.display='block';">`
          : ''}
        <div class="hdr-board-txt"${meta.boardLogo ? ' style="display:none"' : ''}>${esc(meta.board)}</div>
      </div>`
    : '';

  // Lower section: Co-Scholastic Areas | Grade | Attendance | Grading Scale.
  // Co-scholastic grades are blank until the data model carries them.
  const coScholasticRows = CO_SCHOLASTIC_AREAS.map((area, i) => {
    const trailing = i === 0
      ? `<td class="att-cell" rowspan="${CO_SCHOLASTIC_AREAS.length}">
           <div class="att-line"><span>Total Working Days</span><span class="att-v">${workingDays ?? '—'}</span></div>
           <div class="att-line"><span>Total Present Days</span><span class="att-v">${presentDays ?? '—'}</span></div>
           <div class="att-line"><span>Total Absent Days</span><span class="att-v">${absentDays ?? '—'}</span></div>
         </td>
         <td class="scale-cell" rowspan="${CO_SCHOLASTIC_AREAS.length}">
           ${GRADE_SCALE.map((g) => `<div class="scale-line"><span class="scale-g">${g.grade}</span><span>${g.range}</span></div>`).join('')}
         </td>`
      : '';
    return `<tr>
      <td class="cs-area">${esc(area)}</td>
      <td class="cs-grade"></td>
      ${trailing}
    </tr>`;
  }).join('');

  return `
  <section class="card">
    <div class="hdr">
      ${logo}
      <div class="hdr-txt">
        <h1>${esc(meta.schoolName)}</h1>
        ${meta.address ? `<div class="addr">${esc(meta.address)}</div>` : ''}
        <div class="sub">Report Card</div>
        ${meta.sessionLabel ? `<div class="session">SESSION ${esc(meta.sessionLabel)}</div>` : ''}
      </div>
      ${board}
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
        <td class="k">Class</td><td class="v" colspan="3">${esc(classLabel)}</td>
      </tr>
    </table>

    ${marksTable}

    <table class="summary">
      <tr>
        <td class="k">Obtained</td><td class="v">${total ? obtained : '-'}</td>
        <td class="k">Total</td><td class="v">${total || '-'}</td>
        <td class="k">Percentage</td><td class="v">${pctText}</td>
        <td class="k">Grade</td><td class="v">${grade}</td>
        <td class="k">Result</td><td class="v">${result}</td>
      </tr>
    </table>

    <table class="coscho">
      <thead>
        <tr>
          <th>Co-Scholastic Areas</th>
          <th>Grade</th>
          <th>Attendance</th>
          <th>Grading Scale</th>
        </tr>
      </thead>
      <tbody>
        ${coScholasticRows}
      </tbody>
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
  .sheet { max-width: 210mm; margin: 16px auto; }
  .card { background: #fff; border: 1px solid #333; padding: 14mm; margin: 0 auto 16px;
          width: 210mm; min-height: 297mm; box-sizing: border-box;
          display: flex; flex-direction: column; }
  .hdr { display: flex; align-items: center; gap: 16px; border-bottom: 2px solid #333;
         padding-bottom: 10px; }
  .hdr .logo { width: 64px; height: 64px; object-fit: contain; }
  .hdr-txt { flex: 1; text-align: center; }
  .hdr-txt h1 { margin: 0; font-size: 22px; letter-spacing: .5px; text-transform: uppercase; }
  .hdr-txt .addr { font-size: 11px; color: #444; margin-top: 2px; }
  .hdr-txt .sub { font-size: 13px; font-weight: 700; margin-top: 4px; }
  .hdr-txt .session { font-size: 12px; font-weight: 700; letter-spacing: .5px; margin-top: 2px; }
  .hdr-board { width: 84px; flex-shrink: 0; text-align: center; }
  .hdr-board-logo { width: 72px; height: 72px; object-fit: contain; }
  .hdr-board-txt { font-size: 11px; font-weight: 700; color: #333; line-height: 1.25; }
  table { border-collapse: collapse; width: 100%; }
  .info { margin: 12px 0; }
  .info td { border: 1px solid #999; padding: 5px 8px; font-size: 12px; }
  .info .k { background: #f2f2f2; font-weight: 700; width: 15%; white-space: nowrap; }
  .info .v { width: 35%; }
  .marks th, .marks td { border: 1px solid #333; padding: 4px 6px; font-size: 12px; text-align: center; }
  .marks thead th { background: #f2f2f2; }
  .marks .sno-h, .marks .sno { width: 36px; }
  .marks .subj-h, .marks .subj { text-align: left; }
  .marks .exam-h .mm { font-weight: 400; font-size: 10px; color: #555; }
  .marks .num { text-align: center; }
  .marks .strong { font-weight: 700; }
  .marks .grade { font-weight: 700; }
  .marks .total-row td { background: #fafafa; }
  .summary { margin-top: 10px; }
  .summary td { border: 1px solid #999; padding: 5px 8px; font-size: 12px; text-align: center; }
  .summary .k { background: #f2f2f2; font-weight: 700; }
  .coscho { margin-top: 10px; table-layout: fixed; }
  .coscho th, .coscho td { border: 1px solid #999; padding: 5px 8px; font-size: 11px;
                           vertical-align: top; }
  .coscho thead th { background: #f2f2f2; font-size: 12px; text-align: center; }
  .coscho th:nth-child(1), .coscho td.cs-area { width: 28%; }
  .coscho th:nth-child(2), .coscho td.cs-grade { width: 14%; text-align: center; }
  .coscho th:nth-child(3), .coscho td.att-cell { width: 30%; }
  .coscho th:nth-child(4), .coscho td.scale-cell { width: 28%; }
  .coscho .cs-area { font-weight: 600; }
  .att-line, .scale-line { display: flex; justify-content: space-between; gap: 8px;
                           padding: 1px 0; }
  .att-line .att-v { font-weight: 700; }
  .scale-line .scale-g { font-weight: 700; width: 26px; }
  .remark { margin-top: 10px; font-size: 12px; border: 1px solid #999; padding: 8px;
            min-height: 44px; }
  .remark .k { font-weight: 700; }
  .signs { display: flex; justify-content: space-between; margin-top: auto; padding-top: 30px; }
  .signs .sign { border-top: 1px solid #333; padding-top: 4px; font-size: 12px; width: 28%;
                 text-align: center; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .sheet { margin: 0; max-width: none; }
    /* min-height a few mm UNDER the printable area (297 - 2*10 = 277mm) so
       rounding never spills a card onto a blank second page. */
    .card { width: 100%; min-height: 272mm; margin: 0; padding: 12mm; page-break-after: always; page-break-inside: avoid; }
    .card:last-child { page-break-after: auto; }
    @page { size: A4; margin: 10mm; }
  }
`;

// Build the full standalone HTML document for the given students.
export function buildReportCardsHtml(students, meta) {
  // Resolve the exam columns once so every card in this batch shares the same
  // layout — the columns are whichever exam types have marks for these students.
  const layout = resolveExamLayout(students);
  const cards = students.map((s) => buildOneCard(s, meta, layout)).join('\n');
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
