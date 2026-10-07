/* CIPHERGRID — labs, challenges, achievements, shop, leaderboard (all fictional demo data).
 * Every lab is a sandboxed text simulation. No command ever contacts a real system. */
(function () {
  /* ---------- helpers used to build challenge artifacts at runtime ---------- */
  const b64 = (s) => btoa(s);
  const b64u = (s) => btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const hex = (s) => Array.from(s).map((c) => c.charCodeAt(0).toString(16).padStart(2, '0')).join('');
  const rot = (s, n) => s.replace(/[a-z]/gi, (c) => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + n + 26) % 26) + base);
  });
  const xor = (s, k) => Array.from(s).map((c, i) => (c.charCodeAt(0) ^ (Array.isArray(k) ? k[i % k.length] : k)).toString(16).padStart(2, '0')).join(' ');

  /* ---------- LABS ---------- */
  // host/port/svc/path/vuln/flag drive the generic simulation engine in lab.js
  const lab = (id, name, diff, cat, time, xp, cubes, players, cost, story, host, port, svc, path, vuln, flag, added) =>
    ({ id, name, diff, cat, time, xp, cubes, players, cost, story, host, port, svc, path, vuln, flag, added });
  const labs = [
    lab('neon-vault', 'Neon Vault', 'Easy', 'Web', 25, 250, 100, 4210, 0, 'A boutique crypto-exchange left a legacy admin console reachable. Find it, prove the access-control weakness and recover the vault token.', 'vault.neon.lab', 8080, 'http-alt (Neon Admin 2.1)', '/admin-legacy', 'idor', 'CG{vault_door_was_ajar}', 8),
    lab('packet-forge', 'Packet Forge', 'Easy', 'Network', 30, 250, 100, 3874, 0, 'A factory network is leaking sensor telemetry. Map the exposed service and capture the maintenance token from an unencrypted feed.', 'forge.plant.lab', 1883, 'mqtt (broker 1.8)', '/telemetry/maint', 'anon-sub', 'CG{telemetry_talks_too_much}', 14),
    lab('lantern-drift', 'Lantern Drift', 'Easy', 'Linux', 30, 300, 120, 3320, 0, 'A small hosting box drifts out of its baseline. Enumerate it, spot the careless permission and read the root note.', 'drift.lantern.lab', 22, 'ssh (OpenSSH 8.2)', '/opt/backup/run.sh', 'writable-script', 'CG{drift_is_a_misconfig}', 20),
    lab('static-harbor', 'Static Harbor', 'Easy', 'Web', 35, 300, 120, 2985, 0, 'A shipping tracker builds queries from user input. Confirm the weakness in the simulated database and extract the manifest key.', 'harbor.static.lab', 8081, 'http (TrackIt 0.9)', '/track?id=', 'sqli', 'CG{manifest_key_unsealed}', 26),
    lab('dust-protocol', 'Dust Protocol', 'Easy', 'OSINT', 25, 220, 90, 2610, 0, 'A shell company hides behind a quiet web footprint. Piece together public traces to identify who runs it.', 'dust.protocol.lab', 80, 'http (Static site)', '/about/team', 'public-trace', 'CG{dust_leaves_footprints}', 31),
    lab('silent-proxy', 'Silent Proxy', 'Medium', 'Web', 40, 450, 180, 1890, 0, 'An internal fetch service forwards requests on behalf of users. Show how it can be tricked into reaching an internal-only metadata page.', 'proxy.silent.lab', 3128, 'http-proxy (FetchRelay)', '/fetch?url=', 'ssrf', 'CG{the_proxy_never_asked_why}', 38),
    lab('black-circuit', 'Black Circuit', 'Medium', 'Network', 45, 480, 200, 1544, 0, 'Segmented ICS lab: discover which jump host bridges the zones and extract the engineering workstation key.', 'circuit.black.lab', 502, 'modbus-sim (Gate 3)', '/zones/eng', 'weak-segmentation', 'CG{segments_leak_when_trusted}', 44),
    lab('ghost-relay', 'Ghost Relay', 'Medium', 'Network', 45, 500, 200, 1302, 400, 'A relay chain hides the real command host. Follow the hops through the simulated logs and unmask the final node.', 'relay.ghost.lab', 9050, 'relay (HopMesh 2)', '/hops/last', 'log-pivot', 'CG{last_hop_has_a_name}', 49),
    lab('echo-chamber', 'Echo Chamber', 'Medium', 'Web', 40, 450, 180, 1650, 0, 'A community forum reflects user comments back unsafely. Prove script injection in the simulated browser and read the moderator note.', 'echo.chamber.lab', 8082, 'http (ForumLite)', '/comments', 'xss', 'CG{echo_returns_what_you_send}', 55),
    lab('iron-ledger', 'Iron Ledger', 'Medium', 'Web', 45, 500, 200, 1420, 0, 'A fintech API trusts object identifiers from the client. Demonstrate broken object-level authorization on the ledger endpoint.', 'ledger.iron.lab', 8443, 'https-api (LedgerCore)', '/api/ledger/', 'bola', 'CG{ownership_is_not_optional}', 60),
    lab('hollow-signal', 'Hollow Signal', 'Medium', 'Crypto', 40, 480, 190, 1180, 0, 'A beacon broadcasts weakly protected messages. Recover the key reuse pattern and decrypt the signal.', 'signal.hollow.lab', 5000, 'udp-beacon (Echo 3)', '/beacon/dump', 'nonce-reuse', 'CG{nonces_are_single_use}', 66),
    lab('zero-trace', 'Zero Trace', 'Hard', 'Forensics', 55, 800, 320, 840, 500, 'An intruder wiped obvious evidence. Reconstruct their path from residual logs and name the account they abused.', 'trace.zero.lab', 514, 'syslog-sim (Collector)', '/var/archive/auth.1', 'log-carving', 'CG{nothing_is_ever_fully_gone}', 72),
    lab('obsidian-node', 'Obsidian Node', 'Hard', 'Linux', 60, 850, 340, 790, 0, 'A hardened-looking server hides a single flawed SUID helper. Enumerate carefully and climb to root in the simulation.', 'node.obsidian.lab', 22, 'ssh (OpenSSH 9.0)', '/usr/local/bin/backup_tool', 'suid-misuse', 'CG{rooted_by_a_helper}', 78),
    lab('pale-meridian', 'Pale Meridian', 'Hard', 'Cloud', 60, 900, 360, 610, 600, 'A cloud tenant stores reports in a bucket with overbroad policy. Chain the policy mistake into data access in the simulator.', 'meridian.pale.lab', 443, 'object-store (Cirrus)', '/buckets/reports-prod', 'overbroad-policy', 'CG{least_privilege_or_least_sleep}', 84),
    lab('red-sector', 'Red Sector', 'Hard', 'Active Directory', 70, 1000, 400, 520, 500, 'A simulated enterprise domain with a forgotten service account. Enumerate, find the weak delegation and reach the tier-0 vault.', 'sector.red.lab', 389, 'ldap-sim (DC01)', '/ou/service-accounts', 'weak-delegation', 'CG{tier_zero_was_one_hop_away}', 90),
    lab('kernel-orchard', 'Kernel Orchard', 'Insane', 'Reverse', 90, 1400, 600, 240, 600, 'A sealed binary guards a license check. Trace the control flow in the simulator and recover the activation phrase.', 'orchard.kernel.lab', 7777, 'tcp-service (Grove)', '/bin/grove.elf', 'patch-logic', 'CG{ripe_bugs_fall_first}', 96),
  ];

  /* ---------- CHALLENGES ---------- */
  const ch = (id, title, cat, diff, desc, artifact, flag, hints, solves) => {
    const pts = { Easy: 100, Medium: 220, Hard: 400, Insane: 600 }[diff];
    return { id, title, cat, diff, desc, artifact, flag, hints, pts, cubes: Math.round(pts / 2), solves };
  };
  const ct = (s) => s; // readability marker
  const numsP1 = [14, 27, 33, 8, 19, 41, 6];
  const sumP1 = numsP1.reduce((a, b) => a + b, 0);
  const sk = 'sess=' + b64('user=guest;role=viewer;note=CG{cookie_crumbs_lead_home}');
  const jwtPayload = b64u(JSON.stringify({ sub: 'guest', exp: 1893456000, kid_note: 'CG{none_alg_is_a_trap}' }));
  const jwt = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + jwtPayload + '.c2lnbmF0dXJlLWRlbW8';
  const dnsFlag = 'CG{txt_records_tell_tales}';
  const dnsB = b64(dnsFlag);
  const dnsParts = [dnsB.slice(0, 9), dnsB.slice(9, 18), dnsB.slice(18)];
  const pasteB = b64('CG{p4st3_br3adcrumb}');
  const pasteParts = [pasteB.slice(0, 8), pasteB.slice(8, 16), pasteB.slice(16)];
  const rorArr = Array.from('CG{rotor_spins}').map((c) => c.charCodeAt(0) + 3).join(', ');

  const challenges = [
    // WEB
    ch('W1', 'Cookie Jar', 'Web', 'Easy', 'A guest session cookie looks suspiciously long. Inspect what the server stored inside it.', 'HTTP/1.1 200 OK\nSet-Cookie: ' + sk + '; Path=/; HttpOnly\nContent-Type: text/html', 'CG{cookie_crumbs_lead_home}', ['Long cookie values often use an encoding.', 'Decode the value after "sess=" from Base64.'], 1820),
    ch('W2', 'View Source', 'Web', 'Easy', 'The login page works, but a developer left a note in the markup before shipping.', '<form action="/login" method="post">...</form>\n<!-- TODO remove before launch: ' + b64('CG{comment_leak}') + ' -->', 'CG{comment_leak}', ['Comments are visible to anyone viewing the page source.', 'The comment content is Base64.'], 1644),
    ch('W3', 'Header Hunter', 'Web', 'Medium', 'A debug header slipped into production responses. Read it carefully.', 'HTTP/1.1 200 OK\nServer: nginx\nX-Request-Id: 7f3a91\nX-Debug-Token: ' + hex('CG{headers_whisper_secrets}') + '\nCache-Control: no-store', 'CG{headers_whisper_secrets}', ['The token is not random: it is plain hexadecimal text.', 'Convert each pair of hex digits to an ASCII character.'], 902),
    ch('W4', 'Token Tamper', 'Web', 'Medium', 'A session token is signed, but the payload is only encoded. What does it carry?', jwt, 'CG{none_alg_is_a_trap}', ['A JWT has three dot-separated parts.', 'Base64URL-decode the middle part and read its fields.'], 788),
    // CRYPTO
    ch('C1', 'Shift Happens', 'Crypto', 'Easy', 'An old-school cipher shifts every letter by the same amount. Recover the message.', rot('CG{shift_happens}', 7), 'CG{shift_happens}', ['Only letters change; braces and underscores stay.', 'Try shifting letters back by 7.'], 2010),
    ch('C2', 'Hex Dump', 'Crypto', 'Easy', 'A terminal printed raw bytes instead of text. Translate them.', hex('CG{hex_is_just_base16}'), 'CG{hex_is_just_base16}', ['Each pair of hex digits is one byte.', 'Look up ASCII for 43 47 7b.'], 1750),
    ch('C3', 'Double Wrap', 'Crypto', 'Medium', 'Two simple layers were applied in order: first a letter rotation, then Base64.', b64(rot('CG{two_layers_still_weak}', 13)), 'CG{two_layers_still_weak}', ['Peel the outer layer first.', 'ROT13 is its own inverse.'], 860),
    ch('C4', 'XOR Garden', 'Crypto', 'Medium', 'Every byte was XORed with one secret byte (printed below in hex). Single-byte keys are small.', xor('CG{xor_with_one_byte}', 0x2a), 'CG{xor_with_one_byte}', ['Flags start with "CG{". XOR the first byte with "C".', 'The key is 0x2A.'], 701),
    // FORENSICS
    ch('F1', 'Strings Attached', 'Forensics', 'Easy', 'A suspicious binary was carved from memory. Run strings on it mentally.', '00000040  7f 45 4c 46 02 01 01 00  .ELF....\n00000a10  2f 6c 69 62 2f 6c 64 2d  /lib/ld-\n00000b20  41 55 54 48 3a 43 47 7b  AUTH:CG{\n00000b28  73 74 72 69 6e 67 73 5f  strings_\n00000b30  73 68 6f 77 5f 61 6c 6c  show_all\n00000b38  7d 00 00 00              }...', 'CG{strings_show_all}', ['Read the ASCII column on the right.', 'The flag spans three lines.'], 1488),
    ch('F2', 'Log Trail', 'Forensics', 'Medium', 'One source address guessed its way into a service account. Build the flag as CG{ip_account}.', '08:14:02 sshd: Failed password for root from 198.51.100.4\n08:14:09 sshd: Failed password for svc_backup from 203.0.113.77\n08:14:11 sshd: Failed password for svc_backup from 203.0.113.77\n08:14:15 sshd: Failed password for svc_backup from 203.0.113.77\n08:14:22 sshd: Accepted password for svc_backup from 203.0.113.77\n08:19:40 sshd: Accepted publickey for ana from 192.0.2.10', 'CG{203.0.113.77_svc_backup}', ['Find the first "Accepted password".', 'Combine the address and account with an underscore.'], 820),
    ch('F3', 'Metadata Leak', 'Forensics', 'Medium', 'A published image carries more than pixels. Review the extracted metadata.', 'File Name      : site-banner.jpg\nCamera Model   : SimCam X1\nArtist         : design-team\nComment        : ' + b64('CG{exif_never_forgets}') + '\nSoftware       : PhotoSim 4.2', 'CG{exif_never_forgets}', ['Look at unusual metadata fields.', 'The Comment field is Base64.'], 733),
    ch('F4', 'Deleted Note', 'Forensics', 'Hard', 'A file was deleted but its bytes remain in slack space. The text was written backwards.', hex(Array.from('CG{carved_from_slack}').reverse().join('')), 'CG{carved_from_slack}', ['Decode the hex to text first.', 'The result reads backwards.'], 402),
    // OSINT
    ch('O1', 'Handle Trace', 'OSINT', 'Easy', 'Three fictional posts mention the same place. Flag format: CG{place_in_lowercase_with_underscores}.', 'post_1: "Coffee before the ferry, Pier 9 never disappoints"\npost_2: "Sunset from the roof of the Marlow Annex, Harbor City"\npost_3: "Pier 9 market opens at six, see you there"', 'CG{pier_9_harbor_city}', ['Which location appears twice?', 'Add the city from the second post.'], 1190),
    ch('O2', 'Domain Whisper', 'OSINT', 'Medium', 'Registration records (fictional) reveal an organization. Flag format: CG{org_year}, lowercase.', 'Domain       : quillfeather.example\nRegistrant   : Quillfeather Labs\nCreated      : 2019-03-14\nName Server  : ns1.quillfeather.example\nRegistrar    : ExampleReg', 'CG{quillfeather_2019}', ['Organization name first, then the creation year.', 'Use lowercase only.'], 770),
    ch('O3', 'Photo Clues', 'OSINT', 'Medium', 'A photo description (fictional) hints at a transit line. Flag format: CG{tram_line_NN}.', 'Photo notes: yellow tram, route sign "12" visible,\nbehind it a clock tower reading 4:10 and a bakery named Linden & Rye.', 'CG{tram_line_12}', ['Look at the sign on the vehicle.', 'Format uses the number only.'], 698),
    ch('O4', 'Paste Trail', 'OSINT', 'Hard', 'A secret was split across three public pastes. Join them in order and decode.', 'paste_a: ' + pasteParts[0] + '\npaste_b: ' + pasteParts[1] + '\npaste_c: ' + pasteParts[2], 'CG{p4st3_br3adcrumb}', ['Concatenate a, b, c without spaces.', 'Then Base64-decode.'], 355),
    // REVERSE
    ch('R1', 'String Compare', 'Reverse', 'Easy', 'This pseudo-code guards a door. What input opens it?', 'int check(char *in) {\n  if (strcmp(in, "CG{strcmp_is_not_secret}") == 0)\n    return GRANTED;\n  return DENIED;\n}', 'CG{strcmp_is_not_secret}', ['The comparison literal is the answer.', 'Copy it exactly.'], 1302),
    ch('R2', 'Rotor', 'Reverse', 'Medium', 'The program adds 3 to each character before comparing against this array. Recover the input.', 'expected = [' + rorArr + ']\nfor i in range(len(in)):\n    if in[i] + 3 != expected[i]: DENIED', 'CG{rotor_spins}', ['Subtract 3 from each number.', 'Convert to ASCII characters.'], 640),
    ch('R3', 'Hidden Branch', 'Reverse', 'Medium', 'Branch constants encode the answer as ASCII. Read them in order.', 'cmp byte [in+0], 0x43 ; jne fail\ncmp byte [in+1], 0x47 ; jne fail\ncmp byte [in+2], 0x7b ; jne fail\ncmp byte [in+3], 0x62 ; jne fail\ncmp byte [in+4], 0x72 ; jne fail\ncmp byte [in+5], 0x61 ; jne fail\ncmp byte [in+6], 0x6e ; jne fail\ncmp byte [in+7], 0x63 ; jne fail\ncmp byte [in+8], 0x68 ; jne fail\ncmp byte [in+9], 0x7d ; jne fail', 'CG{branch}', ['0x43 is "C". Convert each constant.', 'Ten characters in total.'], 588),
    ch('R4', 'Xor Gate', 'Reverse', 'Hard', 'Bytes are XORed with a repeating two-byte key [0x13, 0x37]. Reverse it.', 'key = [0x13, 0x37]\ndata = ' + xor('CG{gate_opens_twice}', [0x13, 0x37]), 'CG{gate_opens_twice}', ['Alternate the key bytes across positions.', 'XOR is its own inverse.'], 301),
    // NETWORKING
    ch('N1', 'Port Reader', 'Networking', 'Easy', 'Which port serves the admin panel? Flag format: CG{port_NNNN}.', 'PORT      STATE  SERVICE\n22/tcp    open   ssh\n80/tcp    open   http\n443/tcp   open   https\n8443/tcp  open   https-alt  (Admin Panel 3.2)', 'CG{port_8443}', ['Look for the line that names a panel.', 'Use only the number.'], 1540),
    ch('N2', 'Packet Peek', 'Networking', 'Medium', 'A capture summary shows credentials sent in a way anyone could read. Decode them.', '1  10.0.4.21 -> 10.0.4.50  TCP SYN\n2  10.0.4.50 -> 10.0.4.21  TCP SYN,ACK\n3  10.0.4.21 -> 10.0.4.50  HTTP POST /login\n    Authorization: Basic ' + b64('ops:CG{cleartext_is_loud}') + '\n4  10.0.4.50 -> 10.0.4.21  HTTP 200 OK', 'CG{cleartext_is_loud}', ['Basic auth is Base64 of user:password.', 'The password is the flag.'], 810),
    ch('N3', 'Subnet Math', 'Networking', 'Medium', 'What is the broadcast address of 10.20.30.77/27? Flag format: CG{a.b.c.d}.', 'Host: 10.20.30.77\nMask: /27 (255.255.255.224)', 'CG{10.20.30.95}', ['A /27 gives blocks of 32 addresses.', 'The block containing .77 runs from .64 to .95.'], 645),
    ch('N4', 'DNS Whisper', 'Networking', 'Hard', 'Three TXT chunks hide a message. Join them in order and decode.', 'chunk1.txt.example TXT "' + dnsParts[0] + '"\nchunk2.txt.example TXT "' + dnsParts[1] + '"\nchunk3.txt.example TXT "' + dnsParts[2] + '"', dnsFlag, ['Concatenate chunk1, chunk2, chunk3.', 'The joined string is Base64.'], 340),
    // LINUX
    ch('L1', 'Perm Check', 'Linux', 'Easy', 'One file is dangerously writable by everyone. Flag format: CG{filename}.', '-rw-r--r-- 1 root root  220 .profile\n-rwxr-xr-x 1 root root 1184 backup.sh\n-rwxrwxrwx 1 root root  402 deploy.sh\n-rw------- 1 root root  911 id_rsa', 'CG{deploy.sh}', ['World-writable means the last three bits are rwx.', 'Find -rwxrwxrwx.'], 1410),
    ch('L2', 'Cron Whisper', 'Linux', 'Medium', 'Which scheduled job runs a script from a world-writable directory? Flag format: CG{path}.', '0 2 * * * root /usr/local/bin/rotate-logs\n*/5 * * * * root /tmp/cleanup.sh\n30 3 * * 0 ana /home/ana/weekly.sh', 'CG{/tmp/cleanup.sh}', ['/tmp is writable by every user.', 'Look at the job run as root.'], 744),
    ch('L3', 'SUID Hunt', 'Linux', 'Medium', 'Which SUID binary is not part of a normal system? Flag format: CG{path}.', '/usr/bin/passwd\n/usr/bin/sudo\n/usr/bin/mount\n/usr/local/bin/backup_tool\n/usr/bin/chfn', 'CG{/usr/local/bin/backup_tool}', ['Standard tools live in /usr/bin.', 'Look under /usr/local.'], 721),
    ch('L4', 'History Lesson', 'Linux', 'Hard', 'An admin typed a password directly into a command. What was it? Flag format: CG{password}.', '  42  cd /var/backups\n  43  tar czf db.tgz /srv/db\n  44  mysql -u root -pSup3rS3cret! -e "show databases"\n  45  history | tail -5', 'CG{Sup3rS3cret!}', ['Look at the mysql command.', 'The password follows -p with no space.'], 389),
    // PROGRAMMING
    ch('P1', 'Sum Seeker', 'Programming', 'Easy', 'Add the numbers and wrap the total as CG{total}.', 'numbers = [' + numsP1.join(', ') + ']', 'CG{' + sumP1 + '}', ['Write a loop or use sum().', 'Seven numbers.'], 1960),
    ch('P2', 'FizzFlag', 'Programming', 'Easy', 'How many integers from 1 to 100 are divisible by 3 or 5? Flag: CG{count}.', 'range: 1..100 inclusive', 'CG{47}', ['Count multiples of 3, add multiples of 5.', 'Subtract those counted twice (multiples of 15).'], 1722),
    ch('P3', 'Palindrome Gate', 'Programming', 'Medium', 'How many three-digit numbers (100 to 999) are palindromes? Flag: CG{count}.', 'example: 121, 343, 909', 'CG{90}', ['First and last digit must match.', 'Choose a first digit (9 ways) and a middle digit (10 ways).'], 650),
    ch('P4', 'Collatz Walk', 'Programming', 'Hard', 'Starting at 27, apply: even -> n/2, odd -> 3n+1 until n is 1. How many steps? Flag: CG{steps}.', 'start = 27', 'CG{111}', ['Write a short loop and count iterations.', 'Stop when n equals 1.'], 330),
  ];

  /* ---------- ACHIEVEMENTS ---------- */
  // test(s) receives the store state + derived helpers; see store.js checkAchievements()
  const A = (id, name, desc, icon, tier, reward, test) => ({ id, name, desc, icon, tier, reward, test });
  const achievements = [
    A('first_blood', 'First Blood', 'Solve your first challenge.', 'flag', 'bronze', 50, (c) => c.chals >= 1),
    A('first_steps', 'First Steps', 'Complete your first lesson.', 'book', 'bronze', 25, (c) => c.lessons >= 1),
    A('bookworm', 'Bookworm', 'Complete 10 lessons.', 'book', 'silver', 100, (c) => c.lessons >= 10),
    A('packet_runner', 'Packet Runner', 'Complete the Computer Networking course.', 'network', 'silver', 150, (c) => c.courseDone.includes('net')),
    A('course_clear', 'Course Clear', 'Finish any course.', 'check', 'silver', 100, (c) => c.courseDone.length >= 1),
    A('scholar', 'Scholar', 'Finish 3 courses.', 'star', 'gold', 300, (c) => c.courseDone.length >= 3),
    A('lab_rat', 'Lab Rat', 'Complete your first lab.', 'flask', 'bronze', 50, (c) => c.labs >= 1),
    A('operator', 'Field Operator', 'Complete 5 labs.', 'terminal', 'silver', 200, (c) => c.labs >= 5),
    A('web_walker', 'Web Walker', 'Complete 5 web security labs.', 'globe', 'gold', 300, (c) => c.webLabs >= 5),
    A('night_operator', 'Night Operator', 'Complete a lab between 00:00 and 05:00.', 'moon', 'silver', 150, (c) => c.flags.night),
    A('ghost', 'Ghost', 'Complete a hard lab without using any hints.', 'ghost', 'gold', 400, (c) => c.flags.ghost),
    A('zero_day', 'Zero Day', 'Solve a Hard challenge.', 'bolt', 'gold', 300, (c) => c.flags.hardChal),
    A('solver_10', 'Decoder', 'Solve 10 challenges.', 'key', 'silver', 200, (c) => c.chals >= 10),
    A('all_rounder', 'All-Rounder', 'Solve challenges in 5 different categories.', 'target', 'gold', 350, (c) => c.chalCats >= 5),
    A('cube_hunter', 'Cube Hunter', 'Earn 5,000 Cubes in total.', 'cube', 'silver', 250, (c) => c.totalEarned >= 5000),
    A('streak_3', 'Warming Up', 'Reach a 3 day streak.', 'flame', 'bronze', 50, (c) => c.bestStreak >= 3),
    A('streak_7', 'Week of Fire', 'Reach a 7 day streak.', 'flame', 'silver', 150, (c) => c.bestStreak >= 7),
    A('streak_30', 'Unbroken', 'Reach a 30 day streak.', 'flame', 'gold', 1000, (c) => c.bestStreak >= 30),
    A('level_5', 'Rising Signal', 'Reach Level 5.', 'bolt', 'silver', 150, (c) => c.level >= 5),
    A('level_10', 'Deep Signal', 'Reach Level 10.', 'bolt', 'gold', 500, (c) => c.level >= 10),
    A('shopper', 'Fresh Look', 'Buy your first Shop item.', 'bag', 'bronze', 50, (c) => c.owned >= 1),
    A('collector', 'Collector', 'Own 5 Shop items.', 'bag', 'silver', 200, (c) => c.owned >= 5),
    A('quiz_ace', 'Quiz Ace', 'Answer 5 knowledge checks correctly on the first try.', 'lightbulb', 'silver', 120, (c) => c.quizFirst >= 5),
    A('daily_driver', 'Daily Driver', 'Complete 3 daily missions.', 'target', 'silver', 150, (c) => c.dailyDone >= 3),
  ];

  /* ---------- SHOP ---------- */
  const S = (id, type, name, price, desc, val) => ({ id, type, name, price, desc, val });
  const shop = [
    S('th-violet', 'theme', 'Violet Static', 800, 'Switch the whole interface accent to deep violet.', 'violet'),
    S('th-cyan', 'theme', 'Cyan Drift', 800, 'A cold cyan accent across the interface.', 'cyan'),
    S('th-amber', 'theme', 'Amber Signal', 900, 'Warm terminal amber accent.', 'amber'),
    S('th-crimson', 'theme', 'Crimson Protocol', 1200, 'Red-team crimson accent.', 'crimson'),
    S('fr-hex', 'frame', 'Hex Frame', 400, 'A hexagonal outline around your avatar.', 'hex'),
    S('fr-ring', 'frame', 'Double Ring', 600, 'Twin orbit rings that glow softly.', 'ring'),
    S('fr-glitch', 'frame', 'Glitch Frame', 900, 'A subtly glitching neon frame.', 'glitch'),
    S('fr-aurora', 'frame', 'Aurora Frame', 1500, 'A slow rotating gradient border.', 'aurora'),
    S('bd-founder', 'badge', 'Founder Mark', 300, 'A cosmetic mark shown on your profile.', 'founder'),
    S('bd-hunter', 'badge', 'Bug Hunter Pin', 500, 'A pin for the persistent explorer.', 'hunter'),
    S('bd-orbit', 'badge', 'Orbit Seal', 700, 'A seal for long-term learners.', 'orbit'),
    S('sk-blueprint', 'skin', 'Blueprint Grid', 700, 'Dashboard skin with a cyan blueprint grid.', 'blueprint'),
    S('sk-carbon', 'skin', 'Carbon Weave', 600, 'Dashboard skin with a carbon-fiber texture.', 'carbon'),
    S('sk-scan', 'skin', 'Deep Scan', 900, 'Dashboard skin with a stronger scanline sweep.', 'scan'),
    S('ti-ghostwriter', 'title', 'Ghost Writer', 300, 'Display title for your profile.', 'Ghost Writer'),
    S('ti-packetpoet', 'title', 'Packet Poet', 400, 'Display title for your profile.', 'Packet Poet'),
    S('ti-rootwhisper', 'title', 'Root Whisperer', 600, 'Display title for your profile.', 'Root Whisperer'),
    S('ti-zerohour', 'title', 'Zero Hour', 800, 'Display title for your profile.', 'Zero Hour'),
    S('fx-glow', 'effect', 'Terminal Glow', 500, 'Adds a soft glow to headings and numbers.', 'glow'),
    S('fx-trail', 'effect', 'Cube Burst', 600, 'Cubes burst in a bigger pattern when you earn them.', 'burst'),
    S('fx-crt', 'effect', 'CRT Flicker', 450, 'A faint CRT flicker on the top bar.', 'crt'),
  ];

  /* ---------- LEADERBOARD ---------- */
  const U = (name, xp, cubes, labs, chals, delta, wxp, mxp, friend, streak) => ({ name, xp, cubes, labs, chals, delta, wxp, mxp, friend, streak });
  const users = [
    U('vexillum', 48210, 61230, 15, 32, 0, 2310, 8120, true, 74),
    U('0xKestrel', 45880, 55410, 15, 31, 1, 2190, 7840, false, 61),
    U('nullpointer_nia', 43020, 52870, 14, 30, -1, 1980, 7410, true, 58),
    U('rootless', 39870, 47100, 14, 29, 2, 2540, 7010, false, 45),
    U('byteWitch', 36440, 43320, 13, 28, 0, 1760, 6320, true, 39),
    U('ironsparrow', 33250, 38900, 13, 27, -2, 1220, 5410, false, 33),
    U('cipherkid', 29780, 35010, 12, 26, 3, 2020, 5880, false, 28),
    U('latencyLynx', 26110, 30220, 12, 25, 0, 980, 4210, true, 26),
    U('hexenmeister', 23440, 27640, 11, 23, -1, 1410, 4780, false, 22),
    U('pivotpanda', 20890, 24150, 11, 22, 1, 1110, 3920, false, 19),
    U('sudo_sam', 18270, 21390, 10, 20, 0, 870, 3340, true, 17),
    U('quartzfox', 16050, 18620, 9, 19, 2, 1330, 3510, false, 15),
    U('kernel_kat', 14120, 16880, 9, 17, -1, 640, 2780, false, 12),
    U('binarybloom', 12330, 14210, 8, 16, 0, 720, 2540, false, 11),
    U('shellshade', 10610, 12480, 8, 14, 1, 560, 2190, true, 9),
    U('mothernode', 9040, 10330, 7, 13, -3, 410, 1630, false, 8),
    U('dustdaemon', 7720, 8950, 6, 11, 0, 590, 1840, false, 8),
    U('glasswing', 6410, 7210, 5, 9, 2, 770, 1710, true, 6),
    U('tapewyrm', 5120, 5880, 5, 8, 0, 330, 1020, false, 5),
    U('nightlark', 4260, 4720, 4, 7, 1, 440, 980, false, 5),
    U('orbitalrey', 3350, 3910, 3, 5, -1, 280, 640, false, 4),
    U('pixelmoth', 2480, 2760, 3, 4, 0, 350, 710, true, 3),
    U('lowtide', 1610, 1830, 2, 3, 1, 190, 410, false, 3),
    U('cobaltpine', 880, 1020, 1, 2, 0, 120, 260, false, 2),
  ];

  /* ---------- MISC ---------- */
  const missions = [
    { id: 'm-weblab', text: 'Complete 1 Web Security Lab', kind: 'lab-web', target: 1, xp: 150, cubes: 50, href: 'labs.html?cat=Web' },
    { id: 'm-lessons', text: 'Complete 3 lessons', kind: 'lesson', target: 3, xp: 120, cubes: 40, href: 'courses.html' },
    { id: 'm-chal', text: 'Solve 1 challenge', kind: 'challenge', target: 1, xp: 150, cubes: 50, href: 'challenges.html' },
    { id: 'm-lab', text: 'Complete any lab', kind: 'lab', target: 1, xp: 180, cubes: 60, href: 'labs.html' },
    { id: 'm-quiz', text: 'Pass 2 knowledge checks', kind: 'quiz', target: 2, xp: 100, cubes: 35, href: 'courses.html' },
  ];
  const ranks = [[1, 'Initiate'], [3, 'Runner'], [5, 'Operator'], [8, 'Specialist'], [12, 'Vector'], [17, 'Phantom'], [25, 'Architect']];
  const streakMilestones = [{ d: 3, cubes: 50 }, { d: 7, cubes: 150 }, { d: 14, cubes: 300 }, { d: 30, cubes: 1000 }];
  const titles = ['Initiate', 'Operator', 'Packet Hunter', 'Night Shift'];
  const themes = { green: '#2dff8f', violet: '#a78bfa', cyan: '#38d9ff', amber: '#ffb84d', crimson: '#ff4d6a' };
  const testimonials = [
    { q: 'The labs feel like a real engagement without the setup pain. I finished my first web lab in under half an hour and wanted another immediately.', n: 'mirelle_k', r: 'Junior SOC analyst (demo testimonial)' },
    { q: 'Streaks and Cubes got me opening the app daily. The courses are short enough to finish on a commute but deep enough to matter.', n: 'tobias_ng', r: 'Self-taught learner (demo testimonial)' },
    { q: 'Our team uses the weekly board as a friendly ladder. The challenge categories cover exactly what interviews ask about.', n: 'aarav_p', r: 'Security engineer (demo testimonial)' },
  ];
  const faq = [
    ['What are Cubes?', 'Cubes are virtual platform points you earn by learning and competing. You spend them on cosmetics and on unlocking premium labs. They have no cash value and cannot be exchanged for money.'],
    ['Are the labs safe?', 'Yes. Every lab is a text-based simulation that runs in your browser. Nothing you type is sent to a real system, and no real targets are involved.'],
    ['Do I need prior experience?', 'No. Foundations courses start from networking and Linux basics. Labs and challenges are tagged Easy to Insane so you can pick your level.'],
    ['How does progression work?', 'Every lesson, lab and challenge awards XP and Cubes. XP raises your level and rank, Cubes unlock rewards, and streaks add daily bonuses.'],
    ['Is this a real product?', 'CIPHERGRID is a front-end prototype. All data, statistics and users are fictional demo content stored locally in your browser.'],
  ];

  window.CG_DATA = { labs, challenges, achievements, shop, users, missions, ranks, streakMilestones, titles, themes, testimonials, faq };
})();
