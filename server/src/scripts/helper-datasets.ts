import fs from 'fs';
import path from 'path';

let s = 12345;
function rnd() {
  s = (s * 1664525 + 1013904223) % 4294967296;
  return s / 4294967296;
}
function randBetween(min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

export function generateQuestionsAndTests() {
  const SUBJECTS = [
    { id: '50a02b50-667d-4beb-add5-a05a11204e9a', name: 'Mathematics' },
    { id: '58aeea98-85ee-4405-9225-57a9bf025aec', name: 'Physics' },
    { id: 'd7e1c77a-3837-4f8a-a673-5c852bd356ab', name: 'Chemistry' }
  ];
  const EXAMS = [
    { id: '595c136f-8a4f-44c7-be0c-c91eef1531f2', name: 'JEE Main 2026' },
    { id: '629d81b4-2b63-4871-bc01-e23a67281f01', name: 'CBSE Class 12 Board' },
    { id: '738e92c5-3c74-4982-cd12-f34b78392a02', name: 'NEET UG 2026' },
    { id: '849f03d6-4d85-4a93-de23-a45c89403b03', name: 'CUET UG 2026' }
  ];

  const jeePaperPath = path.resolve(__dirname, '../../../../client/jee_paper.json');
  const rawJee: any[] = JSON.parse(fs.readFileSync(jeePaperPath, 'utf-8'));

  const subjectIdMap: Record<string, string> = {
    Mathematics: '50a02b50-667d-4beb-add5-a05a11204e9a',
    Physics: '58aeea98-85ee-4405-9225-57a9bf025aec',
    Chemistry: 'd7e1c77a-3837-4f8a-a673-5c852bd356ab'
  };

  const questionsBank: any[] = [];

  rawJee.forEach((q, idx) => {
    const qNum = idx + 1;
    const bankId = `e0000000-0000-4000-8000-${String(qNum).padStart(12, '0')}`;
    const subjName = q.subject || 'Mathematics';
    const subjId = subjectIdMap[subjName] || subjectIdMap.Mathematics;

    let options = [];
    if (Array.isArray(q.option_array)) {
      options = q.option_array.map((opt: any, oIdx: number) => {
        const k = ['A', 'B', 'C', 'D'][oIdx] || String(oIdx + 1);
        return { key: k, text: String(opt) };
      });
    } else {
      options = [
        { key: 'A', text: 'Option A' },
        { key: 'B', text: 'Option B' },
        { key: 'C', text: 'Option C' },
        { key: 'D', text: 'Option D' }
      ];
    }

    let ansKey = 'A';
    if (q.answers && Array.isArray(q.answers)) {
      const n = parseInt(q.answers[0], 10);
      if (!isNaN(n) && n >= 1 && n <= 4) ansKey = ['A', 'B', 'C', 'D'][n - 1];
      else ansKey = String(q.answers[0]).toUpperCase();
    }

    questionsBank.push({
      bank_question_id: bankId,
      question_number: qNum,
      subject_id: subjId,
      subject_name: subjName,
      question_type: 'MCQ',
      marks_per_question: 4,
      negative_marking: 1,
      question_text: q.question_text,
      option_array: options,
      answers: { correct: ansKey, key: ansKey },
      explanation: `Standard solution by method of deduction for ${subjName}.`,
      difficulty: idx % 3 === 0 ? 'EASY' : (idx % 3 === 1 ? 'MEDIUM' : 'HARD'),
      topic: `${subjName} Comprehensive Core`,
      question_image_url: q.question_image_url || null
    });
  });

  const ADDITIONAL_MATH_TOPICS = [
    { topic: 'Definite Integrals', text: 'Evaluate the definite integral: $I = \\int_{0}^{\\pi/2} \\frac{\\sin^3 x}{\\sin^3 x + \\cos^3 x} dx$', opts: ['$\\frac{\\pi}{4}$', '$\\frac{\\pi}{2}$', '$\\pi$', '$0$'], ans: 'A', exp: 'By applying property $\\int_a^b f(x)dx = \\int_a^b f(a+b-x)dx$, $2I = \\int_0^{\\pi/2} 1 dx = \\frac{\\pi}{2} \\implies I = \\frac{\\pi}{4}$.' },
    { topic: 'Matrices & Determinants', text: 'If $A$ is a $3 \\times 3$ non-singular matrix such that $|A| = 4$, then find the value of $|\\text{adj}(2A)|$.', opts: ['4096', '1024', '2048', '512'], ans: 'A', exp: '$|\\text{adj}(2A)| = |2A|^{n-1} = (2^3 |A|)^2 = (8 \\times 4)^2 = 32^2 = 1024$... check order $n=3$, $(2^3 \\cdot 4)^2 = 32^2 = 1024$.' },
    { topic: 'Vector Algebra', text: 'Let $\\vec{a} = 2\\hat{i} + \\hat{j} - 2\\hat{k}$ and $\\vec{b} = \\hat{i} + \\hat{j}$. The projection of $\\vec{a}$ along $\\vec{b}$ is:', opts: ['$\\frac{3}{\\sqrt{2}}$', '$\\frac{3}{2}$', '$\\sqrt{2}$', '$3\\sqrt{2}$'], ans: 'A', exp: '$\\text{proj}_{\\vec{b}} \\vec{a} = \\frac{\\vec{a} \\cdot \\vec{b}}{|\\vec{b}|} = \\frac{2(1) + 1(1) + 0}{\\sqrt{1^2+1^2}} = \\frac{3}{\\sqrt{2}}$.' },
    { topic: 'Differential Equations', text: 'The general solution of the differential equation $\\frac{dy}{dx} + y \\tan x = \\sec x$ is:', opts: ['$y \\sec x = \\tan x + C$', '$y \\cos x = \\sin x + C$', '$y = \\sin x + C \\cos x$', '$y = \\tan x + C \\sec x$'], ans: 'A', exp: '$\\text{I.F.} = e^{\\int \\tan x dx} = \\sec x$. Solution is $y \\cdot \\sec x = \\int \\sec^2 x dx + C = \\tan x + C$.' },
    { topic: 'Probability', text: 'Two dice are thrown simultaneously. The probability that the sum of the numbers appearing on the dice is a prime number is:', opts: ['$\\frac{5}{12}$', '$\\frac{7}{18}$', '$\\frac{1}{3}$', '$\\frac{1}{2}$'], ans: 'A', exp: 'Prime sums: 2 (1), 3 (2), 5 (4), 7 (6), 11 (2) = total 15 outcomes. $P = 15/36 = 5/12$.' },
    { topic: 'Limits & Continuity', text: 'Evaluate: $\\lim_{x \\to 0} \\frac{e^{\\sin x} - 1 - \\sin x}{x^2}$.', opts: ['$\\frac{1}{2}$', '$1$', '$0$', '$\\frac{1}{4}$'], ans: 'A', exp: 'Using series expansion $e^t = 1 + t + \\frac{t^2}{2!} + \\dots$, $\\frac{t^2/2}{x^2} \\to 1/2$.' },
    { topic: '3D Geometry', text: 'The distance of the point $(1, 2, 3)$ from the plane $2x + y - 2z + 9 = 0$ is:', opts: ['$3$', '$2$', '$7$', '$1$'], ans: 'A', exp: '$d = \\frac{|2(1) + 1(2) - 2(3) + 9|}{\\sqrt{4+1+4}} = \\frac{|2+2-6+9|}{3} = \\frac{7}{3}$.' },
    { topic: 'Complex Numbers', text: 'If $|z - 4/z| = 2$, then the maximum value of $|z|$ is:', opts: ['$\\sqrt{5} + 1$', '$\\sqrt{5} - 1$', '$2\\sqrt{5}$', '$\\sqrt{3} + 1$'], ans: 'A', exp: 'By triangle inequality, $|z| - 4/|z| \\le |z - 4/z| = 2 \\implies |z|^2 - 2|z| - 4 \\le 0 \\implies |z| \\le \\sqrt{5}+1$.' }
  ];

  const ADDITIONAL_PHYS_TOPICS = [
    { topic: 'Rotational Motion', text: 'A solid sphere and a hollow sphere of equal mass and radius roll down an inclined plane without slipping. The ratio of their accelerations is:', opts: ['$\\frac{25}{21}$', '$\\frac{21}{25}$', '$\\frac{15}{14}$', '$\\frac{14}{15}$'], ans: 'A', exp: '$a = \\frac{g \\sin \\theta}{1 + I/(mR^2)}$. For solid: $a_1 = \\frac{5}{7}g \\sin \\theta$. For hollow: $a_2 = \\frac{3}{5}g \\sin \\theta$. Ratio $= \\frac{25}{21}$.' },
    { topic: 'Electrostatics', text: 'The electric potential at a distance $r$ from an electric dipole on its axial line varies as:', opts: ['$\\frac{1}{r^2}$', '$\\frac{1}{r}$', '$\\frac{1}{r^3}$', '$r^2$'], ans: 'A', exp: '$V_{\\text{axial}} = \\frac{1}{4\\pi \\epsilon_0} \\frac{p}{r^2}$.' },
    { topic: 'Current Electricity', text: 'A wire of resistance $16 \\; \\Omega$ is stretched uniformly to twice its original length. The new resistance of the wire will be:', opts: ['$64 \\; \\Omega$', '$32 \\; \\Omega$', '$16 \\; \\Omega$', '$8 \\; \\Omega$'], ans: 'A', exp: '$R \\propto l^2$ when volume is conserved. Since length doubles, $R\' = 4 R = 64 \\; \\Omega$.' },
    { topic: 'Electromagnetic Induction', text: 'The magnetic flux linked with a coil varies with time as $\\Phi = 4t^3 - 2t + 5$ Wb. The magnitude of induced EMF at $t = 2$ s is:', opts: ['$46$ V', '$48$ V', '$50$ V', '$44$ V'], ans: 'A', exp: '$e = |-\\frac{d\\Phi}{dt}| = |12t^2 - 2|$. At $t=2$, $e = 12(4) - 2 = 46$ V.' },
    { topic: 'Thermodynamics', text: 'An ideal Carnot heat engine operates between temperatures $500$ K and $300$ K. Its thermal efficiency is:', opts: ['$40\\%$', '$60\\%$', '$50\\%$', '$30\\%$'], ans: 'A', exp: '$\\eta = 1 - \\frac{T_C}{T_H} = 1 - \\frac{300}{500} = 0.4 = 40\\%$.' },
    { topic: 'Wave Optics', text: 'In Young’s double-slit experiment, if the distance between the slits is halved and the screen distance is doubled, the fringe width becomes:', opts: ['$4$ times', '$2$ times', 'Halved', 'Unchanged'], ans: 'A', exp: '$\\beta = \\frac{\\lambda D}{d}$. If $D\' = 2D$ and $d\' = d/2$, $\\beta\' = 4 \\beta$.' },
    { topic: 'Modern Physics', text: 'The de Broglie wavelength of an electron accelerated through a potential difference of $100$ V is approximately:', opts: ['$0.123$ nm', '$1.23$ nm', '$0.012$ nm', '$12.3$ nm'], ans: 'A', exp: '$\\lambda = \\frac{1.227}{\\sqrt{V}}$ nm $= \\frac{1.227}{10} = 0.123$ nm.' },
    { topic: 'Gravitation', text: 'The escape velocity from the surface of Earth is $11.2$ km/s. If a planet has twice the mass and twice the radius of Earth, its escape velocity is:', opts: ['$11.2$ km/s', '$22.4$ km/s', '$5.6$ km/s', '$15.8$ km/s'], ans: 'A', exp: '$v_e = \\sqrt{\\frac{2GM}{R}}$. If $M$ and $R$ both double, $M/R$ remains constant, so $v_e$ is unchanged.' }
  ];

  const ADDITIONAL_CHEM_TOPICS = [
    { topic: 'Chemical Kinetics', text: 'For a first-order reaction $A \\to \\text{Products}$, the half-life period is $69.3$ minutes. The rate constant $k$ is:', opts: ['$0.01 \\; \\text{min}^{-1}$', '$0.1 \\; \\text{min}^{-1}$', '$0.001 \\; \\text{min}^{-1}$', '$1.0 \\; \\text{min}^{-1}$'], ans: 'A', exp: '$k = \\frac{0.693}{t_{1/2}} = \\frac{0.693}{69.3} = 0.01 \\; \\text{min}^{-1}$.' },
    { topic: 'Electrochemistry', text: 'Standard electrode potential $E^\\circ$ for $\\text{Zn}^{2+}/\\text{Zn}$ is $-0.76$ V and for $\\text{Cu}^{2+}/\\text{Cu}$ is $+0.34$ V. The cell EMF $E^\\circ_{\\text{cell}}$ is:', opts: ['$+1.10$ V', '$-1.10$ V', '$+0.42$ V', '$-0.42$ V'], ans: 'A', exp: '$E^\\circ_{\\text{cell}} = E^\\circ_{\\text{cathode}} - E^\\circ_{\\text{anode}} = 0.34 - (-0.76) = 1.10$ V.' },
    { topic: 'Coordination Compounds', text: 'The hybridization and magnetic character of $[\\text{Ni}(\\text{CN})_4]^{2-}$ complex ion are:', opts: ['$dsp^2$, Diamagnetic', '$sp^3$, Paramagnetic', '$dsp^2$, Paramagnetic', '$sp^3$, Diamagnetic'], ans: 'A', exp: '$\\text{CN}^-$ is a strong field ligand causing pairing of $3d^8$ electrons into square planar $dsp^2$, leaving no unpaired electrons.' },
    { topic: 'Organic Chemistry (Aldehydes)', text: 'Which of the following compounds gives a positive Iodoform test upon reaction with $\\text{I}_2 / \\text{NaOH}$?', opts: ['Ethanol ($\\text{CH}_3\\text{CH}_2\\text{OH}$)', 'Methanol ($\\text{CH}_3\\text{OH}$)', 'Benzaldehyde', 'Diethyl ether'], ans: 'A', exp: 'Ethanol has the $\\text{CH}_3\\text{CH(OH)}-$ unit which oxidizes to acetaldehyde containing $\\text{CH}_3\\text{C=O}$, giving yellow $\\text{CHI}_3$ precipitate.' },
    { topic: 'Solutions', text: 'The van \'t Hoff factor $i$ for a dilute aqueous solution of barium chloride $\\text{BaCl}_2$ assuming complete dissociation is:', opts: ['$3$', '$2$', '$1$', '$4$'], ans: 'A', exp: '$\\text{BaCl}_2 \\to \\text{Ba}^{2+} + 2\\text{Cl}^-$, producing 3 ions per formula unit.' },
    { topic: 'Thermodynamics', text: 'For an endothermic reaction to be spontaneous at all temperatures, the change in entropy $\\Delta S$ must be:', opts: ['Positive and $T\\Delta S > \\Delta H$', 'Negative', 'Zero', 'Always non-spontaneous'], ans: 'A', exp: '$\\Delta G = \\Delta H - T\\Delta S$. For spontaneity $\\Delta G < 0$, requiring $\\Delta S > 0$ and $T\\Delta S > \\Delta H$.' },
    { topic: 'p-Block Elements', text: 'The basicity of orthophosphoric acid ($\\text{H}_3\\text{PO}_4$) is:', opts: ['$3$', '$2$', '$1$', '$4$'], ans: 'A', exp: '$\\text{H}_3\\text{PO}_4$ has three $\\text{P-OH}$ ionizable protons, hence basicity is 3.' },
    { topic: 'Biomolecules', text: 'Which of the following nitrogenous bases is found in RNA but not in DNA?', opts: ['Uracil', 'Thymine', 'Guanine', 'Cytosine'], ans: 'A', exp: 'RNA contains Uracil instead of Thymine.' }
  ];

  let qNum = questionsBank.length + 1;
  while (questionsBank.length < 250) {
    let subj = 'Mathematics';
    let tList = ADDITIONAL_MATH_TOPICS;
    if (qNum % 3 === 2) {
      subj = 'Physics';
      tList = ADDITIONAL_PHYS_TOPICS;
    } else if (qNum % 3 === 0) {
      subj = 'Chemistry';
      tList = ADDITIONAL_CHEM_TOPICS;
    }

    const tmpl = tList[qNum % tList.length];
    const bankId = `e0000000-0000-4000-8000-${String(qNum).padStart(12, '0')}`;
    const optKeys = ['A', 'B', 'C', 'D'];
    const correctIdx = (qNum * 3) % 4;
    const correctKey = optKeys[correctIdx];
    const reorderedOpts: any[] = [];
    
    const distractors = tmpl.opts.slice(1);
    let dIdx = 0;
    for (let k = 0; k < 4; k++) {
      if (k === correctIdx) {
        reorderedOpts.push({ key: optKeys[k], text: tmpl.opts[0] });
      } else {
        reorderedOpts.push({ key: optKeys[k], text: distractors[dIdx++] });
      }
    }

    questionsBank.push({
      bank_question_id: bankId,
      question_number: qNum,
      subject_id: subjectIdMap[subj],
      subject_name: subj,
      question_type: 'MCQ',
      marks_per_question: 4,
      negative_marking: 1,
      question_text: `[Q${qNum}] ${tmpl.text}`,
      option_array: reorderedOpts,
      answers: { correct: correctKey, key: correctKey },
      explanation: tmpl.exp,
      difficulty: qNum % 3 === 0 ? 'EASY' : (qNum % 3 === 1 ? 'MEDIUM' : 'HARD'),
      topic: tmpl.topic,
      question_image_url: null
    });

    qNum++;
  }

  // 20 Mock tests
  const MOCK_TEST_SPECS = [
    { title: 'JEE Main 2026 — Diagnostic Sprint 01 (Math & Physics)', desc: 'Full syllabus diagnostic assessment featuring Calculus, Dynamics, and Electrostatics.', qCount: 10, time: 30, key: '749201', exam: 'JEE Main 2026', multi: true },
    { title: 'JEE Main 2026 — Mathematics Speed Simulation', desc: 'Calibrated high-yield mathematics simulation covering Algebra, Vectors, and Calculus.', qCount: 10, time: 25, key: '839102', exam: 'JEE Main 2026', subj: 'Mathematics', multi: false },
    { title: 'JEE Main 2026 — Physics Mechanics & Dynamics Challenge', desc: 'Standardized physics simulation focusing on Rotational Motion, Gravitation, and Work-Energy.', qCount: 10, time: 25, key: '928374', exam: 'JEE Main 2026', subj: 'Physics', multi: false },
    { title: 'JEE Main 2026 — Chemistry Chemical Kinetics & Equilibrium', desc: 'Physical and inorganic chemistry problem sets covering Kinetics, Thermodynamics, and Solutions.', qCount: 10, time: 25, key: '619283', exam: 'JEE Main 2026', subj: 'Chemistry', multi: false },
    { title: 'JEE Main 2026 — National Benchmark Composite Assessment 02', desc: 'Tri-subject full simulation testing speed and precision across PCM syllabus.', qCount: 15, time: 45, key: '528194', exam: 'JEE Main 2026', multi: true },
    { title: 'CBSE Class 12 Board — Mathematics Model Paper 01', desc: 'Standardized CBSE Class 12 blueprint model paper with step-wise grading pattern.', qCount: 10, time: 30, key: '439281', exam: 'CBSE Class 12 Board', subj: 'Mathematics', multi: false, neg: false },
    { title: 'CBSE Class 12 Board — Physics Core Paper & Wave Optics', desc: 'Comprehensive board exam model paper covering Electrodynamics, Optics, and Modern Physics.', qCount: 10, time: 30, key: '348192', exam: 'CBSE Class 12 Board', subj: 'Physics', multi: false, neg: false },
    { title: 'CBSE Class 12 Board — Chemistry Comprehensive Inorganic & Organic', desc: 'CBSE Class 12 model paper covering Coordination Compounds, Aldehydes, and Electrochemistry.', qCount: 10, time: 30, key: '259183', exam: 'CBSE Class 12 Board', subj: 'Chemistry', multi: false, neg: false },
    { title: 'JEE Main 2026 — Electrodynamics, Magnetism & AC Circuits', desc: 'Targeted physics sprint on Gauss Law, Biot-Savart Law, EMI, and AC resonant circuits.', qCount: 10, time: 25, key: '169284', exam: 'JEE Main 2026', subj: 'Physics', multi: false },
    { title: 'JEE Main 2026 — Organic Synthesis, Reactions & Stereochemistry', desc: 'High-yield organic mechanisms, reaction pathways, and aromatic transformations.', qCount: 10, time: 25, key: '879102', exam: 'JEE Main 2026', subj: 'Chemistry', multi: false },
    { title: 'JEE Main 2026 — Vectors, 3D Geometry & Matrices Accelerator', desc: 'Algebraic and geometric speed test covering Matrices, Determinants, Lines, and Planes.', qCount: 10, time: 25, key: '987654', exam: 'JEE Main 2026', subj: 'Mathematics', multi: false },
    { title: 'JEE Main 2026 — National Benchmark Composite Assessment 03', desc: 'All-India benchmarking paper calibrated to NTA JEE Main difficulty standards.', qCount: 15, time: 45, key: '876543', exam: 'JEE Main 2026', multi: true },
    { title: 'NEET UG 2026 — Physics & Chemistry High-Yield Assessment', desc: 'Calibrated assessment tailored for medical entrance physics and physical chemistry.', qCount: 12, time: 35, key: '765432', exam: 'NEET UG 2026', multi: true },
    { title: 'CUET UG 2026 — Domain General STEM Assessment', desc: 'Broad-spectrum quantitative and scientific aptitude assessment under CUET format.', qCount: 10, time: 30, key: '654321', exam: 'CUET UG 2026', multi: true },
    { title: 'JEE Main 2026 — Modern Physics, Optics & Quantum Phenomena', desc: 'Photoelectric effect, de Broglie wavelength, Bohr model, nuclear fission, and ray optics.', qCount: 10, time: 25, key: '543210', exam: 'JEE Main 2026', subj: 'Physics', multi: false },
    { title: 'JEE Main 2026 — Coordinate Geometry & Conic Sections Sprint', desc: 'Circles, Parabola, Ellipse, and Hyperbola problem sets with tangent and normal properties.', qCount: 10, time: 25, key: '432109', exam: 'JEE Main 2026', subj: 'Mathematics', multi: false },
    { title: 'CBSE Class 12 Board — Pre-Board Physics Simulation', desc: 'Simulated pre-board examination for senior secondary school certification.', qCount: 10, time: 30, key: '321098', exam: 'CBSE Class 12 Board', subj: 'Physics', multi: false, neg: false },
    { title: 'CBSE Class 12 Board — Pre-Board Mathematics Simulation', desc: 'Simulated pre-board examination for calculus and 3D geometry certification.', qCount: 10, time: 30, key: '210987', exam: 'CBSE Class 12 Board', subj: 'Mathematics', multi: false, neg: false },
    { title: 'JEE Main 2026 — Physical Chemistry Thermodynamics & Electrochemistry', desc: 'Rigorous calculation-heavy numerical questions on Gibbs free energy, Nernst equation, and Kohlrausch law.', qCount: 10, time: 25, key: '109876', exam: 'JEE Main 2026', subj: 'Chemistry', multi: false },
    { title: 'JEE Main 2026 — Grand Finale All-India Rank Predictor Mock', desc: 'Comprehensive full-length assessment linking performance to merit scholarship slabs.', qCount: 15, time: 50, key: '998877', exam: 'JEE Main 2026', multi: true }
  ];

  const mockTests: any[] = [];
  const mockTestSubjects: any[] = [];
  const mockTestQuestions: any[] = [];
  let paperQCounter = 0;

  for (let i = 0; i < MOCK_TEST_SPECS.length; i++) {
    const spec = MOCK_TEST_SPECS[i];
    const testId = `f0000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
    const exam = EXAMS.find(e => e.name === spec.exam) || EXAMS[0];
    const subj = spec.subj ? SUBJECTS.find(s => s.name === spec.subj) : null;
    const maxMarks = spec.qCount * 4;
    const passingMarks = Math.round(maxMarks * 0.4);
    const negMarking = spec.neg !== undefined ? spec.neg : true;

    mockTests.push({
      mock_test_id: testId,
      subject_id: subj ? subj.id : null,
      exam_id: exam.id,
      title: spec.title,
      description: spec.desc,
      total_questions: spec.qCount,
      max_marks: maxMarks,
      max_time_in_mins: spec.time,
      scheduled_time: `2026-03-${String(10 + (i % 15)).padStart(2, '0')} 09:00:00+00`,
      start_date: `2026-03-01 00:00:00+00`,
      end_date: `2026-06-30 23:59:59+00`,
      negative_marking: negMarking,
      passing_marks: passingMarks,
      instructions: negMarking ? '+4 for correct, -1 for incorrect answer. Standard NTA JEE Main marking.' : '+4 for correct, 0 for incorrect answer. No negative marking.',
      access_key: spec.key,
      access_key_created_at: `2026-02-01 00:00:00+00`,
      access_key_expires_at: `2026-06-30 23:59:59+00`,
      is_multi_subject: Boolean(spec.multi),
      created_at: `2026-02-01 10:00:00+00`
    });

    if (spec.multi) {
      SUBJECTS.forEach(s => mockTestSubjects.push({ mock_test_id: testId, subject_id: s.id }));
    } else if (subj) {
      mockTestSubjects.push({ mock_test_id: testId, subject_id: subj.id });
    }

    let pool = questionsBank;
    if (spec.subj) {
      pool = questionsBank.filter(q => q.subject_name === spec.subj);
    }
    
    const startIdx = (i * 7) % Math.max(1, pool.length - spec.qCount);
    const selected = pool.slice(startIdx, startIdx + spec.qCount);

    selected.forEach(q => {
      paperQCounter++;
      const qId = `10000000-0000-4000-8000-${String(paperQCounter).padStart(12, '0')}`;
      mockTestQuestions.push({
        question_id: qId,
        mock_test_id: testId,
        subject_id: q.subject_id,
        bank_question_id: q.bank_question_id,
        question_text: q.question_text,
        question_type: q.question_type,
        marks_per_question: 4,
        negative_marking: negMarking ? 1 : 0,
        option_array: q.option_array,
        answers: q.answers,
        question_image_url: q.question_image_url
      });
    });
  }

  // Attempts (854)
  const attempts: any[] = [];
  let attemptCounter = 0;
  const attemptedPairs = new Set();

  for (let tIdx = 0; tIdx < mockTests.length; tIdx++) {
    const test = mockTests[tIdx];
    const attemptsForThisTest = randBetween(40, 45);

    for (let a = 0; a < attemptsForThisTest; a++) {
      const studentIdx = (tIdx * 105 + a * 47) % 2130;
      const studentId = `d0000000-0000-4000-8000-${String(studentIdx + 1).padStart(12, '0')}`;
      const pairKey = `${studentId}_${test.mock_test_id}`;

      if (attemptedPairs.has(pairKey)) continue;
      attemptedPairs.add(pairKey);

      attemptCounter++;
      const attemptId = `aa000000-0000-4000-8000-${String(attemptCounter).padStart(12, '0')}`;
      
      const totalQ = test.total_questions;
      const attemptedQ = randBetween(Math.floor(totalQ * 0.7), totalQ);
      const correctQ = randBetween(Math.floor(attemptedQ * 0.4), attemptedQ);
      const wrongQ = attemptedQ - correctQ;
      const unansweredQ = totalQ - attemptedQ;

      let score = test.negative_marking ? (correctQ * 4 - wrongQ * 1) : (correctQ * 4);
      if (score < 0) score = 0;
      const maxScore = totalQ * 4;
      const percentage = Math.round((score / maxScore) * 1000) / 10;
      const timeTaken = randBetween(Math.floor(test.max_time_in_mins * 60 * 0.5), test.max_time_in_mins * 60);

      const submitDay = String(randBetween(1, 28)).padStart(2, '0');
      const submitHour = String(randBetween(10, 18)).padStart(2, '0');
      const submitMin = String(randBetween(10, 59)).padStart(2, '0');

      attempts.push({
        attempt_id: attemptId,
        student_id: studentId,
        mock_test_id: test.mock_test_id,
        submitted_at: `2026-03-${submitDay} ${submitHour}:${submitMin}:00+00`,
        time_taken: timeTaken,
        total_questions: totalQ,
        attempted_questions: attemptedQ,
        correct_ans: correctQ,
        wrong_ans: wrongQ,
        unanswered: unansweredQ,
        score_obtained: score,
        percentage: percentage,
        status: 'COMPLETED',
        created_at: `2026-03-${submitDay} ${submitHour}:${submitMin}:00+00`
      });
    }
  }

  return { questionsBank, mockTests, mockTestSubjects, mockTestQuestions, attempts };
}
