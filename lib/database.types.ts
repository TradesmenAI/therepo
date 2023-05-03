export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          id: string
          checksum: string
          finished_at: string | null
          migration_name: string
          logs: string | null
          rolled_back_at: string | null
          started_at: string
          applied_steps_count: number
        }
        Insert: {
          id: string
          checksum: string
          finished_at?: string | null
          migration_name: string
          logs?: string | null
          rolled_back_at?: string | null
          started_at?: string
          applied_steps_count?: number
        }
        Update: {
          id?: string
          checksum?: string
          finished_at?: string | null
          migration_name?: string
          logs?: string | null
          rolled_back_at?: string | null
          started_at?: string
          applied_steps_count?: number
        }
      }
      "layer-images": {
        Row: {
          id: number
          layer_id: number
          image_path: string
          chance: number
        }
        Insert: {
          id?: number
          layer_id: number
          image_path: string
          chance?: number
        }
        Update: {
          id?: number
          layer_id?: number
          image_path?: string
          chance?: number
        }
      }
      layers: {
        Row: {
          id: number
          project_id: number
          name: string
        }
        Insert: {
          id?: number
          project_id: number
          name: string
        }
        Update: {
          id?: number
          project_id?: number
          name?: string
        }
      }
      MarketApp: {
        Row: {
          id: number
          name: string
          iconUrl: string
          description: string
          rating: number
          ratingCount: number
          published: boolean
        }
        Insert: {
          id?: number
          name: string
          iconUrl: string
          description: string
          rating: number
          ratingCount: number
          published?: boolean
        }
        Update: {
          id?: number
          name?: string
          iconUrl?: string
          description?: string
          rating?: number
          ratingCount?: number
          published?: boolean
        }
      }
      Profile: {
        Row: {
          id: number
          created_at: string | null
          owner_uid: string | null
          api_key: string | null
        }
        Insert: {
          id?: number
          created_at?: string | null
          owner_uid?: string | null
          api_key?: string | null
        }
        Update: {
          id?: number
          created_at?: string | null
          owner_uid?: string | null
          api_key?: string | null
        }
      }
      Project: {
        Row: {
          id: number
          name: string
          logoUrl: string | null
          fee: number
          blockchain: string
          mintCount: number | null
          minted: number | null
          traitCount: number | null
          owner_uid: string
          layers: Json
          published: boolean
        }
        Insert: {
          id?: number
          name: string
          logoUrl?: string | null
          fee: number
          blockchain: string
          mintCount?: number | null
          minted?: number | null
          traitCount?: number | null
          owner_uid: string
          layers?: Json
          published?: boolean
        }
        Update: {
          id?: number
          name?: string
          logoUrl?: string | null
          fee?: number
          blockchain?: string
          mintCount?: number | null
          minted?: number | null
          traitCount?: number | null
          owner_uid?: string
          layers?: Json
          published?: boolean
        }
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
  }
}
