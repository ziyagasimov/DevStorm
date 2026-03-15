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
      catering_companies: {
        Row: {
          created_at: string
          icon: string
          id: string
          location: string
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          icon?: string
          id?: string
          location?: string
          name: string
          type?: string
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          location?: string
          name?: string
          type?: string
        }
        Relationships: []
      }
      catering_profiles: {
        Row: {
          company_name: string
          created_at: string
          email: string | null
          id: string
          location: string
          manager_first_name: string
          manager_last_name: string
          photo_url: string | null
          pricing: string
          services_offered: string
          user_id: string
        }
        Insert: {
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          location?: string
          manager_first_name?: string
          manager_last_name?: string
          photo_url?: string | null
          pricing?: string
          services_offered?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string | null
          id?: string
          location?: string
          manager_first_name?: string
          manager_last_name?: string
          photo_url?: string | null
          pricing?: string
          services_offered?: string
          user_id?: string
        }
        Relationships: []
      }
      communities: {
        Row: {
          created_at: string
          description: string
          icon: string
          id: string
          members: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          members?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string
          icon?: string
          id?: string
          members?: number
          name?: string
        }
        Relationships: []
      }
      community_profiles: {
        Row: {
          community_name: string
          created_at: string
          description: string
          email: string | null
          id: string
          leader_first_name: string
          leader_last_name: string
          locations: string
          num_events: number
          photo_url: string | null
          user_id: string
        }
        Insert: {
          community_name?: string
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          leader_first_name?: string
          leader_last_name?: string
          locations?: string
          num_events?: number
          photo_url?: string | null
          user_id: string
        }
        Update: {
          community_name?: string
          created_at?: string
          description?: string
          email?: string | null
          id?: string
          leader_first_name?: string
          leader_last_name?: string
          locations?: string
          num_events?: number
          photo_url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      mentor_profiles: {
        Row: {
          created_at: string
          description: string
          email: string | null
          experience: string
          expertise_area: string
          first_name: string
          id: string
          last_name: string
          photo_url: string | null
          user_id: string
          years_of_experience: number
        }
        Insert: {
          created_at?: string
          description?: string
          email?: string | null
          experience?: string
          expertise_area?: string
          first_name?: string
          id?: string
          last_name?: string
          photo_url?: string | null
          user_id: string
          years_of_experience?: number
        }
        Update: {
          created_at?: string
          description?: string
          email?: string | null
          experience?: string
          expertise_area?: string
          first_name?: string
          id?: string
          last_name?: string
          photo_url?: string | null
          user_id?: string
          years_of_experience?: number
        }
        Relationships: []
      }
      mentors: {
        Row: {
          area: string
          created_at: string
          description: string
          id: string
          name: string
          photo_url: string | null
          years: number
        }
        Insert: {
          area?: string
          created_at?: string
          description?: string
          id?: string
          name: string
          photo_url?: string | null
          years?: number
        }
        Update: {
          area?: string
          created_at?: string
          description?: string
          id?: string
          name?: string
          photo_url?: string | null
          years?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          first_name?: string
          id: string
          last_name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      speaker_profiles: {
        Row: {
          bio: string
          company: string
          created_at: string
          email: string | null
          experience: string
          expertise: string
          first_name: string
          id: string
          last_name: string
          photo_url: string | null
          user_id: string
          years_of_experience: number
        }
        Insert: {
          bio?: string
          company?: string
          created_at?: string
          email?: string | null
          experience?: string
          expertise?: string
          first_name?: string
          id?: string
          last_name?: string
          photo_url?: string | null
          user_id: string
          years_of_experience?: number
        }
        Update: {
          bio?: string
          company?: string
          created_at?: string
          email?: string | null
          experience?: string
          expertise?: string
          first_name?: string
          id?: string
          last_name?: string
          photo_url?: string | null
          user_id?: string
          years_of_experience?: number
        }
        Relationships: []
      }
      speakers: {
        Row: {
          bio: string
          company: string
          created_at: string
          expertise: string
          id: string
          name: string
          photo_url: string | null
        }
        Insert: {
          bio?: string
          company?: string
          created_at?: string
          expertise?: string
          id?: string
          name: string
          photo_url?: string | null
        }
        Update: {
          bio?: string
          company?: string
          created_at?: string
          expertise?: string
          id?: string
          name?: string
          photo_url?: string | null
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
      create_conversation: { Args: { other_user_id: string }; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_conversation_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "speaker" | "mentor" | "catering" | "community"
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
      app_role: ["user", "speaker", "mentor", "catering", "community"],
    },
  },
} as const
