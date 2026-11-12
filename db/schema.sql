-- AI News Desk Supabase schema

create table if not exists connectors (
  id text primary key,
  name text not null,
  description text,
  kind text not null,
  source_type text not null,
  region_tag text,
  category text,
  priority_weight numeric default 1,
  config jsonb,
  seeds jsonb,
  created_at timestamptz default now()
);

create table if not exists raw_items (
  id text primary key,
  connector_id text references connectors(id),
  title text,
  url text,
  source_name text,
  source_type text,
  author_name text,
  published_at timestamptz,
  raw_text text,
  engagement jsonb,
  category text,
  region_tag text,
  entities text[],
  fetched_at timestamptz,
  normalized_title text
);

create table if not exists story_clusters (
  id text primary key,
  title text,
  short_summary text,
  full_summary text,
  why_it_matters text,
  content_angles jsonb,
  score numeric,
  category text,
  region_tag text,
  source_count integer,
  source_types text[],
  source_ids text[],
  manual_priority integer,
  recommended_action text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb
);
