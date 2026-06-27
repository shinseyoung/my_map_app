-- PostGIS 확장 활성화 (위치 데이터 처리를 위함)
create extension if not exists postgis;

-- 유저 프로필 테이블
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  privacy_level text default 'public' check (privacy_level in ('public', 'followers', 'friends', 'private')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 게시물 (핀) 테이블
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  location geography(POINT) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 위치 기반 검색 성능 최적화를 위한 공간 인덱스 생성
create index posts_location_idx on public.posts using gist (location);
create index posts_created_at_idx on public.posts (created_at);

-- 24시간 이내 + 반경 내 활성 핀 조회용 RPC 함수
create or replace function get_active_pins_within_radius(
  user_lat double precision,
  user_lon double precision,
  radius_km double precision
)
returns table (
  id uuid,
  user_id uuid,
  image_url text,
  lat double precision,
  lon double precision,
  created_at timestamp with time zone
)
language sql
as $$
  select
    id,
    user_id,
    image_url,
    st_y(location::geometry) as lat,
    st_x(location::geometry) as lon,
    created_at
  from public.posts
  where
    created_at >= now() - interval '24 hours'
    and st_dwithin(
      location, 
      st_point(user_lon, user_lat)::geography, 
      radius_km * 1000 -- km를 미터로 변환
    );
$$;