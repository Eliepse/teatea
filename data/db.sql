create extension ltree;

create table tea_type (
    id serial PRIMARY KEY,
    path ltree unique not null unique,
    name text not null,
    origin_id integer references origin (id) on delete set null,
    group_id integer REFERENCES tea_group (id) on delete set null,
    cultivar_id integer references cultivar (id) on delete set null,
    roast_level integer,
    smoked BOOLEAN
);

create table tea_group (
    id serial PRIMARY KEY,
    name text not null
)

create table origin (
    id serial PRIMARY KEY,
    path ltree unique not null unique,
    name text not null
);

create table cultivar (
    id serial PRIMARY KEY,
    name text not null unique,
    origin_id integer references origin (id)
);

create table tea (
    id serial primary key,
    type_id integer references tea_type (id) not null,
    origin_id integer references origin (id),
    cultivar_id integer references cultivar (id),
    name text,
    blend bool,
    --     single_tree bool,
    --     old_tree    bool,
    harvest jsonb,
    --     smoked      bool,
    roast_level integer,
    --     scented     text[],
    --     organic     bool,
    altitude integer
);

create table teaware (
    id serial primary key,
    type text not null,
    name text not null,
    volume_ml integer
);

create table brewing_session (
    id serial primary key,
    tea_id integer references tea (id) not null,
    teaware_id integer references teaware (id),
    tea_quantity integer,
    created_at timestamp not null
);

create table brewing_steep (
    id serial primary key,
    brewing_session_id integer references brewing_session (id) not null,
    duration integer not null,
    temperature integer not null,
    volume_ml integer,
);