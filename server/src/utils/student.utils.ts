/**
 * Generates a temporary student password following the user-approved formula:
 * ${studentFirstName}@${schoolCode}
 * 
 * Examples:
 * - "Aarav Sharma", "Delhi Public School" -> "Aarav@DPS"
 * - "Rohan Gupta", "Jaypee Vidya Mandir" -> "Rohan@JVM"
 * - "Priya", "St. Xavier's High School" -> "Priya@SXHS"
 */
export function generateStudentTempPassword(fullName: string, schoolNameOrReg: string): string {
  // Extract clean first name
  const rawFirst = (fullName || 'Student').trim().split(/\s+/)[0] || 'Student';
  const firstName = rawFirst.replace(/[^a-zA-Z]/g, '') || 'Student';
  const cleanFirstName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

  // Extract clean school code
  const words = (schoolNameOrReg || 'SCH').trim().split(/\s+/).filter(Boolean);
  let schoolCode = '';
  if (words.length > 1) {
    schoolCode = words.map((w) => w.charAt(0).toUpperCase()).join('');
  } else {
    schoolCode = words[0]?.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() || 'SCH';
  }

  // Ensure minimum length of 6 characters for auth provider requirements
  let password = `${cleanFirstName}@${schoolCode}`;
  if (password.length < 6) {
    password = `${password}2026`;
  }

  return password;
}
