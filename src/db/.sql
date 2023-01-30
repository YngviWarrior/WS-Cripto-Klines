create database if not exists `wsklines`;
use `wsklines`;

drop table if EXISTS `parity`;
create table `parity`(
    `parity` int(11) not null auto_increment,
    `symbol` varchar(10) not null,
    PRIMARY KEY (`parity`)
);

insert into `parity`(`symbol`) values ('BTCUSDT'), ('ETHUSDT'), ('USDTBRL');

drop table if EXISTS `kline`;
create table `kline`(
    `parity` int(11) not null,
    `mts` bigint(20) not null,
    `open`  decimal(60,8) not null default 0,
    `close` decimal(60,8) not null default 0,
    `high` decimal(60,8) not null default 0,
    `low` decimal(60,8) not null default 0,
    `volume` decimal(60,8) not null default 0,
    PRIMARY KEY (`parity`, `mts`)
);