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
      ad_views: {
        Row: {
          ad_id: string
          created_at: string
          earned: number
          id: string
          user_id: string
        }
        Insert: {
          ad_id: string
          created_at?: string
          earned?: number
          id?: string
          user_id: string
        }
        Update: {
          ad_id?: string
          created_at?: string
          earned?: number
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ad_views_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "ads"
            referencedColumns: ["id"]
          },
        ]
      }
      ads: {
        Row: {
          active: boolean
          clicks: number
          created_at: string
          created_by: string
          daily_limit: number
          description: string | null
          id: string
          image_url: string | null
          impressions: number
          link_url: string | null
          reward_amount: number
          title: string
        }
        Insert: {
          active?: boolean
          clicks?: number
          created_at?: string
          created_by: string
          daily_limit?: number
          description?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          link_url?: string | null
          reward_amount?: number
          title: string
        }
        Update: {
          active?: boolean
          clicks?: number
          created_at?: string
          created_by?: string
          daily_limit?: number
          description?: string | null
          id?: string
          image_url?: string | null
          impressions?: number
          link_url?: string | null
          reward_amount?: number
          title?: string
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
      otp_codes: {
        Row: {
          code: string
          created_at: string | null
          email: string
          expires_at: string
          id: string
          type: string
          verified: boolean | null
        }
        Insert: {
          code: string
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          type: string
          verified?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          type?: string
          verified?: boolean | null
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
          referral_code: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          referral_code?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          referral_code?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount: number
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          reward_amount?: number
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          reward_amount?: number
          status?: string
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
      sell_counter: {
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
      sells: {
        Row: {
          created_at: string
          customer_mobile: string
          customer_name: string
          deleted: boolean
          deleted_at: string | null
          id: string
          inventory_item_id: string | null
          item_name: string
          item_sku: string
          payment_method: string
          quantity: number
          sell_id: string
          sell_price: number
          status: string
          total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_mobile?: string
          customer_name?: string
          deleted?: boolean
          deleted_at?: string | null
          id?: string
          inventory_item_id?: string | null
          item_name: string
          item_sku?: string
          payment_method?: string
          quantity?: number
          sell_id: string
          sell_price?: number
          status?: string
          total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          customer_mobile?: string
          customer_name?: string
          deleted?: boolean
          deleted_at?: string | null
          id?: string
          inventory_item_id?: string | null
          item_name?: string
          item_sku?: string
          payment_method?: string
          quantity?: number
          sell_id?: string
          sell_price?: number
          status?: string
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sells_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory"
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
          revenue_split_enabled: boolean | null
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
          revenue_split_enabled?: boolean | null
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
          revenue_split_enabled?: boolean | null
          shop_name?: string
          staff_share_percent?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          coupon_code: string | null
          created_at: string
          expires_at: string | null
          id: string
          plan: string
          status: string
          trial_ends_at: string | null
          user_id: string
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          status?: string
          trial_ends_at?: string | null
          user_id: string
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          plan?: string
          status?: string
          trial_ends_at?: string | null
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
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          source: string
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          status?: string
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          source?: string
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_withdrawn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_withdrawn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdraw_requests: {
        Row: {
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          processed_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          processed_at?: string | null
          status?: string
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
      next_sell_id: { Args: { _user_id: string }; Returns: string }
      track_order: { Args: { _tracking_id: string }; Returns: Json }
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
