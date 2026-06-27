-- =========================================================
-- PostGIS 확장 활성화 (위치 데이터 처리를 위함)
-- =========================================================
create extension if not exists postgis;

-- =========================================================
-- 1. 유저 프로필 테이블
-- =========================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  bio text,
  website text,
  avatar_url text,
  privacy_level text default 'public' check (privacy_level in ('public', 'followers', 'friends', 'private')),
  gender text check (gender in ('male', 'female', 'unspecified')) default 'unspecified',
  birth_year int,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 팔로우 관계 테이블 (팔로워/팔로잉 카운트용)
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

create index follows_follower_idx on public.follows (follower_id);
create index follows_following_idx on public.follows (following_id);

-- =========================================================
-- 2. 게시물 (핀) 테이블 — 듀얼 카메라 (메인 + 셀카) 지원
-- =========================================================
create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  main_image_url text not null,       -- 후면(또는 메인) 카메라 사진
  sub_image_url text,                  -- 전면(셀카) 카메라 사진, BeReal 방식
  caption text,                        -- 게시물 본문
  location_tag text,                   -- 예: '#성수동'
  exact_location geography(POINT) not null,   -- 실제 좌표 (프로필/본인 조회용)
  blurred_location geography(POINT) not null, -- 안심 오차범위 적용된 좌표 (지도 노출용)
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index posts_blurred_location_idx on public.posts using gist (blurred_location);
create index posts_user_id_idx on public.posts (user_id);
create index posts_created_at_idx on public.posts (created_at);

-- =========================================================
-- 3. 좋아요 / 댓글 (2번 화면: 상세 뷰에서 사용)
-- =========================================================
create table public.likes (
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (post_id, user_id)
);

create table public.comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index comments_post_id_idx on public.comments (post_id);

-- =========================================================
-- 4. RPC: 24시간 이내 + 반경 내 활성 핀 조회 (지도용, blurred 좌표 사용)
-- =========================================================
create or replace function get_active_pins_within_radius(
  user_lat double precision,
  user_lon double precision,
  radius_km double precision,
  gender_filter text default 'all',
  min_age int default 18,
  max_age int default 100
)
returns table (
  id uuid,
  user_id uuid,
  username text,
  avatar_url text,
  main_image_url text,
  sub_image_url text,
  caption text,
  location_tag text,
  lat double precision,
  lon double precision,
  created_at timestamp with time zone
)
language sql
as $$
  select
    p.id,
    p.user_id,
    pr.username,
    pr.avatar_url,
    p.main_image_url,
    p.sub_image_url,
    p.caption,
    p.location_tag,
    st_y(p.blurred_location::geometry) as lat,
    st_x(p.blurred_location::geometry) as lon,
    p.created_at
  from public.posts p
  join public.profiles pr on pr.id = p.user_id
  where
    p.created_at >= now() - interval '24 hours'
    and st_dwithin(
      p.blurred_location,
      st_point(user_lon, user_lat)::geography,
      radius_km * 1000
    )
    and (gender_filter = 'all' or pr.gender = gender_filter)
    and (
      pr.birth_year is null
      or (extract(year from now()) - pr.birth_year) between min_age and max_age
    );
$$;

-- =========================================================
-- 5. RPC: 유저 프로필 통계 (게시물/팔로워/팔로잉 카운트, 5번 화면용)
-- =========================================================
create or replace function get_profile_stats(profile_id uuid)
returns table (
  post_count bigint,
  follower_count bigint,
  following_count bigint
)
language sql
as $$
  select
    (select count(*) from public.posts where user_id = profile_id) as post_count,
    (select count(*) from public.follows where following_id = profile_id) as follower_count,
    (select count(*) from public.follows where follower_id = profile_id) as following_count;
$$;

-- =========================================================
-- 6. RLS (Row Level Security) — 최소 정책
-- =========================================================
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.comments enable row level security;
alter table public.follows enable row level security;

create policy "프로필은 누구나 조회 가능" on public.profiles for select using (true);
create policy "본인 프로필만 수정 가능" on public.profiles for update using (auth.uid() = id);
create policy "본인 프로필만 생성 가능" on public.profiles for insert with check (auth.uid() = id);

create policy "게시물은 누구나 조회 가능" on public.posts for select using (true);
create policy "본인 게시물만 생성 가능" on public.posts for insert with check (auth.uid() = user_id);
create policy "본인 게시물만 삭제 가능" on public.posts for delete using (auth.uid() = user_id);

create policy "좋아요는 누구나 조회 가능" on public.likes for select using (true);
create policy "본인 좋아요만 생성/삭제 가능" on public.likes for insert with check (auth.uid() = user_id);
create policy "본인 좋아요만 삭제 가능" on public.likes for delete using (auth.uid() = user_id);

create policy "댓글은 누구나 조회 가능" on public.comments for select using (true);
create policy "본인 댓글만 생성 가능" on public.comments for insert with check (auth.uid() = user_id);

create policy "팔로우는 누구나 조회 가능" on public.follows for select using (true);
create policy "본인 팔로우만 생성/삭제 가능" on public.follows for insert with check (auth.uid() = follower_id);
create policy "본인 팔로우만 삭제 가능" on public.follows for delete using (auth.uid() = follower_id);