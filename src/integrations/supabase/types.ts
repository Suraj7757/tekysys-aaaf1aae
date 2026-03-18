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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_name: string | null
          entity_type: string
          id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type: string
          id?: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_name?: string | null
          entity_type?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          address: string | null
          created_at: string
          deleted: boolean
          deleted_at: string | null
          email: string | null
          id: string
          mobile: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          email?: string | null
          id?: string
          mobile: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          email?: string | null
          id?: string
          mobile?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string | null
          cost_price: number
          created_at: string
          deleted: boolean
          deleted_at: string | null
          gst_percent: number
          id: string
          min_stock: number
          name: string
          quantity: number
          sell_price: number
          sku: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          cost_price?: number
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          gst_percent?: number
          id?: string
          min_stock?: number
          name: string
          quantity?: number
          sell_price?: number
          sku: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          cost_price?: number
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          gst_percent?: number
          id?: string
          min_stock?: number
          name?: string
          quantity?: number
          sell_price?: number
          sku?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_counter: {
        Row: {
          counter: number
          id: string
          user_id: string
        }
        Insert: {
          counter?: number
          id?: string
          user_id: string
        }
        Update: {
          counter?: number
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          admin_share: number
          amount: number
          created_at: string
          deleted: boolean
          deleted_at: string | null
          id: string
          job_id: string
          method: Database["public"]["Enums"]["payment_method"]
          qr_receiver: string | null
          repair_job_id: string | null
          settled: boolean
          settlement_cycle_id: string | null
          staff_share: number
          user_id: string
        }
        Insert: {
          admin_share?: number
          amount?: number
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          id?: string
          job_id: string
          method?: Database["public"]["Enums"]["payment_method"]
          qr_receiver?: string | null
          repair_job_id?: string | null
          settled?: boolean
          settlement_cycle_id?: string | null
          staff_share?: number
          user_id: string
        }
        Update: {
          admin_share?: number
          amount?: number
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          id?: string
          job_id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          qr_receiver?: string | null
          repair_job_id?: string | null
          settled?: boolean
          settlement_cycle_id?: string | null
          staff_share?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_repair_job_id_fkey"
            columns: ["repair_job_id"]
            isOneToOne: false
            referencedRelation: "repair_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      repair_jobs: {
        Row: {
          created_at: string
          customer_id: string | null
          customer_mobile: string
          customer_name: string
          deleted: boolean
          deleted_at: string | null
          delivered_at: string | null
          device_brand: string
          device_model: string | null
          estimated_cost: number
          id: string
          job_id: string
          problem_description: string
          status: Database["public"]["Enums"]["job_status"]
          technician_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          customer_mobile: string
          customer_name: string
          deleted?: boolean
          deleted_at?: string | null
          delivered_at?: string | null
          device_brand: string
          device_model?: string | null
          estimated_cost?: number
          id?: string
          job_id: string
          problem_description: string
          status?: Database["public"]["Enums"]["job_status"]
          technician_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          customer_mobile?: string
          customer_name?: string
          deleted?: boolean
          deleted_at?: string | null
          delivered_at?: string | null
          device_brand?: string
          device_model?: string | null
          estimated_cost?: number
          id?: string
          job_id?: string
          problem_description?: string
          status?: Database["public"]["Enums"]["job_status"]
          technician_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "repair_jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_cycles: {
        Row: {
          admin_share: number
          created_at: string
          deleted: boolean
          deleted_at: string | null
          end_date: string
          id: string
          settled_at: string
          settled_by: string | null
          staff_share: number
          start_date: string
          total_jobs: number
          total_revenue: number
          user_id: string
        }
        Insert: {
          admin_share?: number
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          end_date: string
          id?: string
          settled_at?: string
          settled_by?: string | null
          staff_share?: number
          start_date: string
          total_jobs?: number
          total_revenue?: number
          user_id: string
        }
        Update: {
          admin_share?: number
          created_at?: string
          deleted?: boolean
          deleted_at?: string | null
          end_date?: string
          id?: string
          settled_at?: string
          settled_by?: string | null
          staff_share?: number
          start_date?: string
          total_jobs?: number
          total_revenue?: number
          user_id?: string
        }
        Relationships: []
      }
      shop_settings: {
        Row: {
          address: string
          admin_share_percent: number
          created_at: string
          gstin: string
          id: string
          phone: string
          qr_receivers: string[]
          shop_name: string
          staff_share_percent: number
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string
          admin_share_percent?: number
          created_at?: string
          gstin?: string
          id?: string
          phone?: string
          qr_receivers?: string[]
          shop_name?: string
          staff_share_percent?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          admin_share_percent?: number
          created_at?: string
          gstin?: string
          id?: string
          phone?: string
          qr_receivers?: string[]
          shop_name?: string
          staff_share_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      next_job_id: { Args: { _user_id: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "staff"
      job_status:
        | "Received"
        | "In Progress"
        | "Ready"
        | "Delivered"
        | "Rejected"
        | "Unrepairable"
      payment_method: "Cash" | "UPI/QR" | "Due"
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
    Enums: {
      app_role: ["admin", "staff"],
      job_status: [
        "Received",
        "In Progress",
        "Ready",
        "Delivered",
        "Rejected",
        "Unrepairable",
      ],
      payment_method: ["Cash", "UPI/QR", "Due"],
    },
  },
} as const
