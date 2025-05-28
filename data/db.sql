create extension ltree;

create table tea_type
(
    id          serial PRIMARY KEY,
    path        ltree unique not null unique,
    name        text         not null,
    cultivar_id integer      references cultivar (id) on delete set null
);

create table origin
(
    id   serial PRIMARY KEY,
    path ltree unique not null unique,
    name text         not null
);

create table cultivar
(
    id        serial PRIMARY KEY,
    name      text not null unique,
    origin_id integer references origin (id)
);

create table tea
(
    id          serial primary key,
    type_id     integer references tea_type (id) not null,
    origin_id   integer references origin (id),
    cultivar_id integer references cultivar (id),
    name        text,
    blend       bool,
--     single_tree bool,
--     old_tree    bool,
    harvest     jsonb,
--     smoked      bool,
    roast_level integer,
--     scented     text[],
--     organic     bool,
    altitude    integer
);