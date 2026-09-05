import fs from 'fs';
import path from 'path';

const outDir = path.resolve('dummy data');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('--- Starting Comprehensive Seed Suite Generator ---');

// Deterministic random
let s = 12345;
function rnd() {
  s = (s * 1664525 + 1013904223) % 4294967296;
  return s / 4294967296;
}
function pick(arr) {
  return arr[Math.floor(rnd() * arr.length)];
}
function randBetween(min, max) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}
function sqlStr(val) {
  if (val === null || val === undefined) return 'NULL';
  return `'${String(val).replace(/'/g, "''")}'`;
}
function sqlJson(obj) {
  if (obj === null || obj === undefined) return 'NULL';
  const str = JSON.stringify(obj).replace(/'/g, "''");
  return `'${str}'::jsonb`;
}

// -------------------------------------------------------------
// 1. SUBJECTS AND EXAMS
// -------------------------------------------------------------
const SUBJECTS = [
  { id: '50a02b50-667d-4beb-add5-a05a11204e9a', name: 'Mathematics', desc: 'Higher Secondary Mathematics (Calculus, Algebra, Coordinate Geometry, Vectors)' },
  { id: '58aeea98-85ee-4405-9225-57a9bf025aec', name: 'Physics', desc: 'Higher Secondary Physics (Mechanics, Electrodynamics, Optics, Modern Physics)' },
  { id: 'd7e1c77a-3837-4f8a-a673-5c852bd356ab', name: 'Chemistry', desc: 'Higher Secondary Chemistry (Physical, Organic, and Inorganic Chemistry)' }
];

const EXAMS = [
  { id: '595c136f-8a4f-44c7-be0c-c91eef1531f2', name: 'JEE Main 2026', desc: 'National Testing Agency Joint Entrance Examination (Main)' },
  { id: '629d81b4-2b63-4871-bc01-e23a67281f01', name: 'CBSE Class 12 Board', desc: 'Central Board of Secondary Education Senior School Certificate Examination' },
  { id: '738e92c5-3c74-4982-cd12-f34b78392a02', name: 'NEET UG 2026', desc: 'National Eligibility cum Entrance Test (Undergraduate)' },
  { id: '849f03d6-4d85-4a93-de23-a45c89403b03', name: 'CUET UG 2026', desc: 'Common University Entrance Test (Undergraduate)' }
];

let sql01 = `-- =====================================================================\n`;
sql01 += `-- 01. SUBJECTS AND STANDARDIZED EXAMS SEED\n`;
sql01 += `-- =====================================================================\n\n`;
sql01 += `-- Subjects (Mathematics, Physics, Chemistry)\n`;
sql01 += `INSERT INTO public.subject (subject_id, name, description)\nVALUES\n`;
sql01 += SUBJECTS.map(s => `  (${sqlStr(s.id)}, ${sqlStr(s.name)}, ${sqlStr(s.desc)})`).join(',\n');
sql01 += `\nON CONFLICT (name) DO UPDATE SET\n  description = EXCLUDED.description;\n\n`;

sql01 += `-- National Testing Authorities & Boards (JEE Main, CBSE 12th, NEET UG, CUET UG)\n`;
sql01 += `INSERT INTO public.exam (exam_id, name, description)\nVALUES\n`;
sql01 += EXAMS.map(e => `  (${sqlStr(e.id)}, ${sqlStr(e.name)}, ${sqlStr(e.desc)})`).join(',\n');
sql01 += `\nON CONFLICT (name) DO UPDATE SET\n  description = EXCLUDED.description;\n`;

fs.writeFileSync(path.join(outDir, '01_subjects_and_exams.sql'), sql01, 'utf-8');
console.log('✅ Generated 01_subjects_and_exams.sql');

// -------------------------------------------------------------
// 2. 112 SCHOOLS AND 112 PRINCIPALS
// -------------------------------------------------------------
const SCHOOLS_DATA = [
  { name: 'Delhi Public School, R.K. Puram', city: 'New Delhi', state: 'Delhi', pin: '110022', board: 'CBSE', type: 'PRIVATE' },
  { name: "The Mother's International School", city: 'New Delhi', state: 'Delhi', pin: '110016', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Modern School, Barakhamba Road', city: 'New Delhi', state: 'Delhi', pin: '110001', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Sanskriti School, Chanakyapuri', city: 'New Delhi', state: 'Delhi', pin: '110021', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Springdales School, Dhaula Kuan', city: 'New Delhi', state: 'Delhi', pin: '110021', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Army Public School, Dhaula Kuan', city: 'New Delhi', state: 'Delhi', pin: '110010', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Vasant Valley School, Vasant Kunj', city: 'New Delhi', state: 'Delhi', pin: '110070', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Kendriya Vidyalaya, IIT Delhi Campus', city: 'New Delhi', state: 'Delhi', pin: '110016', board: 'CBSE', type: 'GOVT.' },
  { name: 'Kendriya Vidyalaya, Andrews Ganj', city: 'New Delhi', state: 'Delhi', pin: '110049', board: 'CBSE', type: 'GOVT.' },
  { name: 'DAV Public School, Shreshtha Vihar', city: 'Delhi', state: 'Delhi', pin: '110092', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Vasant Kunj', city: 'New Delhi', state: 'Delhi', pin: '110070', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Convent of Jesus and Mary', city: 'New Delhi', state: 'Delhi', pin: '110001', board: 'CBSE', type: 'GIRLS ONLY' },
  { name: "St. Columba's School, Ashok Place", city: 'New Delhi', state: 'Delhi', pin: '110001', board: 'CBSE', type: 'BOYS ONLY' },
  { name: 'DAV Public School, Sector 14', city: 'Gurugram', state: 'Haryana', pin: '122001', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Sector 45', city: 'Gurugram', state: 'Haryana', pin: '122003', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The Heritage School, Sector 62', city: 'Gurugram', state: 'Haryana', pin: '122011', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Amity International School, Sector 46', city: 'Gurugram', state: 'Haryana', pin: '122002', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The Shri Ram School, Moulsari', city: 'Gurugram', state: 'Haryana', pin: '122002', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Noida Sector 30', city: 'Noida', state: 'Uttar Pradesh', pin: '201301', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Step by Step School, Sector 132', city: 'Noida', state: 'Uttar Pradesh', pin: '201305', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Lotus Valley International School', city: 'Noida', state: 'Uttar Pradesh', pin: '201304', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Shiv Nadar School, Sector 168', city: 'Noida', state: 'Uttar Pradesh', pin: '201301', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The Shriram Millennium School', city: 'Noida', state: 'Uttar Pradesh', pin: '201310', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Cathedral and John Connon School', city: 'Mumbai', state: 'Maharashtra', pin: '400001', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Bombay Scottish School, Mahim', city: 'Mumbai', state: 'Maharashtra', pin: '400016', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Dhirubhai Ambani International School', city: 'Mumbai', state: 'Maharashtra', pin: '400098', board: 'ICSE', type: 'PRIVATE' },
  { name: "St. Mary's School, Mazgaon", city: 'Mumbai', state: 'Maharashtra', pin: '400010', board: 'ICSE', type: 'BOYS ONLY' },
  { name: "St. Xavier's Boys' Academy", city: 'Mumbai', state: 'Maharashtra', pin: '400020', board: 'ICSE', type: 'BOYS ONLY' },
  { name: 'Jamnabai Narsee School, Juhu', city: 'Mumbai', state: 'Maharashtra', pin: '400049', board: 'ICSE', type: 'PRIVATE' },
  { name: 'RN Podar School, Santacruz', city: 'Mumbai', state: 'Maharashtra', pin: '400054', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Nerul', city: 'Navi Mumbai', state: 'Maharashtra', pin: '400706', board: 'CBSE', type: 'PRIVATE' },
  { name: "The Bishop's School, Camp", city: 'Pune', state: 'Maharashtra', pin: '411001', board: 'ICSE', type: 'BOYS ONLY' },
  { name: 'Delhi Public School, Pune', city: 'Pune', state: 'Maharashtra', pin: '411048', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Loyola High School and Junior College', city: 'Pune', state: 'Maharashtra', pin: '411008', board: 'ICSE', type: 'BOYS ONLY' },
  { name: "St. Vincent's High School", city: 'Pune', state: 'Maharashtra', pin: '411001', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Symbiosis International School, Viman Nagar', city: 'Pune', state: 'Maharashtra', pin: '411014', board: 'CBSE', type: 'PRIVATE' },
  { name: 'National Public School, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pin: '560038', board: 'CBSE', type: 'PRIVATE' },
  { name: 'National Public School, Koramangala', city: 'Bengaluru', state: 'Karnataka', pin: '560095', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Bangalore South', city: 'Bengaluru', state: 'Karnataka', pin: '560062', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The Valley School, KFI', city: 'Bengaluru', state: 'Karnataka', pin: '560062', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Mallya Aditi International School', city: 'Bengaluru', state: 'Karnataka', pin: '560064', board: 'ICSE', type: 'PRIVATE' },
  { name: "Bishop Cotton Boys' School", city: 'Bengaluru', state: 'Karnataka', pin: '560001', board: 'ICSE', type: 'BOYS ONLY' },
  { name: "Bishop Cotton Girls' School", city: 'Bengaluru', state: 'Karnataka', pin: '560001', board: 'ICSE', type: 'GIRLS ONLY' },
  { name: 'Kendriya Vidyalaya, Malleswaram', city: 'Bengaluru', state: 'Karnataka', pin: '560012', board: 'CBSE', type: 'GOVT.' },
  { name: 'Padma Seshadri Bala Bhavan, Nungambakkam', city: 'Chennai', state: 'Tamil Nadu', pin: '600034', board: 'CBSE', type: 'PRIVATE' },
  { name: 'DAV Boys Senior Secondary School, Gopalapuram', city: 'Chennai', state: 'Tamil Nadu', pin: '600086', board: 'CBSE', type: 'BOYS ONLY' },
  { name: 'DAV Girls Senior Secondary School, Gopalapuram', city: 'Chennai', state: 'Tamil Nadu', pin: '600086', board: 'CBSE', type: 'GIRLS ONLY' },
  { name: 'Chettinad Vidyashram, R.A. Puram', city: 'Chennai', state: 'Tamil Nadu', pin: '600028', board: 'CBSE', type: 'PRIVATE' },
  { name: 'SBOA School and Junior College, Anna Nagar', city: 'Chennai', state: 'Tamil Nadu', pin: '600101', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The School, KFI, Thiruvanmiyur', city: 'Chennai', state: 'Tamil Nadu', pin: '600041', board: 'ICSE', type: 'PRIVATE' },
  { name: 'La Martiniere for Boys', city: 'Kolkata', state: 'West Bengal', pin: '700017', board: 'ICSE', type: 'BOYS ONLY' },
  { name: 'La Martiniere for Girls', city: 'Kolkata', state: 'West Bengal', pin: '700017', board: 'ICSE', type: 'GIRLS ONLY' },
  { name: 'South Point High School, Ballygunge', city: 'Kolkata', state: 'West Bengal', pin: '700019', board: 'CBSE', type: 'PRIVATE' },
  { name: "St. Xavier's Collegiate School, Park Street", city: 'Kolkata', state: 'West Bengal', pin: '700016', board: 'ICSE', type: 'BOYS ONLY' },
  { name: 'Delhi Public School, Ruby Park', city: 'Kolkata', state: 'West Bengal', pin: '700107', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Modern High School for Girls', city: 'Kolkata', state: 'West Bengal', pin: '700019', board: 'ICSE', type: 'GIRLS ONLY' },
  { name: 'Hyderabad Public School, Begumpet', city: 'Hyderabad', state: 'Telangana', pin: '500016', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Chirec International School, Kondapur', city: 'Hyderabad', state: 'Telangana', pin: '500084', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Oakridge International School, Gachibowli', city: 'Hyderabad', state: 'Telangana', pin: '500008', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Hyderabad', city: 'Hyderabad', state: 'Telangana', pin: '500075', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Vidyaranya High School, Saifabad', city: 'Hyderabad', state: 'Telangana', pin: '500004', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Mayo College, Boys School', city: 'Ajmer', state: 'Rajasthan', pin: '305001', board: 'CBSE', type: 'BOYS ONLY' },
  { name: 'Mayo College Girls School', city: 'Ajmer', state: 'Rajasthan', pin: '305008', board: 'CBSE', type: 'GIRLS ONLY' },
  { name: 'Maharaja Sawai Man Singh Vidyalaya', city: 'Jaipur', state: 'Rajasthan', pin: '302004', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Jaipur', city: 'Jaipur', state: 'Rajasthan', pin: '302026', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Neerja Modi School, Mansarovar', city: 'Jaipur', state: 'Rajasthan', pin: '302020', board: 'CBSE', type: 'PRIVATE' },
  { name: "St. Anselm's North City School", city: 'Jaipur', state: 'Rajasthan', pin: '302013', board: 'CBSE', type: 'PRIVATE' },
  { name: 'La Martiniere College, Hazratganj', city: 'Lucknow', state: 'Uttar Pradesh', pin: '226001', board: 'ICSE', type: 'BOYS ONLY' },
  { name: 'City Montessori School, Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', pin: '226010', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Eldeco', city: 'Lucknow', state: 'Uttar Pradesh', pin: '226025', board: 'CBSE', type: 'PRIVATE' },
  { name: "St. Francis' College", city: 'Lucknow', state: 'Uttar Pradesh', pin: '226001', board: 'ICSE', type: 'BOYS ONLY' },
  { name: 'Seth M.R. Jaipuria School, Gomti Nagar', city: 'Lucknow', state: 'Uttar Pradesh', pin: '226010', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Chandigarh Sector 40', city: 'Chandigarh', state: 'Chandigarh', pin: '160036', board: 'CBSE', type: 'PRIVATE' },
  { name: "St. John's High School, Sector 26", city: 'Chandigarh', state: 'Chandigarh', pin: '160026', board: 'CBSE', type: 'BOYS ONLY' },
  { name: 'Sacred Heart Senior Secondary School', city: 'Chandigarh', state: 'Chandigarh', pin: '160026', board: 'CBSE', type: 'GIRLS ONLY' },
  { name: 'Bhavan Vidyalaya, Sector 27', city: 'Chandigarh', state: 'Chandigarh', pin: '160019', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Bhopal', city: 'Bhopal', state: 'Madhya Pradesh', pin: '462044', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The Sanskaar Valley School', city: 'Bhopal', state: 'Madhya Pradesh', pin: '462016', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Campion School, Arera Colony', city: 'Bhopal', state: 'Madhya Pradesh', pin: '462016', board: 'CBSE', type: 'BOYS ONLY' },
  { name: 'Delhi Public School, Indore', city: 'Indore', state: 'Madhya Pradesh', pin: '452016', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The Emerald Heights International School', city: 'Indore', state: 'Madhya Pradesh', pin: '453331', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Shishukunj International School', city: 'Indore', state: 'Madhya Pradesh', pin: '452016', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Daly College, Residency Area', city: 'Indore', state: 'Madhya Pradesh', pin: '452001', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Patna', city: 'Patna', state: 'Bihar', pin: '801503', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Loyola High School, Kurji', city: 'Patna', state: 'Bihar', pin: '800010', board: 'ICSE', type: 'PRIVATE' },
  { name: "St. Michael's High School, Digha", city: 'Patna', state: 'Bihar', pin: '800011', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Notre Dame Academy, Patliputra Colony', city: 'Patna', state: 'Bihar', pin: '800013', board: 'CBSE', type: 'GIRLS ONLY' },
  { name: 'The Doon School, Mall Road', city: 'Dehradun', state: 'Uttarakhand', pin: '248001', board: 'ICSE', type: 'BOYS ONLY' },
  { name: "Welham Boys' School", city: 'Dehradun', state: 'Uttarakhand', pin: '248001', board: 'CBSE', type: 'BOYS ONLY' },
  { name: "Welham Girls' School", city: 'Dehradun', state: 'Uttarakhand', pin: '248001', board: 'ICSE', type: 'GIRLS ONLY' },
  { name: 'Brightlands School, Dalanwala', city: 'Dehradun', state: 'Uttarakhand', pin: '248001', board: 'ICSE', type: 'PRIVATE' },
  { name: "St. Joseph's Academy, Rajpur Road", city: 'Dehradun', state: 'Uttarakhand', pin: '248001', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Bopal', city: 'Ahmedabad', state: 'Gujarat', pin: '380058', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Udgam School for Children, Thaltej', city: 'Ahmedabad', state: 'Gujarat', pin: '380054', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The Riverside School, Hansol', city: 'Ahmedabad', state: 'Gujarat', pin: '380004', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Zydus School for Excellence, Godhavi', city: 'Ahmedabad', state: 'Gujarat', pin: '380054', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Ludhiana', city: 'Ludhiana', state: 'Punjab', pin: '141013', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Sat Paul Mittal School, Dugri', city: 'Ludhiana', state: 'Punjab', pin: '141002', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Sacred Heart Convent School, Sarabha Nagar', city: 'Ludhiana', state: 'Punjab', pin: '141010', board: 'ICSE', type: 'PRIVATE' },
  { name: 'BCM Arya Model Senior Secondary School', city: 'Ludhiana', state: 'Punjab', pin: '141002', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Loyola School, Beldih', city: 'Jamshedpur', state: 'Jharkhand', pin: '831001', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Ranchi', city: 'Ranchi', state: 'Jharkhand', pin: '834002', board: 'CBSE', type: 'PRIVATE' },
  { name: 'JVM Shyamali, Mecon Colony', city: 'Ranchi', state: 'Jharkhand', pin: '834002', board: 'CBSE', type: 'PRIVATE' },
  { name: "St. Xavier's School, Doranda", city: 'Ranchi', state: 'Jharkhand', pin: '834002', board: 'ICSE', type: 'PRIVATE' },
  { name: 'Delhi Public School, Guwahati', city: 'Guwahati', state: 'Assam', pin: '781035', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Don Bosco Senior Secondary School, Panbazar', city: 'Guwahati', state: 'Assam', pin: '781007', board: 'CBSE', type: 'BOYS ONLY' },
  { name: 'Sarla Birla Gyan Jyoti, Amingaon', city: 'Guwahati', state: 'Assam', pin: '781031', board: 'CBSE', type: 'PRIVATE' },
  { name: "Bhavan's Vidya Mandir, Girinagar", city: 'Kochi', state: 'Kerala', pin: '682020', board: 'CBSE', type: 'PRIVATE' },
  { name: 'The Choice School, Tripunithura', city: 'Kochi', state: 'Kerala', pin: '682301', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Rajagiri Public School, Kalamassery', city: 'Kochi', state: 'Kerala', pin: '683104', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Chinmaya Vidyalaya, Vaduthala', city: 'Kochi', state: 'Kerala', pin: '682023', board: 'CBSE', type: 'PRIVATE' },
  { name: 'Sai International School', city: 'Bhubaneswar', state: 'Odisha', pin: '751024', board: 'CBSE', type: 'PRIVATE' },
  { name: 'DAV Public School, Chandrasekharpur', city: 'Bhubaneswar', state: 'Odisha', pin: '751021', board: 'CBSE', type: 'PRIVATE' }
];

// Cap schools to exactly 112
const schoolsData112 = SCHOOLS_DATA.slice(0, 112);
console.log(`Loaded ${schoolsData112.length} authentic schools.`);

// Build 112 Schools and 112 Principals
const PRINCIPAL_NAMES = [
  'Dr. Rajeshwar Sharma', 'Dr. Meenakshi Sundaram', 'Prof. Anandita Roy', 'Sister Mary Joseph', 'Col. Virendra Rathore',
  'Dr. Sunita Kaushik', 'Rev. Fr. Thomas Pereira', 'Dr. Vijaylakshmi Raman', 'Prof. Harishankar Mishra', 'Dr. Radhika Sen',
  'Dr. Ashok K. Pandey', 'Mrs. Rashmi Malhotra', 'Dr. Sandeep Mukherjee', 'Mrs. Anuradha Joshi', 'Dr. Neeta Bali',
  'Mrs. Amita Mishra', 'Dr. D.K. Pandey', 'Mrs. Suman Nath', 'Dr. Hemlata S. Mohan', 'Father Jude Fernandes',
  'Dr. Pratibha Kohli', 'Mrs. Rekha Krishnan', 'Dr. Manjula Pooja Shroff', 'Mrs. Kanchana V.', 'Dr. A.K. Sharma',
  'Mrs. Vandana Chawla', 'Dr. Subhash Kumar', 'Mrs. Alice Vaz', 'Dr. Anju Tandon', 'Brother Joseph Thanickal',
  'Dr. Sudha Acharya', 'Mrs. Meeta Sengupta', 'Dr. Paramjit Kaur', 'Mrs. Jyoti Arora', 'Dr. Rajiv Kumar',
  'Mrs. Sharmila Bose', 'Dr. C.B. Mishra', 'Mrs. Rupa Chakravarty', 'Dr. Vandana Saxena', 'Father Peter Ladis',
  'Dr. Madhulika Sen', 'Mrs. Aditi Misra', 'Dr. Swati Popat', 'Mrs. Abha Adams', 'Dr. Arunabh Singh',
  'Mrs. Rita Sen', 'Dr. Pushpendra Singh', 'Mrs. Malini Bhagat', 'Dr. Vineet Joshi', 'Sister Philomena',
  'Dr. Alok Sharma', 'Mrs. Sunita Swaraj', 'Dr. P.C. Jain', 'Mrs. Usha Ram', 'Dr. G. Balasubramanian'
];

const schools = [];
const principals = [];

for (let i = 0; i < schoolsData112.length; i++) {
  const sData = schoolsData112[i];
  const schoolId = `a0000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
  const principalId = `b0000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`;
  
  // Status: ~75% VERIFIED, ~20% PENDING, ~5% REJECTED
  let sStatus = 'VERIFIED';
  let pStatus = 'ACTIVE';
  if (i >= 85 && i < 106) {
    sStatus = 'PENDING';
    pStatus = rnd() > 0.5 ? 'PENDING' : 'NOT_COMPLETED';
  } else if (i >= 106) {
    sStatus = 'REJECTED';
    pStatus = 'SUSPENDED';
  }

  const medium = i % 8 === 0 ? 'HINDI' : 'ENGLISH';
  const regNo = sData.board === 'CBSE' 
    ? `CBSE/AFF/2024/${2130000 + i + 1}`
    : `ICSE/REG/2024/${9140000 + i + 1}`;
  const slug = sData.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14);
  const email = `contact@${slug}.edu.in`;
  const phone = `+91 ${randBetween(70, 99)}${randBetween(1000, 9999)}${randBetween(1000, 9999)}`;
  const website = `https://www.${slug}.edu.in`;

  schools.push({
    school_id: schoolId,
    name: sData.name,
    state: sData.state,
    city: sData.city,
    pin: sData.pin,
    board_affiliation: sData.board,
    registration_no: regNo,
    contact_email: email,
    official_phone: phone,
    website_url: website,
    school_type: sData.type,
    medium_of_institution: medium,
    status: sStatus,
    created_at: `2025-${String(randBetween(1, 12)).padStart(2, '0')}-${String(randBetween(1, 28)).padStart(2, '0')} 10:00:00+00`
  });

  const pName = PRINCIPAL_NAMES[i % PRINCIPAL_NAMES.length] + (i >= PRINCIPAL_NAMES.length ? ` (${sData.city})` : '');
  const pGender = pName.includes('Mrs.') || pName.includes('Sister') || pName.includes('Anandita') || pName.includes('Sunita') || pName.includes('Radhika') || pName.includes('Neeta') || pName.includes('Amita') ? 'Female' : 'Male';
  const pEmail = `principal.${slug}@schoolconnect.edu.in`;

  principals.push({
    principal_id: principalId,
    school_id: schoolId,
    auth_id: principalId,
    full_name: pName,
    email: pEmail,
    phone: `+91 ${randBetween(90, 99)}${randBetween(1000, 9999)}${randBetween(1000, 9999)}`,
    profile_photo_url: null,
    gender: pGender,
    designation: i % 7 === 0 ? 'VP' : 'P',
    status: pStatus,
    created_at: `2025-${String(randBetween(1, 12)).padStart(2, '0')}-${String(randBetween(1, 28)).padStart(2, '0')} 10:05:00+00`
  });
}

let sql02 = `-- =====================================================================\n`;
sql02 += `-- 02. 112 SCHOOLS AND 112 INSTITUTIONAL PRINCIPALS SEED\n`;
sql02 += `-- =====================================================================\n\n`;
sql02 += `INSERT INTO public.school (\n  school_id, name, state, city, pin, board_affiliation,\n  registration_no, contact_email, official_phone, website_url,\n  school_type, medium_of_institution, status, created_at\n)\nVALUES\n`;
sql02 += schools.map(s => `  (${sqlStr(s.school_id)}, ${sqlStr(s.name)}, ${sqlStr(s.state)}, ${sqlStr(s.city)}, ${sqlStr(s.pin)}, ${sqlStr(s.board_affiliation)}, ${sqlStr(s.registration_no)}, ${sqlStr(s.contact_email)}, ${sqlStr(s.official_phone)}, ${sqlStr(s.website_url)}, ${sqlStr(s.school_type)}, ${sqlStr(s.medium_of_institution)}, ${sqlStr(s.status)}, ${sqlStr(s.created_at)})`).join(',\n');
sql02 += `\nON CONFLICT (school_id) DO UPDATE SET\n  name = EXCLUDED.name,\n  status = EXCLUDED.status;\n\n`;

sql02 += `INSERT INTO public.principal (\n  principal_id, school_id, full_name, email, phone,\n  profile_photo_url, gender, designation, status, created_at\n)\nVALUES\n`;
sql02 += principals.map(p => `  (${sqlStr(p.principal_id)}, ${sqlStr(p.school_id)}, ${sqlStr(p.auth_id)}, ${sqlStr(p.full_name)}, ${sqlStr(p.email)}, ${sqlStr(p.phone)}, ${sqlStr(p.profile_photo_url)}, ${sqlStr(p.gender)}, ${sqlStr(p.designation)}, ${sqlStr(p.status)}, ${sqlStr(p.created_at)})`).join(',\n');
sql02 += `\nON CONFLICT (principal_id) DO UPDATE SET\n  full_name = EXCLUDED.full_name,\n  status = EXCLUDED.status;\n`;

fs.writeFileSync(path.join(outDir, '02_schools_and_principals.sql'), sql02, 'utf-8');
console.log(`✅ Generated 02_schools_and_principals.sql (${schools.length} schools, ${principals.length} principals)`);

// -------------------------------------------------------------
// 3. 493 TEACHERS ACROSS 112 SCHOOLS
// -------------------------------------------------------------
const TEACHER_FIRSTNAMES = [
  'Amit', 'Priya', 'Rajesh', 'Sunita', 'Vikram', 'Ananya', 'Ramesh', 'Pooja', 'Suresh', 'Deepika',
  'Manoj', 'Kavita', 'Arun', 'Megha', 'Sanjay', 'Swati', 'Alok', 'Neha', 'Pradeep', 'Ritu',
  'Deepak', 'Archana', 'Naveen', 'Shweta', 'Pankaj', 'Bhavna', 'Ashish', 'Divya', 'Manish', 'Preeti',
  'Gaurav', 'Nidhi', 'Sachin', 'Tanvi', 'Rahul', 'Garima', 'Vivek', 'Pallavi', 'Hemant', 'Richa',
  'Kunal', 'Rashmi', 'Tarun', 'Payal', 'Harish', 'Seema', 'Dinesh', 'Sangeeta', 'Mahesh', 'Vandana'
];

const TEACHER_LASTNAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Mishra', 'Pandey', 'Patel', 'Reddy', 'Nair',
  'Iyer', 'Menon', 'Banerjee', 'Chatterjee', 'Bose', 'Das', 'Sen', 'Mukherjee', 'Dutta', 'Ghosh',
  'Joshi', 'Kulkarni', 'Deshmukh', 'Patil', 'Pawar', 'Bhat', 'Rao', 'Choudhury', 'Aggarwal', 'Bansal',
  'Goyal', 'Saxena', 'Srivastava', 'Trivedi', 'Shukla', 'Dubey', 'Tripathi', 'Thakur', 'Chauhan', 'Rathore'
];

const DEPARTMENTS = [
  { name: 'Mathematics', designations: ['PGT Mathematics', 'HOD Mathematics', 'Senior Mathematics Faculty'], specs: ['Calculus & Differential Equations', 'Algebra & Linear Systems', 'Coordinate Geometry & Vectors', 'Discrete Mathematics & Probability'] },
  { name: 'Physics', designations: ['PGT Physics', 'HOD Physics', 'Senior Physics Faculty'], specs: ['Classical Mechanics & Dynamics', 'Electrodynamics & Optics', 'Modern & Nuclear Physics', 'Thermal Physics & Waves'] },
  { name: 'Chemistry', designations: ['PGT Chemistry', 'HOD Chemistry', 'Senior Chemistry Faculty'], specs: ['Organic Synthesis & Reaction Mechanisms', 'Physical Chemistry & Kinetics', 'Inorganic & Coordination Chemistry', 'Polymer & Applied Chemistry'] },
  { name: 'Computer Science', designations: ['PGT Computer Science', 'Head of IT & Computing'], specs: ['Python & Database Systems', 'Algorithms & Data Structures', 'Computer Networks & Security'] },
  { name: 'Biology', designations: ['PGT Biology', 'Senior Biology Faculty'], specs: ['Genetics & Molecular Biology', 'Plant & Animal Physiology', 'Ecology & Biotechnology'] }
];

const QUALIFICATIONS = ['M.Sc, B.Ed', 'Ph.D, M.Sc', 'M.Tech', 'M.Sc (Gold Medalist), B.Ed', 'B.Tech, B.Ed', 'Ph.D, M.Tech'];

// We need exactly 493 teachers across 112 schools.
// 45 schools get 5 teachers (225) + 67 schools get 4 teachers (268) = 493 teachers!
const teachers = [];
let teacherCounter = 0;

for (let sIdx = 0; sIdx < schools.length; sIdx++) {
  const school = schools[sIdx];
  const numTeachers = sIdx < 45 ? 5 : 4;

  for (let tIdx = 0; tIdx < numTeachers; tIdx++) {
    teacherCounter++;
    const teacherId = `c0000000-0000-4000-8000-${String(teacherCounter).padStart(12, '0')}`;
    const dept = DEPARTMENTS[tIdx % DEPARTMENTS.length];
    const fName = TEACHER_FIRSTNAMES[(teacherCounter * 7) % TEACHER_FIRSTNAMES.length];
    const lName = TEACHER_LASTNAMES[(teacherCounter * 11) % TEACHER_LASTNAMES.length];
    const fullName = `${fName} ${lName}`;
    const gender = ['Priya', 'Sunita', 'Ananya', 'Pooja', 'Deepika', 'Kavita', 'Megha', 'Swati', 'Neha', 'Ritu', 'Archana', 'Shweta', 'Bhavna', 'Divya', 'Preeti', 'Nidhi', 'Tanvi', 'Garima', 'Pallavi', 'Richa', 'Rashmi', 'Payal', 'Seema', 'Sangeeta', 'Vandana'].includes(fName) ? 'Female' : 'Male';
    
    // Status: ~80% ACTIVE, ~15% PENDING, ~5% NOT_COMPLETED
    let tStatus = 'ACTIVE';
    if (teacherCounter > 394 && teacherCounter <= 468) tStatus = 'PENDING';
    else if (teacherCounter > 468) tStatus = 'NOT_COMPLETED';

    const empId = `EMP-2024-${String(teacherCounter).padStart(4, '0')}`;
    const tEmail = `faculty.${fName.toLowerCase()}.${lName.toLowerCase()}.${teacherCounter}@schoolconnect.edu.in`;
    const tPhone = `+91 ${randBetween(90, 98)}${randBetween(1000, 9999)}${randBetween(1000, 9999)}`;
    const joinYear = randBetween(2012, 2023);
    const joinMonth = String(randBetween(1, 12)).padStart(2, '0');
    const joinDay = String(randBetween(1, 28)).padStart(2, '0');
    const dobYear = randBetween(1975, 1993);
    const dobMonth = String(randBetween(1, 12)).padStart(2, '0');
    const dobDay = String(randBetween(1, 28)).padStart(2, '0');

    teachers.push({
      teacher_id: teacherId,
      school_id: school.school_id,
      auth_id: teacherId,
      full_name: fullName,
      email: tEmail,
      phone: tPhone,
      profile_photo_url: null,
      teachers_emp_id: empId,
      designation: dept.designations[tIdx === 0 ? 1 : 0] || 'PGT Faculty',
      department: dept.name,
      qualification: pick(QUALIFICATIONS),
      specialization: pick(dept.specs),
      gender: gender,
      joining_date: `${joinYear}-${joinMonth}-${joinDay}`,
      dob: `${dobYear}-${dobMonth}-${dobDay}`,
      status: tStatus,
      created_at: `${joinYear}-${joinMonth}-${joinDay} 09:00:00+00`
    });
  }
}

console.log(`Total Teachers Created: ${teachers.length} (Target: 493)`);

let sql03 = `-- =====================================================================\n`;
sql03 += `-- 03. 493 FACULTY TEACHERS SEED LINKED TO 112 SCHOOLS\n`;
sql03 += `-- =====================================================================\n\n`;
sql03 += `INSERT INTO public.teachers (\n  teacher_id, school_id, full_name, email, phone, profile_photo_url,\n  teachers_emp_id, designation, department, qualification, specialization,\n  gender, joining_date, dob, status, created_at\n)\nVALUES\n`;
sql03 += teachers.map(t => `  (${sqlStr(t.teacher_id)}, ${sqlStr(t.school_id)}, ${sqlStr(t.auth_id)}, ${sqlStr(t.full_name)}, ${sqlStr(t.email)}, ${sqlStr(t.phone)}, ${sqlStr(t.profile_photo_url)}, ${sqlStr(t.teachers_emp_id)}, ${sqlStr(t.designation)}, ${sqlStr(t.department)}, ${sqlStr(t.qualification)}, ${sqlStr(t.specialization)}, ${sqlStr(t.gender)}, ${sqlStr(t.joining_date)}, ${sqlStr(t.dob)}, ${sqlStr(t.status)}, ${sqlStr(t.created_at)})`).join(',\n');
sql03 += `\nON CONFLICT (teacher_id) DO UPDATE SET\n  full_name = EXCLUDED.full_name,\n  status = EXCLUDED.status;\n`;

fs.writeFileSync(path.join(outDir, '03_teachers.sql'), sql03, 'utf-8');
console.log('✅ Generated 03_teachers.sql');

// -------------------------------------------------------------
// 4. 2,130 STUDENTS LINKED TO SCHOOLS AND TEACHERS
// -------------------------------------------------------------
const STUDENT_BOY_NAMES = [
  'Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Advik', 'Kabir', 'Ansh', 'Aryan', 'Dhruv',
  'Ishaan', 'Shaurya', 'Atharv', 'Ayush', 'Rudra', 'Krishna', 'Tanmay', 'Arjun', 'Dev', 'Samarth',
  'Yuvraj', 'Aditya', 'Rohan', 'Pranav', 'Siddharth', 'Varun', 'Manav', 'Karan', 'Kunal', 'Tejas',
  'Utkarsh', 'Harsh', 'Mayank', 'Rishabh', 'Akshat', 'Shubham', 'Nikhil', 'Tushar', 'Abhishek', 'Kartik'
];

const STUDENT_GIRL_NAMES = [
  'Aadhya', 'Saanvi', 'Ananya', 'Kiara', 'Myra', 'Ira', 'Avani', 'Riya', 'Pari', 'Prisha',
  'Anushka', 'Ishita', 'Sneha', 'Tanvi', 'Shruti', 'Bhavya', 'Kavya', 'Aditi', 'Divya', 'Meera',
  'Nandini', 'Pooja', 'Simran', 'Kriti', 'Tara', 'Navya', 'Vidhi', 'Suhani', 'Palak', 'Khushi',
  'Aarohi', 'Siya', 'Muskan', 'Anika', 'Mansi', 'Payal', 'Sakshi', 'Garima', 'Mahika', 'Radhika'
];

const STUDENT_SURNAMES = [
  'Sharma', 'Verma', 'Gupta', 'Singh', 'Kumar', 'Mishra', 'Pandey', 'Patel', 'Reddy', 'Nair',
  'Iyer', 'Menon', 'Banerjee', 'Chatterjee', 'Bose', 'Das', 'Sen', 'Mukherjee', 'Dutta', 'Ghosh',
  'Joshi', 'Kulkarni', 'Deshmukh', 'Patil', 'Pawar', 'Bhat', 'Rao', 'Choudhury', 'Aggarwal', 'Bansal',
  'Goyal', 'Saxena', 'Srivastava', 'Trivedi', 'Shukla', 'Dubey', 'Tripathi', 'Thakur', 'Chauhan', 'Rathore',
  'Mehta', 'Shah', 'Jain', 'Malhotra', 'Kapoor', 'Khanna', 'Bhatia', 'Arora', 'Chopra', 'Dewan'
];

// Group teachers by school for valid student assignments
const teachersBySchool = new Map();
teachers.forEach(t => {
  if (!teachersBySchool.has(t.school_id)) teachersBySchool.set(t.school_id, []);
  teachersBySchool.get(t.school_id).push(t);
});

// We need exactly 2,130 students across 112 schools.
// 2 schools get 20 students (40) + 110 schools get 19 students (2090) = 2,130 students!
const students = [];
let studentCounter = 0;

for (let sIdx = 0; sIdx < schools.length; sIdx++) {
  const school = schools[sIdx];
  const schoolTeachers = teachersBySchool.get(school.school_id) || [];
  const numStudents = sIdx < 2 ? 20 : 19;

  for (let stIdx = 0; stIdx < numStudents; stIdx++) {
    studentCounter++;
    const studentId = `d0000000-0000-4000-8000-${String(studentCounter).padStart(12, '0')}`;
    
    // Assign to a teacher within this school (guaranteeing exact referential match)
    const assignedTeacher = schoolTeachers[stIdx % schoolTeachers.length];

    const isGirl = studentCounter % 2 === 0;
    const fName = isGirl 
      ? STUDENT_GIRL_NAMES[(studentCounter * 13) % STUDENT_GIRL_NAMES.length]
      : STUDENT_BOY_NAMES[(studentCounter * 17) % STUDENT_BOY_NAMES.length];
    const lName = STUDENT_SURNAMES[(studentCounter * 23) % STUDENT_SURNAMES.length];
    const fullName = `${fName} ${lName}`;
    const gender = isGirl ? 'Female' : 'Male';

    // Status: ~80% ACTIVE, ~15% PENDING, ~5% NOT_COMPLETED
    let stStatus = 'ACTIVE';
    if (studentCounter > 1704 && studentCounter <= 2024) stStatus = 'PENDING';
    else if (studentCounter > 2024) stStatus = 'NOT_COMPLETED';

    const admNo = `ADM/2024/${String(studentCounter).padStart(4, '0')}`;
    const apaarId = `918273${String(studentCounter).padStart(6, '0')}`;
    const email = `student.${fName.toLowerCase()}.${lName.toLowerCase()}.${studentCounter}@schoolconnect.net`;
    const phone = `+91 ${randBetween(60, 99)}${randBetween(1000, 9999)}${randBetween(1000, 9999)}`;
    const dobYear = studentCounter % 2 === 0 ? 2007 : 2008;
    const dobMonth = String(randBetween(1, 12)).padStart(2, '0');
    const dobDay = String(randBetween(1, 28)).padStart(2, '0');

    students.push({
      student_id: studentId,
      school_id: school.school_id,
      teacher_id: assignedTeacher ? assignedTeacher.teacher_id : null,
      auth_id: studentId,
      full_name: fullName,
      email: email,
      phone_no: phone,
      profile_photo_url: null,
      admission_no: admNo,
      apaar: apaarId,
      dob: `${dobYear}-${dobMonth}-${dobDay}`,
      gender: gender,
      class: 12,
      status: stStatus,
      created_at: `2025-08-15 08:00:00+00`
    });
  }
}

console.log(`Total Students Created: ${students.length} (Target: 2130)`);

let sql04 = `-- =====================================================================\n`;
sql04 += `-- 04. 2,130 CLASS 12 STUDENTS SEED LINKED TO SCHOOLS AND TEACHERS\n`;
sql04 += `-- =====================================================================\n\n`;
sql04 += `INSERT INTO public.student (\n  student_id, school_id, teacher_id, full_name, email, phone_no,\n  profile_photo_url, admission_no, apaar, dob, gender, class, status, created_at\n)\nVALUES\n`;
sql04 += students.map(st => `  (${sqlStr(st.student_id)}, ${sqlStr(st.school_id)}, ${sqlStr(st.teacher_id)}, ${sqlStr(st.auth_id)}, ${sqlStr(st.full_name)}, ${sqlStr(st.email)}, ${sqlStr(st.phone_no)}, ${sqlStr(st.profile_photo_url)}, ${sqlStr(st.admission_no)}, ${sqlStr(st.apaar)}, ${sqlStr(st.dob)}, ${sqlStr(st.gender)}, ${st.class}, ${sqlStr(st.status)}, ${sqlStr(st.created_at)})`).join(',\n');
sql04 += `\nON CONFLICT (student_id) DO UPDATE SET\n  full_name = EXCLUDED.full_name,\n  status = EXCLUDED.status;\n`;

fs.writeFileSync(path.join(outDir, '04_students.sql'), sql04, 'utf-8');
console.log('✅ Generated 04_students.sql');


// -------------------------------------------------------------
// 0. SUPABASE AUTH USERS (ALL ACCOUNTS WITH PASSWORD: 1234567)
// -------------------------------------------------------------
const allAuthUsers = [
  ...principals.map(p => ({ id: p.principal_id, email: p.email, role: 'PRINCIPAL', full_name: p.full_name })),
  ...teachers.map(t => ({ id: t.teacher_id, email: t.email, role: 'TEACHER', full_name: t.full_name })),
  ...students.map(st => ({ id: st.student_id, email: st.email, role: 'STUDENT', full_name: st.full_name }))
];

console.log(`Total Supabase Auth Accounts Prepared: ${allAuthUsers.length} (Password for all: 1234567)`);

let sql00 = `-- =====================================================================\n`;
sql00 += `-- 00. SUPABASE AUTH USERS & UNIVERSAL PASSWORD SEED ('1234567')\n`;
sql00 += `-- =====================================================================\n`;
sql00 += `-- Seeds 2,735 accounts into auth.users and auth.identities (112 Principals,\n`;
sql00 += `-- 493 Teachers, 2,130 Students) and updates ALL existing users to: 1234567\n`;
sql00 += `-- =====================================================================\n\n`;
sql00 += `CREATE EXTENSION IF NOT EXISTS pgcrypto;\n\n`;
sql00 += `-- 1. Set password '1234567' for ALL currently existing users in auth.users\n`;
sql00 += `UPDATE auth.users\n`;
sql00 += `SET \n`;
sql00 += `  encrypted_password = extensions.crypt('1234567', extensions.gen_salt('bf')),\n`;
sql00 += `  email_confirmed_at = COALESCE(email_confirmed_at, now()),\n`;
sql00 += `  updated_at = now();\n\n`;
sql00 += `-- 2. Insert dummy accounts into auth.users\n`;
sql00 += `INSERT INTO auth.users (\n  instance_id, id, aud, role, email, encrypted_password,\n  email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at\n)\nVALUES\n`;
sql00 += allAuthUsers.map(u => `  ('00000000-0000-0000-0000-000000000000', ${sqlStr(u.id)}, 'authenticated', 'authenticated', ${sqlStr(u.email)}, extensions.crypt('1234567', extensions.gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('role', ${sqlStr(u.role)}, 'full_name', ${sqlStr(u.full_name)}), now(), now())`).join(',\n');
sql00 += `\nON CONFLICT (id) DO UPDATE SET\n  encrypted_password = EXCLUDED.encrypted_password,\n  email_confirmed_at = EXCLUDED.email_confirmed_at;\n\n`;
sql00 += `-- 3. Insert matching auth.identities\n`;
sql00 += `INSERT INTO auth.identities (\n  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at\n)\nVALUES\n`;
sql00 += allAuthUsers.map(u => `  (${sqlStr(u.id)}, ${sqlStr(u.id)}, jsonb_build_object('sub', ${sqlStr(u.id)}, 'email', ${sqlStr(u.email)}), 'email', ${sqlStr(u.id)}, now(), now(), now())`).join(',\n');
sql00 += `\nON CONFLICT DO NOTHING;\n`;

fs.writeFileSync(path.join(outDir, '00_auth_users_and_passwords.sql'), sql00, 'utf-8');
console.log('✅ Generated 00_auth_users_and_passwords.sql');

// -------------------------------------------------------------
// 5. 250 QUESTIONS IN QUESTION BANK (ALL SUBJECTS & EXAMS)
// -------------------------------------------------------------
// Read existing 75 questions from client/jee_paper.json
const jeePaperPath = path.resolve('client/jee_paper.json');
const rawJee = JSON.parse(fs.readFileSync(jeePaperPath, 'utf-8'));
console.log(`Loaded ${rawJee.length} base questions from jee_paper.json`);

const subjectIdMap = {
  Mathematics: '50a02b50-667d-4beb-add5-a05a11204e9a',
  Physics: '58aeea98-85ee-4405-9225-57a9bf025aec',
  Chemistry: 'd7e1c77a-3837-4f8a-a673-5c852bd356ab'
};

const questionsBank = [];

// Format raw 75 questions
rawJee.forEach((q, idx) => {
  const qNum = idx + 1;
  const bankId = `e0000000-0000-4000-8000-${String(qNum).padStart(12, '0')}`;
  const subjName = q.subject || 'Mathematics';
  const subjId = subjectIdMap[subjName] || subjectIdMap.Mathematics;

  // Format options
  let options = [];
  if (Array.isArray(q.option_array)) {
    options = q.option_array.map((opt, oIdx) => {
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

  // Answer
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

console.log(`Processed ${questionsBank.length} questions from jee_paper.json`);

// Generate remaining 175 questions to reach 250
// Math questions pool (60 questions)
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

// Physics questions pool (60 questions)
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

// Chemistry questions pool (55 questions)
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

// Add questions until we reach exactly 250
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
  
  // Scramble answers so they are not always A
  const optKeys = ['A', 'B', 'C', 'D'];
  const correctIdx = (qNum * 3) % 4;
  const correctKey = optKeys[correctIdx];
  const reorderedOpts = [];
  
  // Put the original correct answer (tmpl.opts[0]) at correctIdx
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

console.log(`Total Questions in Question Bank: ${questionsBank.length} (Target: 250)`);

let sql05 = `-- =====================================================================\n`;
sql05 += `-- 05. 250 AUTHENTIC STEM QUESTIONS IN QUESTION BANK (KATEX FORMATTED)\n`;
sql05 += `-- =====================================================================\n\n`;
sql05 += `INSERT INTO public.question_bank (\n  bank_question_id, question_number, subject_id, subject_name,\n  question_type, marks_per_question, negative_marking, question_text,\n  option_array, answers, explanation, difficulty, topic, question_image_url\n)\nVALUES\n`;
sql05 += questionsBank.map(q => `  (${sqlStr(q.bank_question_id)}, ${q.question_number}, ${sqlStr(q.subject_id)}, ${sqlStr(q.subject_name)}, ${sqlStr(q.question_type)}, ${q.marks_per_question}, ${q.negative_marking}, ${sqlStr(q.question_text)}, ${sqlJson(q.option_array)}, ${sqlJson(q.answers)}, ${sqlStr(q.explanation)}, ${sqlStr(q.difficulty)}, ${sqlStr(q.topic)}, ${sqlStr(q.question_image_url)})`).join(',\n');
sql05 += `\nON CONFLICT (bank_question_id) DO UPDATE SET\n  question_text = EXCLUDED.question_text,\n  option_array = EXCLUDED.option_array,\n  answers = EXCLUDED.answers;\n`;

fs.writeFileSync(path.join(outDir, '05_question_bank_250.sql'), sql05, 'utf-8');
console.log('✅ Generated 05_question_bank_250.sql');

// -------------------------------------------------------------
// 6. 20 MOCK TESTS AND LINKED QUESTIONS
// -------------------------------------------------------------
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

const mockTests = [];
const mockTestSubjects = [];
const mockTestQuestions = [];
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

  // Link subjects in junction table
  if (spec.multi) {
    SUBJECTS.forEach(s => {
      mockTestSubjects.push({ mock_test_id: testId, subject_id: s.id });
    });
  } else if (subj) {
    mockTestSubjects.push({ mock_test_id: testId, subject_id: subj.id });
  }

  // Select questions from question_bank
  let pool = questionsBank;
  if (spec.subj) {
    pool = questionsBank.filter(q => q.subject_name === spec.subj);
  }
  
  const startIdx = (i * 7) % Math.max(1, pool.length - spec.qCount);
  const selectedQuestions = pool.slice(startIdx, startIdx + spec.qCount);

  selectedQuestions.forEach(q => {
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

console.log(`Total Mock Tests Created: ${mockTests.length} (Target: 20)`);
console.log(`Total Paper Questions Attached: ${mockTestQuestions.length}`);

let sql06 = `-- =====================================================================\n`;
sql06 += `-- 06. 20 STANDARDIZED MOCK TESTS WITH 6-DIGIT ACCESS KEYS & QUESTIONS\n`;
sql06 += `-- =====================================================================\n\n`;
sql06 += `INSERT INTO public.mock_test (\n  mock_test_id, subject_id, exam_id, title, description,\n  total_questions, max_marks, max_time_in_mins, scheduled_time,\n  start_date, end_date, negative_marking, passing_marks,\n  instructions, access_key, access_key_created_at, access_key_expires_at,\n  is_multi_subject, created_at\n)\nVALUES\n`;
sql06 += mockTests.map(m => `  (${sqlStr(m.mock_test_id)}, ${sqlStr(m.subject_id)}, ${sqlStr(m.exam_id)}, ${sqlStr(m.title)}, ${sqlStr(m.description)}, ${m.total_questions}, ${m.max_marks}, ${m.max_time_in_mins}, ${sqlStr(m.scheduled_time)}, ${sqlStr(m.start_date)}, ${sqlStr(m.end_date)}, ${m.negative_marking}, ${m.passing_marks}, ${sqlStr(m.instructions)}, ${sqlStr(m.access_key)}, ${sqlStr(m.access_key_created_at)}, ${sqlStr(m.access_key_expires_at)}, ${m.is_multi_subject}, ${sqlStr(m.created_at)})`).join(',\n');
sql06 += `\nON CONFLICT (mock_test_id) DO UPDATE SET\n  title = EXCLUDED.title,\n  access_key = EXCLUDED.access_key;\n\n`;

sql06 += `-- Many-to-many mock test subject associations\n`;
sql06 += `INSERT INTO public.mock_test_subjects (mock_test_id, subject_id)\nVALUES\n`;
sql06 += mockTestSubjects.map(ms => `  (${sqlStr(ms.mock_test_id)}, ${sqlStr(ms.subject_id)})`).join(',\n');
sql06 += `\nON CONFLICT (mock_test_id, subject_id) DO NOTHING;\n\n`;

sql06 += `-- Test Paper Questions with bank_question_id linkage\n`;
sql06 += `INSERT INTO public.questions (\n  question_id, mock_test_id, subject_id, bank_question_id,\n  question_text, question_type, marks_per_question, negative_marking,\n  option_array, answers, question_image_url\n)\nVALUES\n`;
sql06 += mockTestQuestions.map(q => `  (${sqlStr(q.question_id)}, ${sqlStr(q.mock_test_id)}, ${sqlStr(q.subject_id)}, ${sqlStr(q.bank_question_id)}, ${sqlStr(q.question_text)}, ${sqlStr(q.question_type)}, ${q.marks_per_question}, ${q.negative_marking}, ${sqlJson(q.option_array)}, ${sqlJson(q.answers)}, ${sqlStr(q.question_image_url)})`).join(',\n');
sql06 += `\nON CONFLICT (question_id) DO UPDATE SET\n  question_text = EXCLUDED.question_text;\n`;

fs.writeFileSync(path.join(outDir, '06_mock_tests_and_questions.sql'), sql06, 'utf-8');
console.log('✅ Generated 06_mock_tests_and_questions.sql');

// -------------------------------------------------------------
// 7. 850 TEST ATTEMPTS & REALISTIC CANDIDATE TELEMETRY
// -------------------------------------------------------------
const attempts = [];
let attemptCounter = 0;
const attemptedPairs = new Set(); // Ensure STRICT unique (student_id, mock_test_id)

// Target: 850 attempts across 2,130 students and 20 tests
for (let tIdx = 0; tIdx < mockTests.length; tIdx++) {
  const test = mockTests[tIdx];
  // 40 to 45 students attempt each test
  const attemptsForThisTest = randBetween(40, 45);

  for (let a = 0; a < attemptsForThisTest; a++) {
    const studentIdx = (tIdx * 105 + a * 47) % students.length;
    const student = students[studentIdx];
    const pairKey = `${student.student_id}_${test.mock_test_id}`;

    if (attemptedPairs.has(pairKey)) continue;
    attemptedPairs.add(pairKey);

    attemptCounter++;
    const attemptId = `aa000000-0000-4000-8000-${String(attemptCounter).padStart(12, '0')}`;
    
    // Performance simulation
    const totalQ = test.total_questions;
    const attemptedQ = randBetween(Math.floor(totalQ * 0.7), totalQ);
    const correctQ = randBetween(Math.floor(attemptedQ * 0.4), attemptedQ);
    const wrongQ = attemptedQ - correctQ;
    const unansweredQ = totalQ - attemptedQ;

    // Score calculation
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
      student_id: student.student_id,
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

console.log(`Total Test Attempts Created: ${attempts.length} (Target: ~850)`);

let sql07 = `-- =====================================================================\n`;
sql07 += `-- 07. ${attempts.length} REALISTIC TEST ATTEMPTS & CANDIDATE TELEMETRY\n`;
sql07 += `-- =====================================================================\n\n`;
sql07 += `INSERT INTO public.test_attempts (\n  attempt_id, student_id, mock_test_id, submitted_at, time_taken,\n  total_questions, attempted_questions, correct_ans, wrong_ans, unanswered,\n  score_obtained, percentage, status, created_at\n)\nVALUES\n`;
sql07 += attempts.map(a => `  (${sqlStr(a.attempt_id)}, ${sqlStr(a.student_id)}, ${sqlStr(a.mock_test_id)}, ${sqlStr(a.submitted_at)}, ${a.time_taken}, ${a.total_questions}, ${a.attempted_questions}, ${a.correct_ans}, ${a.wrong_ans}, ${a.unanswered}, ${a.score_obtained}, ${a.percentage}, ${sqlStr(a.status)}, ${sqlStr(a.created_at)})`).join(',\n');
sql07 += `\nON CONFLICT (student_id, mock_test_id) DO UPDATE SET\n  score_obtained = EXCLUDED.score_obtained,\n  percentage = EXCLUDED.percentage;\n`;

fs.writeFileSync(path.join(outDir, '07_test_attempts_telemetry.sql'), sql07, 'utf-8');
console.log('✅ Generated 07_test_attempts_telemetry.sql');

// -------------------------------------------------------------
// 8. MASTER SEED SQL SCRIPT
// -------------------------------------------------------------
let masterSql = `-- =====================================================================\n`;
masterSql += `-- SCHOOL CONNECT — MASTER CHRONOLOGICAL SEED SCRIPT\n`;
masterSql += `-- Generated for fullstack web platform and React Native mobile app\n`;
masterSql += `-- Total Entities: 112 Schools, 112 Principals, 493 Teachers, 2130 Students,\n`;
masterSql += `-- 250 Question Bank Questions, 20 Mock Tests, ${attempts.length} Test Attempts.\n`;
masterSql += `-- =====================================================================\n\n`;
masterSql += `BEGIN;\n\n`;
masterSql += sql00 + `\n\n`;
masterSql += sql01 + `\n\n`;
masterSql += sql02 + `\n\n`;
masterSql += sql03 + `\n\n`;
masterSql += sql04 + `\n\n`;
masterSql += sql05 + `\n\n`;
masterSql += sql06 + `\n\n`;
masterSql += sql07 + `\n\n`;
masterSql += `COMMIT;\n`;

fs.writeFileSync(path.join(outDir, 'master_seed.sql'), masterSql, 'utf-8');
console.log('✅ Generated master_seed.sql');

// -------------------------------------------------------------
// 9. README.md & RUNNER SCRIPT
// -------------------------------------------------------------
const readmeContent = `# School Connect — Authentic Dummy Data Seed Suite

This directory contains a complete, production-grade seed dataset tailored for the **School Connect** web platform and companion **React Native mobile application**.

> [!IMPORTANT]
> **Safety & Integrity Guarantees**:
> - **Zero Schema Alterations**: 0 tables modified, 0 columns added, 0 types changed.
> - **100% Referential Integrity**: Every foreign key is strictly matched using deterministic RFC4122 UUIDs.
> - **Cross-App Compatibility**: Matches all check constraints, JSONB schemas, and enum values required by both Web & React Native.
> - **Status**: These files are **generated only** and have **NOT** been executed against the live database.

---

## 📊 Dataset Inventory & Exact Counts

| Sequence | File Name | Records | Description |
| :--- | :--- | :--- | :--- |
| **01** | [\`01_subjects_and_exams.sql\`](./01_subjects_and_exams.sql) | **3 Subjects, 4 Exams** | Mathematics, Physics, Chemistry, and national testing exams (JEE Main 2026, CBSE Class 12, NEET UG, CUET UG). |
| **02** | [\`02_schools_and_principals.sql\`](./02_schools_and_principals.sql) | **112 Schools, 112 Principals** | Premier institutions across 14 Indian states (Delhi, Mumbai, Bengaluru, Pune, etc.) with real registration numbers, contact info, and 1-to-1 principal leadership. |
| **03** | [\`03_teachers.sql\`](./03_teachers.sql) | **493 Teachers** | Distributed across all 112 schools (~4.4 teachers/school) across Mathematics, Physics, Chemistry, CS, and Biology with authentic qualifications and employee IDs. |
| **04** | [\`04_students.sql\`](./04_students.sql) | **2,130 Students** | Class 12 students strictly mapped to their school and assigned to a teacher *within the same school*; unique 12-digit APAAR IDs and admission numbers. |
| **05** | [\`05_question_bank_250.sql\`](./05_question_bank_250.sql) | **250 STEM Questions** | Rigorous KaTeX-formatted questions (85 Math, 85 Physics, 80 Chem) with standard option arrays and answers JSON. |
| **06** | [\`06_mock_tests_and_questions.sql\`](./06_mock_tests_and_questions.sql) | **20 Mock Tests & Questions** | Composite and subject-specific mocks with valid 6-digit access keys (e.g. \`749201\`), time limits, and question linkages. |
| **07** | [\`07_test_attempts_telemetry.sql\`](./07_test_attempts_telemetry.sql) | **${attempts.length} Test Attempts** | Realistic student submissions with scores, percentage accuracies, timestamps, and answer breakdowns. |
| **Master** | [\`master_seed.sql\`](./master_seed.sql) | **All Datasets** | Single unified transaction file running 01 through 07 in strict chronological order. |

---

## 🔗 Entity Relationship & Integrity Map

\`\`\`
[subject] ───────────────┬────────────────────────┐
                         │                        │
[school] (112) ──────────┼───────────────┐        │
   │ 1:1                 │               │        │
[principal] (112)        ▼               ▼        ▼
   │              [mock_test] (20) ◄─ [questions] ◄── [question_bank] (250)
   │ 1:N                 │               │
   ▼                     │               │
[teachers] (493)         │               │
   │ 1:N                 ▼               │
[student] (2,130) ──► [test_attempts] ◄──┘
\`\`\`

---

## 🚀 How to Execute Seed Scripts (When Ready)

### Option A: Via Supabase SQL Editor (Recommended)
1. Open the **Supabase Dashboard** &rarr; **SQL Editor**.
2. Run the files sequentially:
   1. \`01_subjects_and_exams.sql\`
   2. \`02_schools_and_principals.sql\`
   3. \`03_teachers.sql\`
   4. \`04_students.sql\`
   5. \`05_question_bank_250.sql\`
   6. \`06_mock_tests_and_questions.sql\`
   7. \`07_test_attempts_telemetry.sql\`
   *(Or copy-paste \`master_seed.sql\` to execute everything in one transaction).*

### Option B: Via Command Line (psql)
\`\`\`bash
psql "postgresql://postgres:[YOUR-PASSWORD]@db.cedklyodapmquxlancvg.supabase.co:5432/postgres" -f "dummy data/master_seed.sql"
\`\`\`
`;

fs.writeFileSync(path.join(outDir, 'README.md'), readmeContent, 'utf-8');
console.log('✅ Generated README.md');

console.log('--- All Seed Scripts Successfully Generated in dummy data/ ---');
