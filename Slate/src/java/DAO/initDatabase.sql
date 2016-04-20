create table LECTURE (
    LECTUREID       integer         generated always as identity,
    LECTURETITLE    varchar(50),
    COURSETITLE     varchar(50),
    INSTRUCTOR      varchar(50),

    primary key (LECTUREID)
);

create table PAGE (
    PAGEID          integer         generated always as identity,
    LECTUREID       integer,
    PAGESEQUENCE    integer,
    PAGEAUDIOURL    varchar(2038),

    primary key (PAGEID, LECTUREID),
    foreign key (LECTUREID) references LECTURE(LECTUREID)
);

create table ENTITY (
    ENTITYID        integer         generated always as identity,
    PAGEID          integer,
    LECTUREID       integer,
    ENTITYTYPE      varchar(50),
    ENTITYX         integer,
    ENTITYY         integer,
    ENTITYZ         integer,
    ENTITYCONTENT   varchar(2038),
    ENTITYANIMATION varchar(50),
    ENTITYWIDTH     integer,
    ENTITYHEIGHT    integer,

    primary key (ENTITYID, PAGEID, LECTUREID),
    foreign key (PAGEID, LECTUREID) references PAGE(PAGEID, LECTUREID)
);



