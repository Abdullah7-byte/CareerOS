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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_scoring_events: {
        Row: { application_id: string; attempt: number; created_at: string; error_code: string | null; event_type: string; id: string; profile_id: string }
        Insert: { application_id: string; attempt: number; created_at?: string; error_code?: string | null; event_type: string; id?: string; profile_id: string }
        Update: { application_id?: string; attempt?: number; created_at?: string; error_code?: string | null; event_type?: string; id?: string; profile_id?: string }
        Relationships: []
      }
      applications: {
        Row: {
          applied_at: string
          created_at: string
          id: string
          job_id: string
          match_score: number | null
          job_snapshot: Json | null
          profile_id: string
          resume_id: string | null
          resume_snapshot: Json | null
          score_attempts: number
          score_breakdown: Json | null
          score_completed_at: string | null
          score_last_error_code: string | null
          score_model_version: string | null
          score_next_retry_at: string | null
          score_rubric_version: string | null
          score_started_at: string | null
          score_status: string
          status: string
          updated_at: string
        }
        Insert: {
          applied_at?: string
          created_at?: string
          id?: string
          job_id: string
          match_score?: number | null
          job_snapshot?: Json | null
          profile_id: string
          resume_id?: string | null
          resume_snapshot?: Json | null
          score_attempts?: number
          score_breakdown?: Json | null
          score_completed_at?: string | null
          score_last_error_code?: string | null
          score_model_version?: string | null
          score_next_retry_at?: string | null
          score_rubric_version?: string | null
          score_started_at?: string | null
          score_status?: string
          status?: string
          updated_at?: string
        }
        Update: {
          applied_at?: string
          created_at?: string
          id?: string
          job_id?: string
          match_score?: number | null
          job_snapshot?: Json | null
          profile_id?: string
          resume_id?: string | null
          resume_snapshot?: Json | null
          score_attempts?: number
          score_breakdown?: Json | null
          score_completed_at?: string | null
          score_last_error_code?: string | null
          score_model_version?: string | null
          score_next_retry_at?: string | null
          score_rubric_version?: string | null
          score_started_at?: string | null
          score_status?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company: string
          created_at: string
          description: string | null
          employment_type: string | null
          id: string
          location: string | null
          profile_id: string
          title: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          profile_id: string
          title: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          employment_type?: string | null
          id?: string
          location?: string | null
          profile_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          headline: string | null
          id: string
          location: string | null
          phone: string | null
            organization_name: string | null
            organization_website: string | null
            recruiter_name: string | null
            recruiter_title: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id: string
          location?: string | null
          phone?: string | null
          organization_name?: string | null
          organization_website?: string | null
          recruiter_name?: string | null
          recruiter_title?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          phone?: string | null
          organization_name?: string | null
          organization_website?: string | null
          recruiter_name?: string | null
          recruiter_title?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      resume_education: {
        Row: {
          created_at: string
          degree: string
          end_date: string | null
          field_of_study: string | null
          grade: string | null
          id: string
          institution: string
          resume_id: string
          start_date: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          degree: string
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution: string
          resume_id: string
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          degree?: string
          end_date?: string | null
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string
          resume_id?: string
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_education_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_experiences: {
        Row: {
          company: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean
          location: string | null
          position: string
          resume_id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          company: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          position: string
          resume_id: string
          start_date: string
          updated_at?: string
        }
        Update: {
          company?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean
          location?: string | null
          position?: string
          resume_id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_experiences_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_projects: {
        Row: {
          created_at: string
          description: string | null
          github_url: string | null
          id: string
          live_url: string | null
          resume_id: string
          technologies: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          resume_id: string
          technologies?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          resume_id?: string
          technologies?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_projects_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resume_skills: {
        Row: {
          created_at: string
          id: string
          resume_id: string
          skill: string
        }
        Insert: {
          created_at?: string
          id?: string
          resume_id: string
          skill: string
        }
        Update: {
          created_at?: string
          id?: string
          resume_id?: string
          skill?: string
        }
        Relationships: [
          {
            foreignKeyName: "resume_skills_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      resumes: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          profile_id: string
          summary: string | null
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          profile_id: string
          summary?: string | null
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          profile_id?: string
          summary?: string | null
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "resumes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_application_scoring: {
        Args: { p_application_id?: string | null }
        Returns: { application_id: string; profile_id: string; resume_snapshot: Json | null; job_snapshot: Json | null; attempt: number }[]
      }
      create_candidate_resume: {
        Args: { p_resume: Json }
        Returns: { id: string; version: number }[]
      }
      save_candidate_resume: {
        Args: {
          p_resume_id: string
          p_resume: Json
          p_expected_version?: number | null
        }
        Returns: number
      }
      set_candidate_default_resume: {
        Args: {
          p_resume_id: string
        }
        Returns: undefined
      }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
