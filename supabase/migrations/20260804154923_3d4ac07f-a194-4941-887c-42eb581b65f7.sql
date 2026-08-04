CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  email text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.companies (
  code text PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_all" ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER companies_touch BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.employees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_number text NOT NULL DEFAULT '',
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  emergency_contact text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'Active',
  position text NOT NULL DEFAULT '',
  pay_rate numeric NOT NULL DEFAULT 0,
  hire_date date,
  scheduled_start_date date,
  company_code text REFERENCES public.companies(code) ON UPDATE CASCADE,
  current_assignment text NOT NULL DEFAULT '',
  direct_deposit text NOT NULL DEFAULT 'None',
  notes text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX employees_company_idx ON public.employees(company_code);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employees TO authenticated;
GRANT ALL ON public.employees TO service_role;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employees_all" ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER employees_touch BEFORE UPDATE ON public.employees FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.company_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_code text NOT NULL,
  position text NOT NULL DEFAULT '',
  from_date date,
  to_date date,
  note text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX company_history_employee_idx ON public.company_history(employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_history TO authenticated;
GRANT ALL ON public.company_history TO service_role;
ALTER TABLE public.company_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_history_all" ON public.company_history FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.employee_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  text text NOT NULL,
  author text NOT NULL DEFAULT 'System',
  at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX employee_notes_employee_idx ON public.employee_notes(employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.employee_notes TO authenticated;
GRANT ALL ON public.employee_notes TO service_role;
ALTER TABLE public.employee_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "employee_notes_all" ON public.employee_notes FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  due_date date,
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Open',
  notes text NOT NULL DEFAULT '',
  assigned_employee_id uuid REFERENCES public.employees(id) ON DELETE SET NULL,
  company_code text,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_all" ON public.tasks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER tasks_touch BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  company_code text,
  type text NOT NULL DEFAULT 'General HR',
  priority text NOT NULL DEFAULT 'Medium',
  status text NOT NULL DEFAULT 'Open',
  assigned_to text NOT NULL DEFAULT '',
  notes text NOT NULL DEFAULT '',
  submitted_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX requests_employee_idx ON public.requests(employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.requests TO authenticated;
GRANT ALL ON public.requests TO service_role;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "requests_all" ON public.requests FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER requests_touch BEFORE UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.payroll_issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES public.employees(id) ON DELETE CASCADE,
  company_code text,
  issue text NOT NULL,
  amount numeric,
  reported_at date NOT NULL DEFAULT CURRENT_DATE,
  status text NOT NULL DEFAULT 'Open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX payroll_issues_employee_idx ON public.payroll_issues(employee_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_issues TO authenticated;
GRANT ALL ON public.payroll_issues TO service_role;
ALTER TABLE public.payroll_issues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payroll_issues_all" ON public.payroll_issues FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE TRIGGER payroll_issues_touch BEFORE UPDATE ON public.payroll_issues FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();