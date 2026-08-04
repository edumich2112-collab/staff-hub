export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      companies: {
        Row: {
          code: string
          created_at: string
          location: string
          name: string
          notes: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          location?: string
          name: string
          notes?: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          location?: string
          name?: string
          notes?: string
          updated_at?: string
        }
        Relationships: []
      }
      company_history: {
        Row: {
          company_code: string
          created_at: string
          employee_id: string
          from_date: string | null
          id: string
          note: string
          position: string
          to_date: string | null
        }
        Insert: {
          company_code: string
          created_at?: string
          employee_id: string
          from_date?: string | null
          id?: string
          note?: string
          position?: string
          to_date?: string | null
        }
        Update: {
          company_code?: string
          created_at?: string
          employee_id?: string
          from_date?: string | null
          id?: string
          note?: string
          position?: string
          to_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_notes: {
        Row: {
          at: string
          author: string
          employee_id: string
          id: string
          text: string
        }
        Insert: {
          at?: string
          author?: string
          employee_id: string
          id?: string
          text: string
        }
        Update: {
          at?: string
          author?: string
          employee_id?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_notes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: string
          company_code: string | null
          created_at: string
          current_assignment: string
          direct_deposit: string
          email: string
          emergency_contact: string
          employee_number: string
          hire_date: string | null
          id: string
          name: string
          notes: string
          pay_rate: number
          phone: string
          position: string
          scheduled_start_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string
          company_code?: string | null
          created_at?: string
          current_assignment?: string
          direct_deposit?: string
          email?: string
          emergency_contact?: string
          employee_number?: string
          hire_date?: string | null
          id?: string
          name: string
          notes?: string
          pay_rate?: number
          phone?: string
          position?: string
          scheduled_start_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string
          company_code?: string | null
          created_at?: string
          current_assignment?: string
          direct_deposit?: string
          email?: string
          emergency_contact?: string
          employee_number?: string
          hire_date?: string | null
          id?: string
          name?: string
          notes?: string
          pay_rate?: number
          phone?: string
          position?: string
          scheduled_start_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "employees_company_code_fkey"
            columns: ["company_code"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["code"]
          },
        ]
      }
      payroll_issues: {
        Row: {
          amount: number | null
          company_code: string | null
          created_at: string
          employee_id: string | null
          id: string
          issue: string
          reported_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          company_code?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          issue: string
          reported_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          company_code?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          issue?: string
          reported_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payroll_issues_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          assigned_to: string
          company_code: string | null
          completed_at: string | null
          created_at: string
          employee_id: string | null
          id: string
          notes: string
          priority: string
          status: string
          submitted_at: string
          type: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string
          company_code?: string | null
          completed_at?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          notes?: string
          priority?: string
          status?: string
          submitted_at?: string
          type?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          company_code?: string | null
          completed_at?: string | null
          created_at?: string
          employee_id?: string | null
          id?: string
          notes?: string
          priority?: string
          status?: string
          submitted_at?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_employee_id: string | null
          company_code: string | null
          completed_at: string | null
          created_at: string
          due_date: string | null
          id: string
          notes: string
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_employee_id?: string | null
          company_code?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_employee_id?: string | null
          company_code?: string | null
          completed_at?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_employee_id_fkey"
            columns: ["assigned_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
