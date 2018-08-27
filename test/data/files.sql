--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5
-- Dumped by pg_dump version 10.5

-- Started on 2018-08-27 20:46:06 UTC

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2869 (class 0 OID 16402)
-- Dependencies: 196
-- Data for Name: tracks; Type: TABLE DATA; Schema: public; Owner: music
--

INSERT INTO tracks VALUES ('aaf210adccb060ae68b976c5e47d6df3', 'wav', '/home/ski/javascript/music-server-express/test/test-files/dir1/a.wav', 'audio/x-wav', NULL);
INSERT INTO tracks VALUES ('41c75d4ed47460b7340b30f42d211bd7', 'wav', '/home/ski/javascript/music-server-express/test/test-files/1.wav', 'audio/x-wav', NULL);
INSERT INTO tracks VALUES ('84bcea1f9e374c2a42b0fe02b135b310', 'wav', '/home/ski/javascript/music-server-express/test/test-files/dir1/dir2/b.wav', 'audio/x-wav', NULL);
INSERT INTO tracks VALUES ('9c95710ba3c338f41bfdac0ac35d2f2f', 'wav', '/home/ski/javascript/music-server-express/test/test-files/dir4/d.wav', 'audio/x-wav', NULL);
INSERT INTO tracks VALUES ('0b78c6f548f82b63b096362511c9dba3', 'wav', '/home/ski/javascript/music-server-express/test/test-files/dir1/dir2/dir3/c.wav', 'audio/x-wav', NULL);
INSERT INTO tracks VALUES ('c46960ed99d8fc191a31a8d4a643461e', 'wav', '/home/ski/javascript/music-server-express/test/test-files/dir4/dir5/e.wav', 'audio/x-wav', NULL);
INSERT INTO tracks VALUES ('dd27f0bb76a0b8bab254eb50f35776ec', 'wav', '/home/ski/javascript/music-server-express/test/test-files/dir6/f.wav', 'audio/x-wav', NULL);
INSERT INTO tracks VALUES ('ca6ae0e09a958896a3dd84416fb1fc18', 'flac', '/home/ski/javascript/music-server-express/test/test-files/1.flac', 'audio/x-flac', '{"title":"1 Second Silence - FLAC Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol 1","year":"2015","track":{"no":1,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":1}');
INSERT INTO tracks VALUES ('8ad97707b04919a2f0bc2aa4e75f3158', 'flac', '/home/ski/javascript/music-server-express/test/test-files/dir1/a.flac', 'audio/x-flac', '{"title":"1 Second Silence - FLAC Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol A","year":"2015","track":{"no":1,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":1}');
INSERT INTO tracks VALUES ('bbc3a3705d0f55845d388a0622bdc632', 'mp3', '/home/ski/javascript/music-server-express/test/test-files/dir1/a.mp3', 'audio/mpeg', '{"title":"1 Second Silence - MP3 Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol A","year":"2015","track":{"no":2,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('4e750ef46da929bc2052052b837eef66', 'ogg', '/home/ski/javascript/music-server-express/test/test-files/1.ogg', 'audio/ogg', '{"title":"1 Second Silence","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol 1","year":"2015","track":{"no":3,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('f7c330451e579723241ff634df8b98d7', 'mp3', '/home/ski/javascript/music-server-express/test/test-files/1.mp3', 'audio/mpeg', '{"title":"1 Second Silence - MP3 Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol 1","year":"2015","track":{"no":2,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('6a5e93130043e376ca23e504b6b2a517', 'flac', '/home/ski/javascript/music-server-express/test/test-files/dir1/dir2/b.flac', 'audio/x-flac', '{"title":"1 Second Silence - FLAC Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol B","year":"2015","track":{"no":1,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":1}');
INSERT INTO tracks VALUES ('8db53af65f32a71560e0c14b8e8ed191', 'ogg', '/home/ski/javascript/music-server-express/test/test-files/dir1/a.ogg', 'audio/ogg', '{"title":"1 Second Silence - OGG Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol A","year":"2015","track":{"no":3,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('d37c1e59eb37a54a1ca5fe87fc8d7cf8', 'mp3', '/home/ski/javascript/music-server-express/test/test-files/dir1/dir2/b.mp3', 'audio/mpeg', '{"title":"1 Second Silence - MP3 Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol A","year":"2015","track":{"no":2,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('134ceb5f55455e533cc58db1a48b0f0c', 'ogg', '/home/ski/javascript/music-server-express/test/test-files/dir1/dir2/b.ogg', 'audio/ogg', '{"title":"1 Second Silence - OGG Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol B","year":"2015","track":{"no":3,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('a8534ee7684b60a28b29cfc16023e192', 'mp3', '/home/ski/javascript/music-server-express/test/test-files/dir1/dir2/dir3/c.mp3', 'audio/mpeg', '{"title":"1 Second Silence - MP3 Remix","artist":["Ski"],"albumartist":[],"album":"Greatest Hits Vol C","year":"2015","track":{"no":2,"of":0},"genre":["Jungle"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('c8f04cb55ce35a43ef1a139393bbf2e7', 'ogg', '/home/ski/javascript/music-server-express/test/test-files/dir1/dir2/dir3/c.ogg', 'audio/ogg', '{"title":"1 Second Silence - OGG Remix","artist":["Ski"],"albumartist":[],"album":"Greatest Hits Vol C","year":"2015","track":{"no":3,"of":0},"genre":["Jungle"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('e3f049501f56083e5d0a2c9112b4eca1', 'flac', '/home/ski/javascript/music-server-express/test/test-files/dir4/d.flac', 'audio/x-flac', '{"title":"1 Second Silence - FLAC Remix","artist":["Ski-la"],"albumartist":[],"album":"Greatest Hits Vol D","year":"2015","track":{"no":1,"of":0},"genre":["Leftfield"],"disk":{"no":0,"of":0},"picture":[],"duration":1}');
INSERT INTO tracks VALUES ('0c9d977c0a25984fa6bce62c1f0eef96', 'mp3', '/home/ski/javascript/music-server-express/test/test-files/dir4/d.mp3', 'audio/mpeg', '{"title":"1 Second Silence - MP3 Remix","artist":["Ski-la"],"albumartist":[],"album":"Greatest Hits Vol D","year":"2015","track":{"no":2,"of":0},"genre":[],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('305b0b2f6b743674389144374ad31493', 'mp3', '/home/ski/javascript/music-server-express/test/test-files/dir4/dir5/e.mp3', 'audio/mpeg', '{"title":"1 Second Silence - MP3 Remix","artist":["D"],"albumartist":[],"album":"Greatest Hits Vol E","year":"2015","track":{"no":2,"of":0},"genre":["Techno"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('7aff71bf2180193355451c0b4e9bad46', 'flac', '/home/ski/javascript/music-server-express/test/test-files/dir1/dir2/dir3/c.flac', 'audio/x-flac', '{"title":"1 Second Silence - FLAC Remix","artist":["Ski"],"albumartist":[],"album":"Greatest Hits Vol C","year":"2015","track":{"no":1,"of":0},"genre":["Jungle"],"disk":{"no":0,"of":0},"picture":[],"duration":1}');
INSERT INTO tracks VALUES ('0e4f4c40c6ff68e8c4fa9a5cf702e096', 'ogg', '/home/ski/javascript/music-server-express/test/test-files/dir4/d.ogg', 'audio/ogg', '{"title":"1 Second Silence - OGG Remix","artist":["Ski-la"],"albumartist":[],"album":"Greatest Hits Vol D","year":"2015","track":{"no":3,"of":0},"genre":["Leftfield"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('5540bf6920590e3f96cb1b7993fe284b', 'flac', '/home/ski/javascript/music-server-express/test/test-files/dir4/dir5/e.flac', 'audio/x-flac', '{"title":"1 Second Silence - FLAC Remix","artist":["D"],"albumartist":[],"album":"Greatest Hits Vol E","year":"2015","track":{"no":1,"of":0},"genre":["Techno"],"disk":{"no":0,"of":0},"picture":[],"duration":1}');
INSERT INTO tracks VALUES ('de87c3150bf83ca4e6f5ff932b3151a4', 'ogg', '/home/ski/javascript/music-server-express/test/test-files/dir4/dir5/e.ogg', 'audio/ogg', '{"title":"1 Second Silence - OGG Remix","artist":["D"],"albumartist":[],"album":"Greatest Hits Vol E","year":"2015","track":{"no":3,"of":0},"genre":["Techno"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('56217560446a55e64f1095fe58ad2556', 'flac', '/home/ski/javascript/music-server-express/test/test-files/dir6/f.flac', 'audio/x-flac', '{"title":"1 Second Silence - FLAC Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol F","year":"2015","track":{"no":1,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":1}');
INSERT INTO tracks VALUES ('1d41baa2cf60f312e5fef08c6687f52d', 'ogg', '/home/ski/javascript/music-server-express/test/test-files/dir6/f.ogg', 'audio/ogg', '{"title":"1 Second Silence - OGG Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol F","year":"2015","track":{"no":3,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');
INSERT INTO tracks VALUES ('c942e8a6cb4d2d57b06137b24133ea78', 'mp3', '/home/ski/javascript/music-server-express/test/test-files/dir6/f.mp3', 'audio/mpeg', '{"title":"1 Second Silence - MP3 Remix","artist":["Glen Pike"],"albumartist":[],"album":"Greatest Hits Vol F","year":"2015","track":{"no":2,"of":0},"genre":["New Age"],"disk":{"no":0,"of":0},"picture":[],"duration":0}');


-- Completed on 2018-08-27 20:46:06 UTC

--
-- PostgreSQL database dump complete
--

