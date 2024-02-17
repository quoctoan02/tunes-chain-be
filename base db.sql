use eco_tool_dev01;
create table balance_histories
(
    id             int auto_increment
        primary key,
    user_id        int                                       null,
    type           tinyint                                   null,
    balance_change decimal(26, 8)                            null,
    balance_before decimal(26, 8)                            null,
    balance_after  decimal(26, 8)                            null,
    reason_id      int                                       null,
    created_time   timestamp(3) default CURRENT_TIMESTAMP(3) null,
    updated_time   timestamp(3) default CURRENT_TIMESTAMP(3) null on update CURRENT_TIMESTAMP(3),
    currency_id    int                                       not null
);

create table balances
(
    id           int auto_increment
        primary key,
    user_id      int                                       not null,
    balance      decimal(26, 8)                            null,
    extra_data   json                                      null,
    status       int          default 1                    not null,
    created_time timestamp(3) default CURRENT_TIMESTAMP(3) null,
    updated_time timestamp(3) default CURRENT_TIMESTAMP(3) null on update CURRENT_TIMESTAMP(3),
    currency_id  int                                       not null,
    constraint gold_balances_user_id_uindex
        unique (user_id, currency_id)
);

create table blockchain_events
(
    id               int auto_increment
        primary key,
    transaction_hash varchar(255)                              not null,
    contract_id      int                                       not null,
    token_id         int          default 1                    not null,
    type             tinyint                                   not null comment '1: create, 2: transfer, 3: set price, 4 buy, 5: open box, 6: burn',
    data             json                                      not null,
    block_number     int                                       not null,
    created_time     timestamp(3) default CURRENT_TIMESTAMP(3) not null,
    updated_time     timestamp(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3),
    column_name      int                                       null
)
    collate = utf8mb4_bin;

create index blockchain_events_contract_id_token_id_index
    on blockchain_events (contract_id, token_id);

create table blockchains
(
    id           int auto_increment
        primary key,
    name         varchar(45)                               not null,
    symbol       varchar(45)                               not null,
    rpc_url      varchar(500)                              not null,
    chain_id     int          default 0                    not null,
    block_number int          default 0                    not null,
    type         tinyint      default 1                    null,
    status       tinyint                                   not null,
    created_time timestamp(3) default CURRENT_TIMESTAMP(3) not null,
    updated_time timestamp(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3)
);

create table configs
(
    id           int auto_increment
        primary key,
    `key`        varchar(45)                               null,
    metadata     json                                      null,
    type         int                                       null,
    status       int                                       null,
    value        decimal(26, 8)                            null,
    created_time timestamp(3) default CURRENT_TIMESTAMP(3) not null,
    updated_time timestamp(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3)
);

create table contracts
(
    id            int auto_increment
        primary key,
    name          varchar(45)                               null,
    status        int          default 1                    null,
    created_time  timestamp(3) default CURRENT_TIMESTAMP(3) not null,
    updated_time  timestamp(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3),
    type          int                                       null,
    address       varchar(100)                              null,
    blockchain_id int                                       null
);

create table currencies
(
    id                   int auto_increment
        primary key,
    name                 varchar(45)                               not null,
    symbol               varchar(45)                               not null,
    type                 tinyint      default 1                    not null comment '1: ingame, 2: token',
    data                 json                                      null,
    allow_deposit        tinyint      default 0                    null,
    min_deposit          decimal(26, 8)                            null,
    allow_withdrawal     tinyint      default 0                    null,
    min_withdrawal       decimal(26, 8)                            null,
    withdrawal_fee       decimal(26, 8)                            null,
    withdrawal_threshold decimal(26, 8)                            null,
    status               tinyint      default 1                    not null,
    allow_transfer       tinyint      default 0                    null,
    image                varchar(100)                              null,
    created_time         timestamp(3) default CURRENT_TIMESTAMP(3) not null,
    updated_time         timestamp(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3)
);

create table login_histories
(
    id           int auto_increment
        primary key,
    user_id      int                                       not null,
    ip           varchar(45)                               null,
    browser      varchar(45)                               null,
    os           varchar(45)                               null,
    device       varchar(45)                               null,
    location     varchar(100)                              null,
    country      varchar(45)                               null,
    created_time timestamp(3) default CURRENT_TIMESTAMP(3) not null,
    updated_time timestamp(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3)
);

create table user_referral
(
    user_id      int                                       not null,
    parent_id    int                                       not null,
    level        int          default 1                    not null,
    created_time timestamp(3) default CURRENT_TIMESTAMP(3) not null,
    updated_time timestamp(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3),
    path         varchar(1000)                             null,
    primary key (user_id, parent_id)
);

create table users
(
    id            int unsigned auto_increment
        primary key,
    email         varchar(100)                              null,
    mobile        varchar(45)                               null,
    username      varchar(45)                               null,
    address       varchar(100)                              null,
    avatar        varchar(200)                              null,
    full_name     varchar(100)                              null,
    status        tinyint      default 1                    not null comment '1: unactivated, 2: activated, 3: banned',
    last_active   timestamp                                 null,
    type          tinyint      default 1                    not null comment '1: normal user, 2: admin user',
    referral_code varchar(45)                               null,
    created_time  timestamp(3) default CURRENT_TIMESTAMP(3) not null,
    updated_time  timestamp(3) default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3)
);

create table withdrawals
(
    id           int auto_increment
        primary key,
    to_address   varchar(100)                                not null,
    user_id      int                                         not null,
    quantity     decimal(26, 8)                              not null,
    currency_id  int                                         null,
    fee          decimal(26, 8) default 0.00000000           not null,
    confirm      int            default 0                    not null,
    status       tinyint        default 1                    not null comment '1: requested, 2: done, 3: failed',
    created_time timestamp(3)   default CURRENT_TIMESTAMP(3) not null,
    updated_time timestamp(3)   default CURRENT_TIMESTAMP(3) not null on update CURRENT_TIMESTAMP(3)
);

