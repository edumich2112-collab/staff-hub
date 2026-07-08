export type Priority = "Low" | "Medium" | "High";
export type TaskStatus = "Open" | "In Progress" | "Completed";
export type EmployeeStatus = "Active" | "Pending Start" | "Former" | "On Assignment";
export type RequestStatus = "Open" | "In Progress" | "Resolved";
export type RequestType =
  | "Returned Check"
  | "Direct Deposit Change"
  | "W-2 Request"
  | "Employment Verification"
  | "Address Change"
  | "General HR";

export interface Company {
  code: string;
  name: string;
  location: string;
  notes: string;
}

export interface Employee {
  id: string;
  employeeNumber: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  status: EmployeeStatus;
  position: string;
  payRate: number;
  hireDate: string;
  companyCode: string;
  currentAssignment: string;
  directDeposit: "Active" | "Pending" | "None";
  notes: string;
}

export interface Task {
  id: string;
  title: string;
  dueDate: string;
  priority: Priority;
  assignedEmployeeId?: string;
  companyCode?: string;
  status: TaskStatus;
  notes: string;
  completedAt?: string;
}

export interface EmployeeRequest {
  id: string;
  employeeId: string;
  companyCode: string;
  type: RequestType;
  submittedAt: string;
  priority: Priority;
  status: RequestStatus;
  assignedTo: string;
  notes: string;
}

export interface PayrollIssue {
  id: string;
  employeeId: string;
  companyCode: string;
  issue: string;
  amount?: number;
  reportedAt: string;
  status: "Open" | "Resolved";
}

export const companies: Company[] = [
  { code: "PG", name: "PureGreen", location: "Myrtle Beach, SC", notes: "Primary landscape client. Weekly crew rotations." },
  { code: "PGWILM", name: "PureGreen Wilmington", location: "Wilmington, NC", notes: "New territory expansion — Q1 focus." },
  { code: "PNIX", name: "Phoenix Conway", location: "Conway, SC", notes: "Standing order for 8 crew members." },
  { code: "YARD", name: "Phoenix Ocean Isle", location: "Ocean Isle, NC", notes: "Seasonal ramp-up in April." },
  { code: "PNIXCRD", name: "Phoenix Creedmoor", location: "Creedmoor, NC", notes: "Two-shift operation." },
  { code: "PNIXMRS", name: "Phoenix Morrisville", location: "Morrisville, NC", notes: "" },
  { code: "BRIGHT", name: "Bright Manufacturing", location: "Florence, SC", notes: "Warehouse & light industrial." },
  { code: "BRIGHTM", name: "Bright Mills", location: "Marion, SC", notes: "" },
  { code: "MBSR", name: "MB Seaside Resorts", location: "Myrtle Beach, SC", notes: "Housekeeping season March–October." },
  { code: "MRG", name: "Morgan Group", location: "Charleston, SC", notes: "" },
  { code: "AMAZ", name: "Amazon Logistics", location: "Charlotte, NC", notes: "High turnover — replace weekly." },
];

const first = ["James","Maria","Robert","Linda","Michael","Patricia","David","Jennifer","William","Elizabeth","Richard","Barbara","Joseph","Susan","Thomas","Jessica","Charles","Sarah","Christopher","Karen","Daniel","Nancy","Matthew","Lisa","Anthony","Betty","Mark","Sandra","Donald","Ashley","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle","Kenneth","Carol"];
const last = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson"];
const positions = ["Landscape Crew","Crew Lead","Housekeeper","Warehouse Associate","Forklift Operator","Line Cook","Groundskeeper","Maintenance Tech","Package Handler","Front Desk"];

function rand(seed: number) { const x = Math.sin(seed) * 10000; return x - Math.floor(x); }

function makeEmployees(): Employee[] {
  const out: Employee[] = [];
  let n = 0;
  for (const c of companies) {
    const count = 8 + Math.floor(rand(c.code.length + 3) * 8);
    for (let i = 0; i < count; i++) {
      n++;
      const r = rand(n * 7.3);
      const fn = first[Math.floor(rand(n) * first.length)];
      const ln = last[Math.floor(rand(n * 1.7) * last.length)];
      const status: EmployeeStatus =
        r < 0.08 ? "Pending Start" : r < 0.18 ? "Former" : "Active";
      const hireOffset = Math.floor(rand(n * 2.1) * 700);
      const d = new Date();
      d.setDate(d.getDate() - hireOffset + (status === "Pending Start" ? 14 : 0));
      out.push({
        id: `emp_${n}`,
        employeeNumber: `E${String(1000 + n).padStart(5, "0")}`,
        name: `${fn} ${ln}`,
        phone: `(${843 + (n % 3)}) ${String(200 + (n % 700)).padStart(3, "0")}-${String(1000 + n * 7 % 9000).padStart(4, "0")}`,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@email.com`,
        address: `${100 + n} Main St, ${c.location}`,
        emergencyContact: `${last[(n * 3) % last.length]}, ${first[(n * 5) % first.length]} — (843) 555-${String(1000 + n * 11 % 9000).padStart(4, "0")}`,
        status,
        position: positions[Math.floor(rand(n * 3.1) * positions.length)],
        payRate: 14 + Math.round(rand(n * 4.2) * 12 * 4) / 4,
        hireDate: d.toISOString().slice(0, 10),
        companyCode: c.code,
        currentAssignment: status === "Active" ? c.name : status === "Pending Start" ? `${c.name} (starting soon)` : "—",
        directDeposit: r < 0.6 ? "Active" : r < 0.85 ? "Pending" : "None",
        notes: "",
      });
    }
  }
  return out;
}

export const employees: Employee[] = makeEmployees();

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export const tasks: Task[] = [
  { id: "t1", title: "Confirm Monday crew rotation", dueDate: daysFromNow(1), priority: "High", companyCode: "PG", status: "Open", notes: "Need 6 confirmed by EOD." },
  { id: "t2", title: "Onboard new hire paperwork", dueDate: daysFromNow(2), priority: "Medium", companyCode: "PNIX", assignedEmployeeId: "emp_20", status: "In Progress", notes: "" },
  { id: "t3", title: "Follow up on returned check", dueDate: daysFromNow(-2), priority: "High", companyCode: "MBSR", assignedEmployeeId: "emp_55", status: "Open", notes: "Called twice, no answer." },
  { id: "t4", title: "Send W-2 to former employee", dueDate: daysFromNow(-5), priority: "Medium", companyCode: "AMAZ", assignedEmployeeId: "emp_80", status: "Open", notes: "" },
  { id: "t5", title: "Verify direct deposit form", dueDate: daysFromNow(0), priority: "Medium", companyCode: "PGWILM", assignedEmployeeId: "emp_15", status: "In Progress", notes: "" },
  { id: "t6", title: "Interview forklift candidate", dueDate: daysFromNow(3), priority: "Low", companyCode: "BRIGHT", status: "Open", notes: "" },
  { id: "t7", title: "Update MBSR housekeeping schedule", dueDate: daysFromNow(4), priority: "Medium", companyCode: "MBSR", status: "Open", notes: "" },
  { id: "t8", title: "Call Amazon supervisor re: no-shows", dueDate: daysFromNow(-1), priority: "High", companyCode: "AMAZ", status: "Open", notes: "" },
  { id: "t9", title: "Payroll audit — PNIXCRD", dueDate: daysFromNow(6), priority: "Low", companyCode: "PNIXCRD", status: "Open", notes: "" },
  { id: "t10", title: "Send birthday message to Phoenix team", dueDate: daysFromNow(-3), priority: "Low", companyCode: "PNIX", status: "Completed", notes: "", completedAt: daysFromNow(-3) },
  { id: "t11", title: "Complete I-9 verification", dueDate: daysFromNow(-1), priority: "Medium", companyCode: "PG", assignedEmployeeId: "emp_3", status: "Completed", notes: "", completedAt: daysFromNow(-1) },
  { id: "t12", title: "Order new company shirts", dueDate: daysFromNow(-4), priority: "Low", companyCode: "PGWILM", status: "Completed", notes: "", completedAt: daysFromNow(-2) },
];

export const requests: EmployeeRequest[] = [
  { id: "r1", employeeId: "emp_5", companyCode: "PG", type: "Returned Check", submittedAt: daysFromNow(-1), priority: "High", status: "Open", assignedTo: "Sarah K.", notes: "Check bounced — needs reissue." },
  { id: "r2", employeeId: "emp_22", companyCode: "PNIX", type: "Direct Deposit Change", submittedAt: daysFromNow(-2), priority: "Medium", status: "In Progress", assignedTo: "Mike R.", notes: "" },
  { id: "r3", employeeId: "emp_44", companyCode: "MBSR", type: "W-2 Request", submittedAt: daysFromNow(-3), priority: "Low", status: "Open", assignedTo: "Sarah K.", notes: "" },
  { id: "r4", employeeId: "emp_70", companyCode: "AMAZ", type: "Employment Verification", submittedAt: daysFromNow(-1), priority: "Medium", status: "Open", assignedTo: "Mike R.", notes: "Mortgage lender request." },
  { id: "r5", employeeId: "emp_12", companyCode: "PGWILM", type: "Address Change", submittedAt: daysFromNow(-4), priority: "Low", status: "Resolved", assignedTo: "Sarah K.", notes: "" },
  { id: "r6", employeeId: "emp_60", companyCode: "BRIGHT", type: "General HR", submittedAt: daysFromNow(0), priority: "Medium", status: "Open", assignedTo: "Sarah K.", notes: "Wants to switch shifts." },
  { id: "r7", employeeId: "emp_33", companyCode: "PNIXCRD", type: "Returned Check", submittedAt: daysFromNow(-2), priority: "High", status: "Open", assignedTo: "Mike R.", notes: "" },
];

export const payrollIssues: PayrollIssue[] = [
  { id: "p1", employeeId: "emp_5", companyCode: "PG", issue: "Returned check — needs reissue", amount: 842.5, reportedAt: daysFromNow(-1), status: "Open" },
  { id: "p2", employeeId: "emp_18", companyCode: "PNIX", issue: "Missing hours (Thu shift)", amount: 168, reportedAt: daysFromNow(-2), status: "Open" },
  { id: "p3", employeeId: "emp_33", companyCode: "PNIXCRD", issue: "Returned check", amount: 612, reportedAt: daysFromNow(-2), status: "Open" },
  { id: "p4", employeeId: "emp_44", companyCode: "MBSR", issue: "Pay rate discrepancy", reportedAt: daysFromNow(-4), status: "Open" },
];
