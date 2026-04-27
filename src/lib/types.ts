// Surface renderer data shapes
export interface StillImageData {
	image_path: string;
	alt: string;
}

// Interior renderer data shapes
export interface PaginatedTextData {
	pages: string[];
}

// Discriminated union for surface payloads
export type SurfaceData =
	| { surface_type: 'still-image'; surface_data: StillImageData }

// Discriminated union for interior payloads
export type InteriorData =
	| { interior_type: 'paginated-text'; interior_data: PaginatedTextData }
	| { interior_type: null; interior_data: null }

export type Shard = {
	id: string;
	created_at: string;
	audio_path: string | null;
	tending_notes: string | null;
} & SurfaceData & InteriorData;

// Database type for the Supabase client
export interface Database {
	public: {
		Tables: {
			shards: {
				Row: {
					id: string;
					surface_type: string;
					surface_data: Record<string, unknown>;
					interior_type: string | null;
					interior_data: Record<string, unknown> | null;
					audio_path: string | null;
					tending_notes: string | null;
					created_at: string;
				};
				Insert: Omit<Database['public']['Tables']['shards']['Row'], 'id' | 'created_at'> &
					Partial<Pick<Database['public']['Tables']['shards']['Row'], 'id' | 'created_at'>>;
				Update: Partial<Database['public']['Tables']['shards']['Insert']>;
			};
		};
		Views: Record<string, never>;
		Functions: Record<string, never>;
		Enums: Record<string, never>;
	};
}

// Field state — a shard placed in the drifting field
export interface FieldShard {
	shard: Shard;
	x: number;       // vw units (0–100)
	y: number;       // vh units (0–100)
	depth: number;   // [0.3, 1.0] — controls scale + drift speed
	vx: number;      // viewport units per second
	vy: number;
	id: string;      // unique placement id (not shard id — same shard can appear twice)
	clipPath: string; // CSS polygon() for broken-mirror shape
}
