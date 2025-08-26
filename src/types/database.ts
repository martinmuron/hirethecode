export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          role: 'developer' | 'company'
          display_name: string | null
          email: string
          avatar_url: string | null
          timezone: string | null
          created_at: string
        }
        Insert: {
          id: string
          role: 'developer' | 'company'
          display_name?: string | null
          email: string
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: 'developer' | 'company'
          display_name?: string | null
          email?: string
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
        }
      }
      developer_profiles: {
        Row: {
          user_id: string
          headline: string | null
          bio: string | null
          rate: number | null
          availability: 'available' | 'busy' | 'unavailable'
          portfolio_url: string | null
          github_url: string | null
          website_url: string | null
          country: string | null
        }
        Insert: {
          user_id: string
          headline?: string | null
          bio?: string | null
          rate?: number | null
          availability?: 'available' | 'busy' | 'unavailable'
          portfolio_url?: string | null
          github_url?: string | null
          website_url?: string | null
          country?: string | null
        }
        Update: {
          user_id?: string
          headline?: string | null
          bio?: string | null
          rate?: number | null
          availability?: 'available' | 'busy' | 'unavailable'
          portfolio_url?: string | null
          github_url?: string | null
          website_url?: string | null
          country?: string | null
        }
      }
      company_profiles: {
        Row: {
          user_id: string
          company_name: string
          logo_url: string | null
          about: string | null
          website_url: string | null
          industry: string | null
          size: string | null
        }
        Insert: {
          user_id: string
          company_name: string
          logo_url?: string | null
          about?: string | null
          website_url?: string | null
          industry?: string | null
          size?: string | null
        }
        Update: {
          user_id?: string
          company_name?: string
          logo_url?: string | null
          about?: string | null
          website_url?: string | null
          industry?: string | null
          size?: string | null
        }
      }
      skills: {
        Row: {
          id: number
          slug: string
          label: string
        }
        Insert: {
          id?: number
          slug: string
          label: string
        }
        Update: {
          id?: number
          slug?: string
          label?: string
        }
      }
      developer_skills: {
        Row: {
          user_id: string
          skill_id: number
          level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        }
        Insert: {
          user_id: string
          skill_id: number
          level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        }
        Update: {
          user_id?: string
          skill_id?: number
          level?: 'beginner' | 'intermediate' | 'advanced' | 'expert'
        }
      }
      projects: {
        Row: {
          id: string
          company_id: string
          title: string
          description: string
          budget_min: number | null
          budget_max: number | null
          currency: string
          timeline: string | null
          location_pref: string | null
          status: 'open' | 'in_progress' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          company_id: string
          title: string
          description: string
          budget_min?: number | null
          budget_max?: number | null
          currency?: string
          timeline?: string | null
          location_pref?: string | null
          status?: 'open' | 'in_progress' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string
          title?: string
          description?: string
          budget_min?: number | null
          budget_max?: number | null
          currency?: string
          timeline?: string | null
          location_pref?: string | null
          status?: 'open' | 'in_progress' | 'closed'
          created_at?: string
        }
      }
      project_skills: {
        Row: {
          project_id: string
          skill_id: number
        }
        Insert: {
          project_id: string
          skill_id: number
        }
        Update: {
          project_id?: string
          skill_id?: number
        }
      }
      project_intake: {
        Row: {
          id: string
          submitted_by: string
          title: string
          description: string
          skills: string[]
          budget_min: number | null
          budget_max: number | null
          contact_email: string
          contact_name: string
          company_name: string
          created_at: string
        }
        Insert: {
          id?: string
          submitted_by: string
          title: string
          description: string
          skills: string[]
          budget_min?: number | null
          budget_max?: number | null
          contact_email: string
          contact_name: string
          company_name: string
          created_at?: string
        }
        Update: {
          id?: string
          submitted_by?: string
          title?: string
          description?: string
          skills?: string[]
          budget_min?: number | null
          budget_max?: number | null
          contact_email?: string
          contact_name?: string
          company_name?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string
          product_tier: string
          status: string
          current_period_end: string
        }
        Insert: {
          id: string
          user_id: string
          stripe_customer_id: string
          product_tier: string
          status: string
          current_period_end: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string
          product_tier?: string
          status?: string
          current_period_end?: string
        }
      }
    }
  }
}