create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  display_name text,
  avatar_url text,
  bio text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint username_length check (char_length(username) between 1 and 32),
  constraint display_name_length check (display_name is null or char_length(display_name) <= 40),
  constraint bio_length check (char_length(coalesce(bio, '')) <= 160)
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  emoji text default '',
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint post_body_length check (char_length(body) between 1 and 1000),
  constraint post_emoji_length check (char_length(coalesce(emoji, '')) <= 12),
  constraint post_image_limit check (array_length(image_urls, 1) is null or array_length(image_urls, 1) <= 9)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint comment_body_length check (char_length(body) between 1 and 500)
);

create table if not exists public.post_likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-images',
  'post-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.post_likes enable row level security;

drop policy if exists "Profiles are readable by everyone" on public.profiles;
drop policy if exists "Users can create own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Posts are readable by everyone" on public.posts;
drop policy if exists "Users can create own posts" on public.posts;
drop policy if exists "Users can update own posts" on public.posts;
drop policy if exists "Users can delete own posts" on public.posts;
drop policy if exists "Comments are readable by everyone" on public.comments;
drop policy if exists "Users can create own comments" on public.comments;
drop policy if exists "Users can update own comments" on public.comments;
drop policy if exists "Users can delete own comments" on public.comments;
drop policy if exists "Likes are readable by everyone" on public.post_likes;
drop policy if exists "Users can like as themselves" on public.post_likes;
drop policy if exists "Users can remove own likes" on public.post_likes;
drop policy if exists "Users can upload own post images" on storage.objects;
drop policy if exists "Post images are public" on storage.objects;
drop policy if exists "Users can update own post images" on storage.objects;
drop policy if exists "Users can delete own post images" on storage.objects;

create policy "Profiles are readable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can create own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Posts are readable by everyone"
  on public.posts for select
  using (true);

create policy "Users can create own posts"
  on public.posts for insert
  with check (auth.uid() = author_id);

create policy "Users can update own posts"
  on public.posts for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete own posts"
  on public.posts for delete
  using (auth.uid() = author_id);

create policy "Comments are readable by everyone"
  on public.comments for select
  using (true);

create policy "Users can create own comments"
  on public.comments for insert
  with check (auth.uid() = author_id);

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = author_id);

create policy "Likes are readable by everyone"
  on public.post_likes for select
  using (true);

create policy "Users can like as themselves"
  on public.post_likes for insert
  with check (auth.uid() = user_id);

create policy "Users can remove own likes"
  on public.post_likes for delete
  using (auth.uid() = user_id);

create policy "Users can upload own post images"
  on storage.objects for insert
  with check (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Post images are public"
  on storage.objects for select
  using (bucket_id = 'post-images');

create policy "Users can update own post images"
  on storage.objects for update
  using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete own post images"
  on storage.objects for delete
  using (
    bucket_id = 'post-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
