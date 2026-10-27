--
-- PostgreSQL database dump
--

\restrict lcrAJjsBEg8dyUI0VQtsLIT6MkZgbCJf0X8FRplb0fOfTdfxZhOLaVv30npF40H

-- Dumped from database version 16.15
-- Dumped by pg_dump version 16.15 (Ubuntu 16.15-0ubuntu0.24.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: maintenances_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.maintenances_status_enum AS ENUM (
    'SCHEDULED',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public.maintenances_status_enum OWNER TO postgres;

--
-- Name: maintenances_type_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.maintenances_type_enum AS ENUM (
    'PREVENTIVE',
    'CORRECTIVE'
);


ALTER TYPE public.maintenances_type_enum OWNER TO postgres;

--
-- Name: mechanics_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.mechanics_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.mechanics_status_enum OWNER TO postgres;

--
-- Name: users_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.users_role_enum AS ENUM (
    'ADMIN',
    'TECHNICIAN'
);


ALTER TYPE public.users_role_enum OWNER TO postgres;

--
-- Name: vehicles_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.vehicles_status_enum AS ENUM (
    'AVAILABLE',
    'IN_MAINTENANCE',
    'INACTIVE'
);


ALTER TYPE public.vehicles_status_enum OWNER TO postgres;

--
-- Name: workshops_status_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.workshops_status_enum AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public.workshops_status_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: maintenances; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.maintenances (
    id integer NOT NULL,
    type public.maintenances_type_enum NOT NULL,
    status public.maintenances_status_enum DEFAULT 'SCHEDULED'::public.maintenances_status_enum NOT NULL,
    description text NOT NULL,
    mileage integer NOT NULL,
    "scheduledDate" timestamp without time zone NOT NULL,
    "workDone" text,
    cost numeric(12,2),
    "finishedAt" timestamp without time zone,
    "cancellationReason" text,
    "vehicleId" integer NOT NULL,
    "mechanicId" integer NOT NULL,
    "workshopId" integer NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.maintenances OWNER TO postgres;

--
-- Name: maintenances_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.maintenances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenances_id_seq OWNER TO postgres;

--
-- Name: maintenances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.maintenances_id_seq OWNED BY public.maintenances.id;


--
-- Name: mechanics; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.mechanics (
    id integer NOT NULL,
    name character varying NOT NULL,
    email character varying NOT NULL,
    specialty character varying NOT NULL,
    status public.mechanics_status_enum DEFAULT 'ACTIVE'::public.mechanics_status_enum NOT NULL,
    "userId" integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.mechanics OWNER TO postgres;

--
-- Name: mechanics_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.mechanics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.mechanics_id_seq OWNER TO postgres;

--
-- Name: mechanics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.mechanics_id_seq OWNED BY public.mechanics.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying NOT NULL,
    password character varying NOT NULL,
    role public.users_role_enum DEFAULT 'TECHNICIAN'::public.users_role_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vehicles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.vehicles (
    id integer NOT NULL,
    plate character varying NOT NULL,
    brand character varying NOT NULL,
    model character varying NOT NULL,
    year integer NOT NULL,
    mileage integer DEFAULT 0 NOT NULL,
    status public.vehicles_status_enum DEFAULT 'AVAILABLE'::public.vehicles_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.vehicles OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.vehicles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.vehicles_id_seq OWNER TO postgres;

--
-- Name: vehicles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.vehicles_id_seq OWNED BY public.vehicles.id;


--
-- Name: workshops; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.workshops (
    id integer NOT NULL,
    name character varying NOT NULL,
    address character varying NOT NULL,
    status public.workshops_status_enum DEFAULT 'ACTIVE'::public.workshops_status_enum NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.workshops OWNER TO postgres;

--
-- Name: workshops_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.workshops_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.workshops_id_seq OWNER TO postgres;

--
-- Name: workshops_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.workshops_id_seq OWNED BY public.workshops.id;


--
-- Name: maintenances id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances ALTER COLUMN id SET DEFAULT nextval('public.maintenances_id_seq'::regclass);


--
-- Name: mechanics id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics ALTER COLUMN id SET DEFAULT nextval('public.mechanics_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: vehicles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles ALTER COLUMN id SET DEFAULT nextval('public.vehicles_id_seq'::regclass);


--
-- Name: workshops id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workshops ALTER COLUMN id SET DEFAULT nextval('public.workshops_id_seq'::regclass);


--
-- Data for Name: maintenances; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.maintenances (id, type, status, description, mileage, "scheduledDate", "workDone", cost, "finishedAt", "cancellationReason", "vehicleId", "mechanicId", "workshopId", "createdAt", "updatedAt") FROM stdin;
1	PREVENTIVE	COMPLETED	Mantenimiento de 50,000 km y cambio de filtros	50500	2026-11-10 03:00:00	Cambio de aceite motor y filtros de aire completados satisfactoriamente	320000.00	2026-11-10 09:00:00	\N	3	3	1	2026-10-27 14:19:24.326109	2026-10-27 14:19:24.373691
2	CORRECTIVE	CANCELLED	Mantenimiento a ser cancelado	35000	2026-11-25 03:00:00	\N	\N	\N	Repuestos fuera de catálogo	6	3	1	2026-10-27 14:19:24.398602	2026-10-27 14:19:24.415378
3	PREVENTIVE	SCHEDULED	Intento de transición inválida directa	35000	2026-11-28 03:00:00	\N	\N	\N	\N	6	3	1	2026-10-27 14:19:24.43648	2026-10-27 14:19:24.43648
4	PREVENTIVE	COMPLETED	Cambio de aceite y filtros	45000	2026-09-15 11:30:00	Cambio de aceite y filtros realizado con éxito	350000.00	2026-09-15 13:30:00	\N	8	6	5	2026-10-27 14:30:54.625786	2026-10-27 14:30:54.625786
5	CORRECTIVE	IN_PROGRESS	Reparación de inyectores y sistema de combustible	85000	2026-10-20 03:00:00	\N	\N	\N	\N	10	7	5	2026-10-27 14:30:54.628205	2026-10-27 14:30:54.628205
6	PREVENTIVE	COMPLETED	Mantenimiento de 50,000 km y cambio de filtros	50500	2026-11-10 03:00:00	Cambio de aceite motor y filtros de aire completados satisfactoriamente	320000.00	2026-11-10 09:00:00	\N	12	9	7	2026-10-27 14:31:54.16299	2026-10-27 14:31:54.207047
7	CORRECTIVE	CANCELLED	Mantenimiento a ser cancelado	35000	2026-11-25 03:00:00	\N	\N	\N	Repuestos fuera de catálogo	15	9	7	2026-10-27 14:31:54.223716	2026-10-27 14:31:54.2367
8	PREVENTIVE	SCHEDULED	Intento de transición inválida directa	35000	2026-11-28 03:00:00	\N	\N	\N	\N	15	9	7	2026-10-27 14:31:54.25099	2026-10-27 14:31:54.25099
9	PREVENTIVE	COMPLETED	Revisión y cambio de aceite de frenos	40100	2026-11-01 03:00:00	Cambio de pastillas y purga de líquido de frenos	250000.00	2026-11-01 06:00:00	\N	16	11	9	2026-10-27 14:31:56.224707	2026-10-27 14:31:56.248219
10	PREVENTIVE	COMPLETED	Mantenimiento de 50,000 km y cambio de filtros	50500	2026-11-10 03:00:00	Cambio de aceite motor y filtros de aire completados satisfactoriamente	320000.00	2026-11-10 09:00:00	\N	18	13	12	2026-10-27 14:32:40.144646	2026-10-27 14:32:40.189105
11	CORRECTIVE	CANCELLED	Mantenimiento a ser cancelado	35000	2026-11-25 03:00:00	\N	\N	\N	Repuestos fuera de catálogo	21	13	12	2026-10-27 14:32:40.207024	2026-10-27 14:32:40.219879
12	PREVENTIVE	SCHEDULED	Intento de transición inválida directa	35000	2026-11-28 03:00:00	\N	\N	\N	\N	21	13	12	2026-10-27 14:32:40.233595	2026-10-27 14:32:40.233595
13	PREVENTIVE	COMPLETED	Revisión y cambio de aceite de frenos	40100	2026-11-01 03:00:00	Cambio de pastillas y purga de líquido de frenos	250000.00	2026-11-01 06:00:00	\N	22	15	14	2026-10-27 14:32:41.143044	2026-10-27 14:32:41.164965
14	PREVENTIVE	COMPLETED	Mantenimiento de 50,000 km y cambio de filtros	50500	2026-11-10 03:00:00	Cambio de aceite motor y filtros de aire completados satisfactoriamente	320000.00	2026-11-10 09:00:00	\N	24	17	17	2026-10-27 14:38:11.15732	2026-10-27 14:38:11.202577
15	CORRECTIVE	CANCELLED	Mantenimiento a ser cancelado	35000	2026-11-25 03:00:00	\N	\N	\N	Repuestos fuera de catálogo	27	17	17	2026-10-27 14:38:11.219265	2026-10-27 14:38:11.232672
16	PREVENTIVE	SCHEDULED	Intento de transición inválida directa	35000	2026-11-28 03:00:00	\N	\N	\N	\N	27	17	17	2026-10-27 14:38:11.245884	2026-10-27 14:38:11.245884
17	PREVENTIVE	COMPLETED	Revisión y cambio de aceite de frenos	40100	2026-11-01 03:00:00	Cambio de pastillas y purga de líquido de frenos	250000.00	2026-11-01 06:00:00	\N	28	19	19	2026-10-27 14:38:14.315381	2026-10-27 14:38:14.34542
\.


--
-- Data for Name: mechanics; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.mechanics (id, name, email, specialty, status, "userId", "createdAt", "updatedAt") FROM stdin;
1	Carlos Pérez	carlos_1793109480892@fleetcore.com	Diagnóstico Electrónico	ACTIVE	\N	2026-10-27 13:58:04.312819	2026-10-27 13:58:04.357757
2	Carlos Pérez	carlos_1793109504735@fleetcore.com	Diagnóstico Electrónico	ACTIVE	\N	2026-10-27 13:58:25.091689	2026-10-27 13:58:25.138468
3	Mecánico Asignado 1793110763800	tech_mech_1793110763800@fleetcore.com	Motor y Frenos	ACTIVE	26	2026-10-27 14:19:24.287771	2026-10-27 14:19:24.287771
4	Mecánico Inactivo 1793110763800	inact_mech_1793110763800@fleetcore.com	General	INACTIVE	\N	2026-10-27 14:19:24.295059	2026-10-27 14:19:24.309126
5	Carlos Pérez	carlos_1793110766079@fleetcore.com	Diagnóstico Electrónico	ACTIVE	\N	2026-10-27 14:19:26.444715	2026-10-27 14:19:26.493992
6	Carlos Pérez	carlos.perez@fleetcore.com	Frenos y Suspensión	ACTIVE	39	2026-10-27 14:30:54.61344	2026-10-27 14:30:54.61344
7	Andrés Gómez	andres.gomez@fleetcore.com	Motor Diésel	ACTIVE	40	2026-10-27 14:30:54.615207	2026-10-27 14:30:54.615207
8	Mario Castro	mario.castro@fleetcore.com	Sistemas Eléctricos	INACTIVE	\N	2026-10-27 14:30:54.616326	2026-10-27 14:30:54.616326
9	Mecánico Asignado 1793111513653	tech_mech_1793111513653@fleetcore.com	Motor y Frenos	ACTIVE	42	2026-10-27 14:31:54.132353	2026-10-27 14:31:54.132353
10	Mecánico Inactivo 1793111513653	inact_mech_1793111513653@fleetcore.com	General	INACTIVE	\N	2026-10-27 14:31:54.137224	2026-10-27 14:31:54.146521
11	Mecánico Historial 1793111515841	mech_his_1793111515841@fleetcore.com	Frenos	ACTIVE	49	2026-10-27 14:31:56.20746	2026-10-27 14:31:56.20746
12	Carlos Pérez	carlos_1793111516794@fleetcore.com	Diagnóstico Electrónico	ACTIVE	\N	2026-10-27 14:31:57.165388	2026-10-27 14:31:57.209547
13	Mecánico Asignado 1793111559630	tech_mech_1793111559630@fleetcore.com	Motor y Frenos	ACTIVE	61	2026-10-27 14:32:40.109085	2026-10-27 14:32:40.109085
14	Mecánico Inactivo 1793111559630	inact_mech_1793111559630@fleetcore.com	General	INACTIVE	\N	2026-10-27 14:32:40.115305	2026-10-27 14:32:40.127987
15	Mecánico Historial 1793111560760	mech_his_1793111560760@fleetcore.com	Frenos	ACTIVE	64	2026-10-27 14:32:41.12991	2026-10-27 14:32:41.12991
16	Carlos Pérez	carlos_1793111561705@fleetcore.com	Diagnóstico Electrónico	ACTIVE	\N	2026-10-27 14:32:42.071373	2026-10-27 14:32:42.123468
17	Mecánico Asignado 1793111890634	tech_mech_1793111890634@fleetcore.com	Motor y Frenos	ACTIVE	72	2026-10-27 14:38:11.122353	2026-10-27 14:38:11.122353
18	Mecánico Inactivo 1793111890634	inact_mech_1793111890634@fleetcore.com	General	INACTIVE	\N	2026-10-27 14:38:11.131755	2026-10-27 14:38:11.141087
19	Mecánico Historial 1793111893929	mech_his_1793111893929@fleetcore.com	Frenos	ACTIVE	79	2026-10-27 14:38:14.302272	2026-10-27 14:38:14.302272
20	Carlos Pérez	carlos_1793111894875@fleetcore.com	Diagnóstico Electrónico	ACTIVE	\N	2026-10-27 14:38:15.239996	2026-10-27 14:38:15.290045
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, email, password, role, "createdAt", "updatedAt") FROM stdin;
1	admin_1793108333215@fleetcore.com	$2b$10$jJ04rAzE0E.9vccZPH1XBekYqn9slAW9r2joGpwHurZUEsjcCDuLG	ADMIN	2026-10-27 13:38:53.396542	2026-10-27 13:38:53.396542
2	tech_1793108333215@fleetcore.com	$2b$10$b1JgjSBrYj8wnXhI5d94Fud1x./mya7eQ0/ZbQ8TYKSk27e9f5QCG	TECHNICIAN	2026-10-27 13:38:53.459389	2026-10-27 13:38:53.459389
3	login_1793108333215@fleetcore.com	$2b$10$r6Ale3hsMafdD2GN.bimRu7nm8yOs05/aS6Li7eBapk2.M5A17xX2	ADMIN	2026-10-27 13:38:53.523857	2026-10-27 13:38:53.523857
4	techlogin_1793108333215@fleetcore.com	$2b$10$XynH3//0T0vtsVEUqz10DOYd8mK4vaZ8Z3FnlkeaHQyocYQ31PAAy	TECHNICIAN	2026-10-27 13:38:53.578583	2026-10-27 13:38:53.578583
5	admin_1793108397530@fleetcore.com	$2b$10$2P38tQLPozQ5b40CkVPVn.3.tDRYzEdX65uovENEW5SqodkMjEDGC	ADMIN	2026-10-27 13:39:57.714095	2026-10-27 13:39:57.714095
6	tech_1793108397530@fleetcore.com	$2b$10$p.EdLu3Y0ARZznnHmPmqRe.IICmG6wuOcxmjccu05eG1/tx96yiA6	TECHNICIAN	2026-10-27 13:39:57.776104	2026-10-27 13:39:57.776104
7	login_1793108397531@fleetcore.com	$2b$10$my4Ge6yRsAXvucnBSSRd7.SiK6KHgy3JADLbHYzaeO7d9UORcXkBa	ADMIN	2026-10-27 13:39:57.839984	2026-10-27 13:39:57.839984
8	techlogin_1793108397531@fleetcore.com	$2b$10$zv5/1626z63rYXlUf9fAM.oMfcies4qtNcqUajdG0s4L5ryA6L6vG	TECHNICIAN	2026-10-27 13:39:57.894061	2026-10-27 13:39:57.894061
9	admin_e2_1793109480892@fleetcore.com	$2b$10$ANBPQWBW8rRrPZv1p3.lW.01KJniewymOcPyTpJAOBSEl2nu4.Q/.	ADMIN	2026-10-27 13:58:01.094081	2026-10-27 13:58:01.094081
10	tech_e2_1793109480892@fleetcore.com	$2b$10$VEzMOhSl1XLZedbD7EMJxu5FS9dl27LmOVwTC1wib4/T6lv3qQbSe	TECHNICIAN	2026-10-27 13:58:01.155887	2026-10-27 13:58:01.155887
11	admin_1793109480892@fleetcore.com	$2b$10$EGMxNq4uFjfPgzbS7wqqCeWo6yuE.wkgRKVsAnSKKcM4zc3xf9kZC	ADMIN	2026-10-27 13:58:04.135956	2026-10-27 13:58:04.135956
12	admin_e3_1793109480892@fleetcore.com	$2b$10$YrPTcnxH3/D4prlOG3.Gxe2fVzHlWjF5vg9i1JfJ4gmiwtFoe0gJW	ADMIN	2026-10-27 13:58:04.135974	2026-10-27 13:58:04.135974
13	tech_e3_1793109480892@fleetcore.com	$2b$10$8eYfX3708GiqHk0dfxxOKuO3OJacPMzYvxq/RVfDjpRnQQKy.dro6	TECHNICIAN	2026-10-27 13:58:04.196967	2026-10-27 13:58:04.196967
14	tech_1793109480892@fleetcore.com	$2b$10$UFNUQS3ESZlP619etcB8BOc6TBE2TYXl7r5MR0TLtJrrj9w0jpt4i	TECHNICIAN	2026-10-27 13:58:04.197595	2026-10-27 13:58:04.197595
15	login_1793109480893@fleetcore.com	$2b$10$6luY63So6Sc/VRPEWbfTHumrcIAB.Dnbx5a2PLwH7Vc.BY7PYvHiC	ADMIN	2026-10-27 13:58:04.261588	2026-10-27 13:58:04.261588
16	techlogin_1793109480893@fleetcore.com	$2b$10$nLZwLCJRNdz5izUKAQ.x6ON5YkxiIkngqAHQCXVHCOKQ0RHJm1Wsi	TECHNICIAN	2026-10-27 13:58:04.315185	2026-10-27 13:58:04.315185
17	admin_1793109503698@fleetcore.com	$2b$10$BpZ8wOYPXsXl3/87wnj3dOUcR7WQ2kByw8zpR3AuhZY.gJSZc46J2	ADMIN	2026-10-27 13:58:23.885587	2026-10-27 13:58:23.885587
18	tech_1793109503698@fleetcore.com	$2b$10$ZORv.8AuIN.yc2DzqFJ2UuyJAkgwXuBwtcExzYur4pKC7zm1CxfD2	TECHNICIAN	2026-10-27 13:58:23.948037	2026-10-27 13:58:23.948037
19	login_1793109503698@fleetcore.com	$2b$10$an1dPkLdFSNB4ddS2sTp6ehYYthmsKNTleUc5cqtphzYHk0TcRDDS	ADMIN	2026-10-27 13:58:24.013171	2026-10-27 13:58:24.013171
20	techlogin_1793109503698@fleetcore.com	$2b$10$zRWdh.mQPTYH5jVAAchBCeRR3xiHApwUiCYlTh/97G7CKu8lIlLee	TECHNICIAN	2026-10-27 13:58:24.066873	2026-10-27 13:58:24.066873
21	admin_e3_1793109504735@fleetcore.com	$2b$10$2vgbe14ea.lSCT7pObYtKuAY.aDbcTXXKp3tqIL4OVrz3NOlAO9WO	ADMIN	2026-10-27 13:58:24.919884	2026-10-27 13:58:24.919884
22	tech_e3_1793109504735@fleetcore.com	$2b$10$HjmNzW1mai6bH.iQV1gOheJ0l/K7ZWuvBx4XyVdYn/gHwShGEpNjS	TECHNICIAN	2026-10-27 13:58:24.979621	2026-10-27 13:58:24.979621
23	admin_e2_1793109505631@fleetcore.com	$2b$10$lboq7x4LpsNdF8jNvY1Lj.tILtAC1b1MvWpKdF2JG0yN21i1Lxz1W	ADMIN	2026-10-27 13:58:25.822266	2026-10-27 13:58:25.822266
24	tech_e2_1793109505631@fleetcore.com	$2b$10$mHohWAapezznbLanVAqTUunvz.V2u8TrvUEyLxo1IHeYsFEPBaCHq	TECHNICIAN	2026-10-27 13:58:25.883324	2026-10-27 13:58:25.883324
25	admin_e5_1793110763800@fleetcore.com	$2b$10$ET8myMR2pNnN3qKzXht8z.3O5w4H1JMDOM6wmEVX27EAQjX6LB9dS	ADMIN	2026-10-27 14:19:23.995829	2026-10-27 14:19:23.995829
26	tech_e5_1793110763800@fleetcore.com	$2b$10$WA76LewP7kxGMfpokR1oDuuzRdn9QOeTlmXsVqVtUePekE9VX.eSa	TECHNICIAN	2026-10-27 14:19:24.057469	2026-10-27 14:19:24.057469
27	other_tech_e5_1793110763800@fleetcore.com	$2b$10$TiPuwt0bDokQRxoQNSCgxO96LJLj3tSQDWDX/7EYnIJxe2cUkXFKa	TECHNICIAN	2026-10-27 14:19:24.113927	2026-10-27 14:19:24.113927
28	admin_1793110764987@fleetcore.com	$2b$10$hvapMBf.g0FzQoaMjq8ZRutd.IEcRdAZHI.gFkqrfdP49h7bD2Cyy	ADMIN	2026-10-27 14:19:25.195105	2026-10-27 14:19:25.195105
29	tech_1793110764987@fleetcore.com	$2b$10$eSaddht4NYvw7oJL9nTNbOPdXP5Wr7CqJ54ZM1CDBPBFMH9SY988u	TECHNICIAN	2026-10-27 14:19:25.260693	2026-10-27 14:19:25.260693
30	login_1793110764988@fleetcore.com	$2b$10$zyB9CdHo120BJZNduvxiTe3mRaRHs5HGly3YwU9aOJQJXG1RLpdA2	ADMIN	2026-10-27 14:19:25.324657	2026-10-27 14:19:25.324657
31	techlogin_1793110764988@fleetcore.com	$2b$10$FpeqifVQ/o6WxLBz9OESMeGsocKLe72ociEKiM6gx/QBq.U0IlCne	TECHNICIAN	2026-10-27 14:19:25.379538	2026-10-27 14:19:25.379538
32	admin_e3_1793110766079@fleetcore.com	$2b$10$GmgeyvbTJtP4Dy67ybX6QuosdCyyr602xe8vUFAIWYA.Izpet3VW2	ADMIN	2026-10-27 14:19:26.268811	2026-10-27 14:19:26.268811
33	tech_e3_1793110766079@fleetcore.com	$2b$10$7Pan1HKQemHf.nWcbVha1uhvPODUDPKsylvWisCqVgqtVgRig7Eji	TECHNICIAN	2026-10-27 14:19:26.328233	2026-10-27 14:19:26.328233
34	admin_e2_1793110767040@fleetcore.com	$2b$10$YjkjSl0jpJ83JsUHVt.kbubTEQF7LTvHGqfmT6v9PtWz21AGJJOQi	ADMIN	2026-10-27 14:19:27.232187	2026-10-27 14:19:27.232187
35	tech_e2_1793110767040@fleetcore.com	$2b$10$oXizEAg3DeLTl79HIxywBOgmkQdgrir2gba9EaTZQdEZbC7pRhg5q	TECHNICIAN	2026-10-27 14:19:27.293726	2026-10-27 14:19:27.293726
36	admin_e4_1793110767950@fleetcore.com	$2b$10$jgo4HkxRw5QfArdYE05AGefLhYYUYzITl/uTbyv2DUDMUe1XNQ45y	ADMIN	2026-10-27 14:19:28.141357	2026-10-27 14:19:28.141357
37	tech_e4_1793110767950@fleetcore.com	$2b$10$pY1raoalGLvAsdrNi/RepOpvhhZLT1KFnr1bgRCALmMhT/DgZFeOy	TECHNICIAN	2026-10-27 14:19:28.201702	2026-10-27 14:19:28.201702
38	admin@fleetcore.com	$2b$10$uuUhwTwVfEvXCNY/q3btdOv3eAr1Q7QssInlrJTOMBC8uq9NyoVLi	ADMIN	2026-10-27 14:30:54.600758	2026-10-27 14:30:54.600758
39	tecnico1@fleetcore.com	$2b$10$uuUhwTwVfEvXCNY/q3btdOv3eAr1Q7QssInlrJTOMBC8uq9NyoVLi	TECHNICIAN	2026-10-27 14:30:54.606301	2026-10-27 14:30:54.606301
40	tecnico2@fleetcore.com	$2b$10$uuUhwTwVfEvXCNY/q3btdOv3eAr1Q7QssInlrJTOMBC8uq9NyoVLi	TECHNICIAN	2026-10-27 14:30:54.60804	2026-10-27 14:30:54.60804
41	admin_e5_1793111513653@fleetcore.com	$2b$10$mVTRzYpMNAfnw/V5C4vA9etfo1yQj3z0uDRNbPeflXIzuV83BLicK	ADMIN	2026-10-27 14:31:53.846985	2026-10-27 14:31:53.846985
42	tech_e5_1793111513653@fleetcore.com	$2b$10$98mn7sr0i3ljil2mCgTWLOQ735Rf6HuUVDkrP/zHAH8aC7riJtDWO	TECHNICIAN	2026-10-27 14:31:53.910503	2026-10-27 14:31:53.910503
43	other_tech_e5_1793111513653@fleetcore.com	$2b$10$PUwvi8kfOANe3DmfqWTxs.FAWWrnBUxzRanBPPsorkt5fBF6LmBWi	TECHNICIAN	2026-10-27 14:31:53.963336	2026-10-27 14:31:53.963336
44	admin_1793111514769@fleetcore.com	$2b$10$NDXy8xkIiU4Tyg59PTk4ae.zF0WgkV2D0BVw5rOa2f5RXjA1Y0VCa	ADMIN	2026-10-27 14:31:54.960382	2026-10-27 14:31:54.960382
45	tech_1793111514769@fleetcore.com	$2b$10$QWEB9yfK7d1N299Yrk8FFuXiT.nLbJTMWO3r0OEejDc.M9x83PqHm	TECHNICIAN	2026-10-27 14:31:55.024733	2026-10-27 14:31:55.024733
46	login_1793111514770@fleetcore.com	$2b$10$zza9nH3dWSiRSjuuolBxKu3Grb0bKwvSodbChVQLYus8rCpRvpWuS	ADMIN	2026-10-27 14:31:55.089242	2026-10-27 14:31:55.089242
47	techlogin_1793111514770@fleetcore.com	$2b$10$b4kDjTV3JXvkLsHNV4VL3O7FzBG2w3oQmRmlFlPjZoWAJ9t4kmpVu	TECHNICIAN	2026-10-27 14:31:55.141328	2026-10-27 14:31:55.141328
48	admin_e6_1793111515841@fleetcore.com	$2b$10$QxKglXxBNyjB1yondGkQo.B4sOF0TtLgFEOtx7JxabPsrArkpghPm	ADMIN	2026-10-27 14:31:56.030792	2026-10-27 14:31:56.030792
49	tech_e6_1793111515841@fleetcore.com	$2b$10$S703QalJwFjfmmw12l6CW.peydxSs.apWcTFfMoavi6Fdouh/wMVm	TECHNICIAN	2026-10-27 14:31:56.093806	2026-10-27 14:31:56.093806
50	admin_e3_1793111516794@fleetcore.com	$2b$10$4/9BTm2LC4D6LoTLe7GM6Oswca.lJ9DpTbUlDV004IGo9wsX0HVtm	ADMIN	2026-10-27 14:31:56.986899	2026-10-27 14:31:56.986899
51	tech_e3_1793111516794@fleetcore.com	$2b$10$Uypw8/3QRMilrJYKhuInlusr35..2r5A9wjcSB0FKSHkFiNSQS/rm	TECHNICIAN	2026-10-27 14:31:57.05001	2026-10-27 14:31:57.05001
52	admin_e4_1793111517712@fleetcore.com	$2b$10$xzo5FyKZMqcniG3lmDLP3OC86sXTsMrPaNEt09CbnhrnCvo7utF1y	ADMIN	2026-10-27 14:31:57.904345	2026-10-27 14:31:57.904345
53	tech_e4_1793111517712@fleetcore.com	$2b$10$B8G2EyRL10EdA3YqNtJcGuFlJn7i4cuJSyKUP9KLUhROjK2VoVRZu	TECHNICIAN	2026-10-27 14:31:57.965026	2026-10-27 14:31:57.965026
54	admin_e2_1793111518650@fleetcore.com	$2b$10$tp9h53cusECrm7RcllLGIe082EGUP0GaoJSyv/aRoXfjjmkjvjrFK	ADMIN	2026-10-27 14:31:58.83934	2026-10-27 14:31:58.83934
55	tech_e2_1793111518650@fleetcore.com	$2b$10$ZHXnk2.gwb56jUbEuLjft.QE09XcDikz1X11O9CY2NsVRZ7ZxxpvS	TECHNICIAN	2026-10-27 14:31:58.90157	2026-10-27 14:31:58.90157
56	admin_1793111557387@fleetcore.com	$2b$10$b1qeCIMIBaIete4u7ilibutdayOAWHhn59UCuBYrRL3jeyjl52g0a	ADMIN	2026-10-27 14:32:37.58424	2026-10-27 14:32:37.58424
57	tech_1793111557387@fleetcore.com	$2b$10$m5qvu0quxv7WBsK/hNFS7u8w5EOgYvHomPI2gMhadKB6oNHOqFsE2	TECHNICIAN	2026-10-27 14:32:37.64876	2026-10-27 14:32:37.64876
58	login_1793111557388@fleetcore.com	$2b$10$6eQAKUwQwq/Nv9I0/tDTw.it.RpLTRYf2nI.FNBV1jH52kocSWpP2	ADMIN	2026-10-27 14:32:37.714488	2026-10-27 14:32:37.714488
59	techlogin_1793111557388@fleetcore.com	$2b$10$AKJQsOel.kiXYgiF1QDnruThTi6r/cO1v6H1TKuHkx1pDy/WYIzO2	TECHNICIAN	2026-10-27 14:32:37.774846	2026-10-27 14:32:37.774846
60	admin_e5_1793111559630@fleetcore.com	$2b$10$AQX0XkVy15INCdBpgO3HwuoDsGRzzi09pFeyXTrI.VYtGfqDWSNtG	ADMIN	2026-10-27 14:32:39.822759	2026-10-27 14:32:39.822759
61	tech_e5_1793111559630@fleetcore.com	$2b$10$KeHna9ba71UX4vtqHjtFtu/NrtDHXH8D6qn8o3316nCyOD.5EI1C6	TECHNICIAN	2026-10-27 14:32:39.884949	2026-10-27 14:32:39.884949
62	other_tech_e5_1793111559630@fleetcore.com	$2b$10$JXO2jdPfuCjCruAxliiP5.39JAGsFt2M4luGlc656WhXbMpbL7KDG	TECHNICIAN	2026-10-27 14:32:39.939988	2026-10-27 14:32:39.939988
63	admin_e6_1793111560760@fleetcore.com	$2b$10$gcfyz6uIzfR7r8dpnt5j/e3k/dG4420PKQYNthSrRVaaRTkwlsX0e	ADMIN	2026-10-27 14:32:40.950686	2026-10-27 14:32:40.950686
64	tech_e6_1793111560760@fleetcore.com	$2b$10$SciNSr5xQdF/CG7RfquSmOzKdPnBOOs8vrb9VCuc1vbkjONWj.99W	TECHNICIAN	2026-10-27 14:32:41.010928	2026-10-27 14:32:41.010928
65	admin_e3_1793111561705@fleetcore.com	$2b$10$v4HnCQyCYBfV1pPbg5iryeD4pnlG4LxupwLUwcYVZzoSMIuYmbqC2	ADMIN	2026-10-27 14:32:41.897055	2026-10-27 14:32:41.897055
66	tech_e3_1793111561705@fleetcore.com	$2b$10$mkKcxBbt1OBdAJODDvt1QeoyMRirlU01PWFhAPHc7deuB7asaf61G	TECHNICIAN	2026-10-27 14:32:41.959044	2026-10-27 14:32:41.959044
67	admin_e2_1793111562629@fleetcore.com	$2b$10$oH8BQ8iooUDy.7mCInDgv.zecrJMKgn7h6alYkTxSHNugdyju3YCC	ADMIN	2026-10-27 14:32:42.820383	2026-10-27 14:32:42.820383
68	tech_e2_1793111562629@fleetcore.com	$2b$10$vUa3EdMUv/0VnWkQuwFkCOxzvtZXou8nqG/gP.xYpVQlcwGH60AGC	TECHNICIAN	2026-10-27 14:32:42.879558	2026-10-27 14:32:42.879558
69	admin_e4_1793111563535@fleetcore.com	$2b$10$1oj8cdvOhayGDKGTWZwN7Ocu/wVCc1/VNIt8..NEh/2ZGG44lUcwK	ADMIN	2026-10-27 14:32:43.724243	2026-10-27 14:32:43.724243
70	tech_e4_1793111563535@fleetcore.com	$2b$10$.1BLlIFk4r575mQonwdHoOClDgqkGzK3VKC8AmMSUqS3VpMjoXA4e	TECHNICIAN	2026-10-27 14:32:43.785353	2026-10-27 14:32:43.785353
71	admin_e5_1793111890634@fleetcore.com	$2b$10$pyakIBe8Q10eO9p.hOF9Metokq2C7bAgCJMpPKZr8M53b.oxbbgb6	ADMIN	2026-10-27 14:38:10.837647	2026-10-27 14:38:10.837647
72	tech_e5_1793111890634@fleetcore.com	$2b$10$KiBjzqiSlKDEdyUjMoTPf.fyWj2tv7kvb1tM.af6vXB4Mrb5Fo7pW	TECHNICIAN	2026-10-27 14:38:10.899143	2026-10-27 14:38:10.899143
73	other_tech_e5_1793111890634@fleetcore.com	$2b$10$qIyQ2btRH6gvBkl2OTqYS.kiI24Dhl9UX8DIMSERwQjES7ShC1ODu	TECHNICIAN	2026-10-27 14:38:10.954595	2026-10-27 14:38:10.954595
74	admin_1793111892876@fleetcore.com	$2b$10$mbd3VRrryTOY.STOcYJj.eUfId3bFuWVizRGuqc3HfbeHfNot7LB2	ADMIN	2026-10-27 14:38:13.068668	2026-10-27 14:38:13.068668
75	tech_1793111892876@fleetcore.com	$2b$10$ARvsTMx86xPRABZwlqPkFewrc0DlB8v6vXWDCGxD1HFPKxUkxfEQ6	TECHNICIAN	2026-10-27 14:38:13.132627	2026-10-27 14:38:13.132627
76	login_1793111892876@fleetcore.com	$2b$10$GQTiQMeJymfQsNE2DXKoV.W9bAoZzFPdwA4EP6G4szB3OyCV23O.u	ADMIN	2026-10-27 14:38:13.196097	2026-10-27 14:38:13.196097
77	techlogin_1793111892876@fleetcore.com	$2b$10$x.uR8sS2QLYejhFIMbet8ez27h4y1dG/o1oO61WPupNdDkGA9PBJ2	TECHNICIAN	2026-10-27 14:38:13.248187	2026-10-27 14:38:13.248187
78	admin_e6_1793111893929@fleetcore.com	$2b$10$hmzpSwSnFkNauW9m13njneBFmcewZIqeSZ.Gr9OK5L6yTGhkGo3Cq	ADMIN	2026-10-27 14:38:14.122811	2026-10-27 14:38:14.122811
79	tech_e6_1793111893929@fleetcore.com	$2b$10$BK/DAFAqgmNrTOjJ2gTnPORmNsqWlmokmeiuszYOawb1VIsMy.jtG	TECHNICIAN	2026-10-27 14:38:14.18479	2026-10-27 14:38:14.18479
80	admin_e3_1793111894875@fleetcore.com	$2b$10$FIBV7T/2R8I/7RlyJ.weBe2LZpLlknPKxTCvytBYlRs8/P27KKxGm	ADMIN	2026-10-27 14:38:15.065346	2026-10-27 14:38:15.065346
81	tech_e3_1793111894875@fleetcore.com	$2b$10$SspJCe7SRLbmxZF3sQFM0.JTkDnx4XH3JJK4t8vJ49JV81yyJj8p2	TECHNICIAN	2026-10-27 14:38:15.127516	2026-10-27 14:38:15.127516
82	admin_e2_1793111895799@fleetcore.com	$2b$10$Azl8kidvikzZwhOgr9vYjO4xXDaI2WmDEQFTtIFutA7VIjzjwF3bS	ADMIN	2026-10-27 14:38:15.991498	2026-10-27 14:38:15.991498
83	tech_e2_1793111895799@fleetcore.com	$2b$10$kQCumQ2ecRLTXbME.svR7.R0rYH6AzpkzDzbef7qx3.ByDKFwxrsm	TECHNICIAN	2026-10-27 14:38:16.054486	2026-10-27 14:38:16.054486
84	admin_e4_1793111896717@fleetcore.com	$2b$10$vHtWnKOiuNQzPilFpklHlOM7NOkFNHairFd4FAKmUaXtyfsPI1qNO	ADMIN	2026-10-27 14:38:16.906214	2026-10-27 14:38:16.906214
85	tech_e4_1793111896717@fleetcore.com	$2b$10$wGsDBqThyy/sDapP.8IjKuUme4WLsy8ScBoP0RjscKR2QfcEloJai	TECHNICIAN	2026-10-27 14:38:16.965379	2026-10-27 14:38:16.965379
\.


--
-- Data for Name: vehicles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.vehicles (id, plate, brand, model, year, mileage, status, "createdAt", "updatedAt") FROM stdin;
1	ABC892	Chevrolet	NPR Turbo	2022	48000	INACTIVE	2026-10-27 13:58:01.272485	2026-10-27 13:58:01.307091
2	ABC631	Chevrolet	NPR Turbo	2022	48000	INACTIVE	2026-10-27 13:58:25.99752	2026-10-27 13:58:26.031423
4	KM3800	Kenworth	T800	2022	60000	AVAILABLE	2026-10-27 14:19:24.339095	2026-10-27 14:19:24.339095
5	IN3800	Volvo	FH	2023	20000	AVAILABLE	2026-10-27 14:19:24.34485	2026-10-27 14:19:24.34485
3	MNT800	Chevrolet	FTR	2021	50500	AVAILABLE	2026-10-27 14:19:24.282142	2026-10-27 14:19:24.373691
6	CN3800	Mercedes	Actros	2022	35000	AVAILABLE	2026-10-27 14:19:24.392885	2026-10-27 14:19:24.415378
7	ABC040	Chevrolet	NPR Turbo	2022	48000	INACTIVE	2026-10-27 14:19:27.411393	2026-10-27 14:19:27.444724
8	ABC123	Chevrolet	NPR	2022	45000	AVAILABLE	2026-10-27 14:30:54.618402	2026-10-27 14:30:54.618402
9	DEF456	Hino	Dutro	2021	60000	AVAILABLE	2026-10-27 14:30:54.620374	2026-10-27 14:30:54.620374
10	GHI789	Kenworth	T800	2020	85000	IN_MAINTENANCE	2026-10-27 14:30:54.621475	2026-10-27 14:30:54.621475
11	JKL012	Ford	Cargo	2018	150000	INACTIVE	2026-10-27 14:30:54.622458	2026-10-27 14:30:54.622458
13	KM3653	Kenworth	T800	2022	60000	AVAILABLE	2026-10-27 14:31:54.174874	2026-10-27 14:31:54.174874
14	IN3653	Volvo	FH	2023	20000	AVAILABLE	2026-10-27 14:31:54.180423	2026-10-27 14:31:54.180423
12	MNT653	Chevrolet	FTR	2021	50500	AVAILABLE	2026-10-27 14:31:54.127389	2026-10-27 14:31:54.207047
15	CN3653	Mercedes	Actros	2022	35000	AVAILABLE	2026-10-27 14:31:54.218919	2026-10-27 14:31:54.2367
16	HIS841	Chevrolet	NPR	2022	40100	AVAILABLE	2026-10-27 14:31:56.202554	2026-10-27 14:31:56.248219
17	ABC650	Chevrolet	NPR Turbo	2022	48000	INACTIVE	2026-10-27 14:31:59.016821	2026-10-27 14:31:59.057118
19	KM9630	Kenworth	T800	2022	60000	AVAILABLE	2026-10-27 14:32:40.156566	2026-10-27 14:32:40.156566
20	IN9630	Volvo	FH	2023	20000	AVAILABLE	2026-10-27 14:32:40.161959	2026-10-27 14:32:40.161959
18	MNT630	Chevrolet	FTR	2021	50500	AVAILABLE	2026-10-27 14:32:40.103417	2026-10-27 14:32:40.189105
21	CN9630	Mercedes	Actros	2022	35000	AVAILABLE	2026-10-27 14:32:40.202508	2026-10-27 14:32:40.219879
22	HIS760	Chevrolet	NPR	2022	40100	AVAILABLE	2026-10-27 14:32:41.124521	2026-10-27 14:32:41.164965
23	ABC629	Chevrolet	NPR Turbo	2022	48000	INACTIVE	2026-10-27 14:32:42.995616	2026-10-27 14:32:43.029249
25	KM0634	Kenworth	T800	2022	60000	AVAILABLE	2026-10-27 14:38:11.170171	2026-10-27 14:38:11.170171
26	IN0634	Volvo	FH	2023	20000	AVAILABLE	2026-10-27 14:38:11.175912	2026-10-27 14:38:11.175912
24	MNT634	Chevrolet	FTR	2021	50500	AVAILABLE	2026-10-27 14:38:11.11744	2026-10-27 14:38:11.202577
27	CN0634	Mercedes	Actros	2022	35000	AVAILABLE	2026-10-27 14:38:11.214855	2026-10-27 14:38:11.232672
28	HIS929	Chevrolet	NPR	2022	40100	AVAILABLE	2026-10-27 14:38:14.297161	2026-10-27 14:38:14.34542
29	ABC799	Chevrolet	NPR Turbo	2022	48000	INACTIVE	2026-10-27 14:38:16.168625	2026-10-27 14:38:16.211837
\.


--
-- Data for Name: workshops; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.workshops (id, name, address, status, "createdAt", "updatedAt") FROM stdin;
1	Taller Principal 1793110763800	Calle 10 # 20-30	ACTIVE	2026-10-27 14:19:24.313424	2026-10-27 14:19:24.313424
2	Taller Deshabilitado 1793110763800	Calle 0 # 0-0	INACTIVE	2026-10-27 14:19:24.316669	2026-10-27 14:19:24.316669
3	Taller Central 1793110767950	Calle 50 # 25-20 Nueva Sede	INACTIVE	2026-10-27 14:19:28.317346	2026-10-27 14:19:28.342145
4	Taller Activo 1793110767950	Diagonal 80 # 10-05	ACTIVE	2026-10-27 14:19:28.34635	2026-10-27 14:19:28.34635
5	Taller Central Norte	Av. Industrial 45 # 12-30	ACTIVE	2026-10-27 14:30:54.609923	2026-10-27 14:30:54.609923
6	Taller Sur Histórico	Calle 80 Sur # 10-20	INACTIVE	2026-10-27 14:30:54.611582	2026-10-27 14:30:54.611582
7	Taller Principal 1793111513653	Calle 10 # 20-30	ACTIVE	2026-10-27 14:31:54.150862	2026-10-27 14:31:54.150862
8	Taller Deshabilitado 1793111513653	Calle 0 # 0-0	INACTIVE	2026-10-27 14:31:54.154078	2026-10-27 14:31:54.154078
9	Taller Historial 1793111515841	Carrera 70 # 45-12	ACTIVE	2026-10-27 14:31:56.211006	2026-10-27 14:31:56.211006
10	Taller Central 1793111517712	Calle 50 # 25-20 Nueva Sede	INACTIVE	2026-10-27 14:31:58.081246	2026-10-27 14:31:58.105506
11	Taller Activo 1793111517712	Diagonal 80 # 10-05	ACTIVE	2026-10-27 14:31:58.109601	2026-10-27 14:31:58.109601
12	Taller Principal 1793111559630	Calle 10 # 20-30	ACTIVE	2026-10-27 14:32:40.132325	2026-10-27 14:32:40.132325
13	Taller Deshabilitado 1793111559630	Calle 0 # 0-0	INACTIVE	2026-10-27 14:32:40.135391	2026-10-27 14:32:40.135391
14	Taller Historial 1793111560760	Carrera 70 # 45-12	ACTIVE	2026-10-27 14:32:41.133374	2026-10-27 14:32:41.133374
15	Taller Central 1793111563535	Calle 50 # 25-20 Nueva Sede	INACTIVE	2026-10-27 14:32:43.898491	2026-10-27 14:32:43.918983
16	Taller Activo 1793111563535	Diagonal 80 # 10-05	ACTIVE	2026-10-27 14:32:43.922651	2026-10-27 14:32:43.922651
17	Taller Principal 1793111890634	Calle 10 # 20-30	ACTIVE	2026-10-27 14:38:11.144987	2026-10-27 14:38:11.144987
18	Taller Deshabilitado 1793111890634	Calle 0 # 0-0	INACTIVE	2026-10-27 14:38:11.147943	2026-10-27 14:38:11.147943
19	Taller Historial 1793111893929	Carrera 70 # 45-12	ACTIVE	2026-10-27 14:38:14.305741	2026-10-27 14:38:14.305741
20	Taller Central 1793111896717	Calle 50 # 25-20 Nueva Sede	INACTIVE	2026-10-27 14:38:17.080894	2026-10-27 14:38:17.103943
21	Taller Activo 1793111896717	Diagonal 80 # 10-05	ACTIVE	2026-10-27 14:38:17.108526	2026-10-27 14:38:17.108526
\.


--
-- Name: maintenances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.maintenances_id_seq', 17, true);


--
-- Name: mechanics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.mechanics_id_seq', 20, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 85, true);


--
-- Name: vehicles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.vehicles_id_seq', 29, true);


--
-- Name: workshops_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.workshops_id_seq', 21, true);


--
-- Name: vehicles PK_18d8646b59304dce4af3a9e35b6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "PK_18d8646b59304dce4af3a9e35b6" PRIMARY KEY (id);


--
-- Name: mechanics PK_2c0ed23afc0cc7ff361c17e53df; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "PK_2c0ed23afc0cc7ff361c17e53df" PRIMARY KEY (id);


--
-- Name: maintenances PK_62403473bd524a42d58589aa78b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "PK_62403473bd524a42d58589aa78b" PRIMARY KEY (id);


--
-- Name: workshops PK_6d0e82a124f5b53df91c8989848; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.workshops
    ADD CONSTRAINT "PK_6d0e82a124f5b53df91c8989848" PRIMARY KEY (id);


--
-- Name: users PK_a3ffb1c0c8416b9fc6f907b7433; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY (id);


--
-- Name: mechanics UQ_301c3b5fa2d49aab65dcfda36a6; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "UQ_301c3b5fa2d49aab65dcfda36a6" UNIQUE (email);


--
-- Name: users UQ_97672ac88f789774dd47f7c8be3; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE (email);


--
-- Name: vehicles UQ_ec7181ebdab798d97070122a5bf; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.vehicles
    ADD CONSTRAINT "UQ_ec7181ebdab798d97070122a5bf" UNIQUE (plate);


--
-- Name: maintenances FK_3a9ba7c05e1ffba00560d11f364; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_3a9ba7c05e1ffba00560d11f364" FOREIGN KEY ("mechanicId") REFERENCES public.mechanics(id);


--
-- Name: maintenances FK_75331cd2a0f0c22bcb2fc4f6d6a; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_75331cd2a0f0c22bcb2fc4f6d6a" FOREIGN KEY ("workshopId") REFERENCES public.workshops(id);


--
-- Name: mechanics FK_85c0da75e5dedc5eca00055cfbe; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.mechanics
    ADD CONSTRAINT "FK_85c0da75e5dedc5eca00055cfbe" FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: maintenances FK_daa193fdfccde41a2ed4de8a474; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT "FK_daa193fdfccde41a2ed4de8a474" FOREIGN KEY ("vehicleId") REFERENCES public.vehicles(id);


--
-- PostgreSQL database dump complete
--

\unrestrict lcrAJjsBEg8dyUI0VQtsLIT6MkZgbCJf0X8FRplb0fOfTdfxZhOLaVv30npF40H

