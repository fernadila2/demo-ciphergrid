/* CIPHERGRID — course catalog (fictional demo content).
 * Lesson tuple: [title, explanation, lang, code, question, options[], correctIndex]
 * Replace this file with an API call (GET /api/courses) when a backend exists. */
(function () {
  const L = (t, text, lang, code, q, opts, a) => ({ t, text, lang, code, q, opts, a });
  const C = (id, title, cat, topic, diff, hrs, icon, desc, flow, lab, chal, mods) => ({
    id, title, cat, topic, diff, hrs, icon, desc, flow, lab, chal,
    xp: { Easy: 400, Medium: 700, Hard: 1000, Insane: 1400 }[diff],
    cubes: { Easy: 200, Medium: 350, Hard: 500, Insane: 750 }[diff],
    modules: mods.map((m, mi) => ({
      id: id + '-m' + (mi + 1), title: m[0],
      lessons: m[1].map((l, li) => Object.assign({ id: id + '-m' + (mi + 1) + '-l' + (li + 1) }, l)),
    })),
  });

  const courses = [
    C('net', 'Computer Networking', 'Foundations', 'Computer Networking', 'Easy', 6, 'network',
      'Understand how packets move across networks: layers, addressing, routing and the protocols attackers and defenders both rely on.',
      ['Host', 'Switch', 'Router', 'Internet', 'Server'], 'packet-forge', 'N1', [
        ['The Layered Model', [
          L('OSI vs TCP/IP', 'Networks are described in layers so each layer can change without breaking the others. The OSI model has seven layers; TCP/IP collapses them into four. Defenders map every alert to a layer to know where to look.', 'term', '$ ip -br addr\nlo      UNKNOWN  127.0.0.1/8\neth0    UP       10.0.4.21/24', 'Which OSI layer is responsible for IP addressing?', ['Layer 2', 'Layer 3', 'Layer 4'], 1),
          L('IP Addressing & Subnets', 'An IPv4 address has a network part and a host part split by the subnet mask. A /24 leaves 8 host bits, giving 254 usable addresses. Subnetting limits how far a compromised host can reach.', 'text', '10.0.4.21/24\nnetwork   : 10.0.4.0\nbroadcast : 10.0.4.255\nhosts     : 10.0.4.1 - 10.0.4.254', 'How many usable hosts does a /24 provide?', ['256', '254', '255'], 1),
        ]],
        ['Transport & Name Resolution', [
          L('TCP, UDP and Ports', 'TCP gives reliable ordered delivery using a three-way handshake. UDP is connectionless and fast. Ports identify services on a host, so an open port is an exposed service.', 'term', '$ ss -tln\nState   Local Address:Port\nLISTEN  0.0.0.0:22\nLISTEN  0.0.0.0:443', 'Which packet starts a TCP handshake?', ['ACK', 'SYN', 'FIN'], 1),
          L('DNS in Practice', 'DNS translates names into addresses. Records such as A, MX and TXT reveal infrastructure and are heavily used in reconnaissance and in detection of data exfiltration.', 'term', '$ dig +short ciphergrid.example A\n198.51.100.24\n$ dig +short ciphergrid.example TXT\n"v=spf1 -all"', 'Which record type maps a name to an IPv4 address?', ['A', 'MX', 'TXT'], 0),
        ]],
      ]),
    C('linux', 'Linux Fundamentals', 'Foundations', 'Linux Fundamentals', 'Easy', 7, 'terminal',
      'Navigate the filesystem, manage users and permissions, and read the system like an operator. Linux is the home ground of most security tooling.',
      ['User', 'Shell', 'Kernel', 'Files'], 'lantern-drift', 'L1', [
        ['Filesystem & Permissions', [
          L('Navigating the Filesystem', 'Everything is a file in Linux. Learn the standard hierarchy: /etc for configuration, /var/log for logs, /home for users and /tmp for temporary data that anyone can write.', 'term', '$ cd /var/log && ls -lh | head -3\n-rw-r----- 1 root adm  412K auth.log\n-rw-r----- 1 root adm  1.2M syslog', 'Where are most system logs stored?', ['/etc', '/var/log', '/opt'], 1),
          L('Users, Groups and chmod', 'Permissions are expressed as read, write and execute for owner, group and others. Octal notation packs them into three digits, so 640 means owner rw, group r, others none.', 'term', '$ chmod 640 report.txt\n$ ls -l report.txt\n-rw-r----- 1 ana staff 88 report.txt', 'What does chmod 600 give the owner?', ['Read and write', 'Read only', 'Full control to everyone'], 0),
        ]],
        ['Processes & Services', [
          L('Processes and Signals', 'Each running program is a process with a PID. Signals such as SIGTERM ask a process to stop politely while SIGKILL forces it. Analysts inspect process trees to spot odd parent-child relationships.', 'term', '$ ps -eo pid,ppid,cmd | head -3\n  1     0 /sbin/init\n 412     1 /usr/sbin/sshd -D', 'Which signal cannot be ignored by a process?', ['SIGTERM', 'SIGKILL', 'SIGHUP'], 1),
          L('systemd and Scheduled Tasks', 'systemd manages services; cron and timers run scheduled jobs. Both are common persistence points, so defenders review them regularly.', 'term', '$ systemctl list-timers --no-pager | head -3\nNEXT                  UNIT\nMon 02:00:00 UTC      logrotate.timer', 'Why do defenders audit cron jobs?', ['They speed up the CPU', 'They can hide persistence', 'They store passwords'], 1),
        ]],
      ]),
    C('win', 'Windows Fundamentals', 'Foundations', 'Windows Fundamentals', 'Easy', 6, 'grid',
      'Learn the Windows security model: accounts, the registry, services, event logs and the tools administrators use daily.',
      ['User', 'Session', 'Service', 'Registry'], 'dust-protocol', 'O1', [
        ['Accounts & Security Model', [
          L('Accounts, SIDs and UAC', 'Every account and group has a Security Identifier. User Account Control separates standard and elevated tokens, limiting the damage of a single mistake.', 'term', '> whoami /groups\nBUILTIN\\Users            Group used for deny only\nMandatory Label\\Medium   Label', 'What does a SID uniquely identify?', ['A file', 'A security principal', 'A network port'], 1),
          L('The Registry', 'The registry stores configuration for the OS and applications. Run keys can launch programs at logon, which makes them a classic place to look for persistence.', 'term', '> reg query HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run', 'Why review Run keys?', ['They store wallpapers', 'Programs there start at logon', 'They hold DNS records'], 1),
        ]],
        ['Services & Telemetry', [
          L('Services and Processes', 'Windows services run in the background, often under powerful accounts. Unquoted paths and weak permissions on service binaries are common misconfigurations.', 'term', '> sc query type= service state= running | more', 'Which account level do many services run under?', ['Guest', 'SYSTEM', 'Anonymous'], 1),
          L('Event Logs', 'Security events record logons, privilege use and policy changes. Event 4625 is a failed logon and 4624 a successful one, the foundation of many detections.', 'text', '4625  An account failed to log on\n4624  An account was successfully logged on\n4672  Special privileges assigned', 'Which event ID means a failed logon?', ['4624', '4625', '4672'], 1),
        ]],
      ]),
    C('cli', 'Command Line Mastery', 'Foundations', 'Command Line', 'Easy', 5, 'terminal',
      'Chain small tools together with pipes, filters and scripts to answer questions about data quickly.',
      ['Input', 'grep', 'sort', 'Output'], 'lantern-drift', 'L2', [
        ['Pipes and Filters', [
          L('Pipes and Redirection', 'A pipe sends the output of one command into the next. Redirection writes output to files. Together they let you build analysis chains from tiny tools.', 'term', '$ cat access.log | cut -d" " -f1 | sort | uniq -c | sort -rn | head -3\n 812 203.0.113.9\n  77 198.51.100.4', 'Which symbol sends output into another command?', ['|', '>', '&'], 0),
          L('grep, awk and sed', 'grep finds lines, awk extracts fields and sed rewrites text. Learning these three makes log triage dramatically faster.', 'term', "$ awk '{print $9}' access.log | sort | uniq -c\n  901 200\n   44 404\n   12 500", 'Which tool is best for extracting a column?', ['awk', 'chmod', 'ping'], 0),
        ]],
        ['Shell Scripting', [
          L('Variables and Loops', 'Shell scripts automate repeated work. Always quote variables to avoid word splitting and surprising behavior with spaces.', 'bash', 'for f in *.log; do\n  echo "$f: $(wc -l < "$f") lines"\ndone', 'Why quote shell variables?', ['To avoid word splitting', 'To make them faster', 'To hide them'], 0),
          L('Exit Codes and Safety', 'Every command returns an exit code, where zero means success. Use set -euo pipefail so scripts stop on errors instead of failing silently.', 'bash', '#!/usr/bin/env bash\nset -euo pipefail\ngrep -q "ERROR" app.log && echo "errors found"', 'What does exit code 0 mean?', ['Failure', 'Success', 'Timeout'], 1),
        ]],
      ]),
    C('py', 'Python Basics for Security', 'Foundations', 'Python Basics', 'Easy', 8, 'code',
      'Write practical Python to parse logs, decode data and automate repetitive analysis tasks safely.',
      ['Read', 'Parse', 'Analyze', 'Report'], 'hollow-signal', 'P1', [
        ['Core Language', [
          L('Data Types and Control Flow', 'Lists, dictionaries and sets cover most analysis needs. Dictionaries are ideal for counting events by key such as source address.', 'python', 'counts = {}\nfor ip in ["10.0.0.5", "10.0.0.5", "10.0.0.9"]:\n    counts[ip] = counts.get(ip, 0) + 1\nprint(counts)', 'Which structure is best for counting by key?', ['Dictionary', 'Tuple', 'String'], 0),
          L('Files and Parsing', 'Open files with a context manager so they close automatically. Split lines into fields and ignore malformed rows instead of crashing.', 'python', 'with open("auth.log") as fh:\n    failed = [l for l in fh if "Failed password" in l]\nprint(len(failed))', 'Why use "with open"?', ['It closes the file automatically', 'It encrypts the file', 'It is faster'], 0),
        ]],
        ['Security Automation', [
          L('Encoding and Hashing', 'Base64 is an encoding, not encryption. Hash functions create fixed-size fingerprints and are used to verify file integrity.', 'python', 'import base64, hashlib\nprint(base64.b64decode("Q0d7aGVsbG99"))\nprint(hashlib.sha256(b"hello").hexdigest()[:16])', 'Is Base64 a form of encryption?', ['Yes', 'No, it is an encoding', 'Only with a key'], 1),
          L('Safe Network Scripting', 'Only test systems you own or are authorized to assess. A simple connect check against your own lab host teaches sockets without risk.', 'python', 'import socket\ns = socket.socket()\ns.settimeout(1)\nprint(s.connect_ex(("127.0.0.1", 22)) == 0)', 'Which hosts may you test?', ['Any public host', 'Only systems you are authorized to test', 'Only your neighbours'], 1),
        ]],
      ]),
    C('git', 'Git & GitHub', 'Foundations', 'Git & GitHub', 'Easy', 4, 'code',
      'Track changes, collaborate safely and learn how leaked secrets in repositories become incidents.',
      ['Edit', 'Commit', 'Push', 'Review'], 'static-harbor', 'P2', [
        ['Version Control', [
          L('Commits and Branches', 'A commit is a snapshot with a message and parent. Branches are cheap pointers that let you work in isolation before merging.', 'term', '$ git switch -c fix/login-timeout\n$ git commit -m "Shorten session timeout"', 'What is a branch?', ['A pointer to a commit', 'A server', 'A password'], 0),
          L('Reviewing History', 'History is permanent unless rewritten. Use log and diff to see who changed what and when, a key skill during investigations.', 'term', '$ git log --oneline -3\n9f2c1ab Rotate API key\n41de07c Add login rate limit', 'Which command shows past commits?', ['git log', 'git push', 'git init'], 0),
        ]],
        ['Secrets & Collaboration', [
          L('Secret Hygiene', 'Never commit credentials. A secret pushed once should be treated as compromised and rotated, even if the commit is later deleted.', 'text', 'Found: AWS-style key in commit 41de07c\nAction: revoke key, rotate, scan history', 'What should you do after committing a secret?', ['Delete the file only', 'Rotate the secret', 'Ignore it'], 1),
          L('Pull Requests and Reviews', 'Reviews catch mistakes before they ship. Security-minded reviewers check input handling, authorization and dependency changes.', 'text', 'Review checklist:\n[ ] inputs validated\n[ ] authz enforced\n[ ] no secrets added', 'Why do security reviews matter?', ['They catch flaws before release', 'They slow teams down', 'They are optional forever'], 0),
        ]],
      ]),
    C('http', 'HTTP Fundamentals', 'Web Security', 'HTTP Fundamentals', 'Easy', 5, 'globe',
      'Requests, responses, headers and cookies: the vocabulary you need before you can reason about any web vulnerability.',
      ['Client', 'Proxy', 'Server', 'Database'], 'neon-vault', 'W1', [
        ['Requests & Responses', [
          L('Anatomy of a Request', 'A request has a method, path, headers and optional body. Servers answer with a status code, headers and a body. Safe methods like GET should not change state.', 'http', 'GET /api/profile HTTP/1.1\nHost: app.ciphergrid.example\nAccept: application/json\n\nHTTP/1.1 200 OK\nContent-Type: application/json', 'Which method should not change server state?', ['GET', 'POST', 'DELETE'], 0),
          L('Status Codes', '2xx means success, 3xx redirection, 4xx client error and 5xx server error. Unusual codes in logs often signal scanning or broken exploits.', 'text', '200 OK   301 Moved   401 Unauthorized\n403 Forbidden   404 Not Found   500 Server Error', 'Which family means server error?', ['4xx', '5xx', '3xx'], 1),
        ]],
        ['Headers & Cookies', [
          L('Security Headers', 'Headers such as Content-Security-Policy and Strict-Transport-Security instruct the browser to enforce protections. They reduce impact even when bugs exist.', 'http', 'Strict-Transport-Security: max-age=31536000\nContent-Security-Policy: default-src \'self\'\nX-Content-Type-Options: nosniff', 'What does HSTS enforce?', ['HTTPS only', 'Faster pages', 'Image caching'], 0),
          L('Cookies and Flags', 'Cookies keep state. The HttpOnly flag hides them from scripts, Secure limits them to HTTPS and SameSite restricts cross-site sending.', 'http', 'Set-Cookie: sid=9a1f; HttpOnly; Secure; SameSite=Lax; Path=/', 'Which flag hides a cookie from JavaScript?', ['Secure', 'HttpOnly', 'Path'], 1),
        ]],
      ]),
    C('auth', 'Authentication & Session Security', 'Web Security', 'Authentication', 'Medium', 6, 'key',
      'Design and test login flows, password storage, multi-factor prompts and session handling.',
      ['Login', 'Verify', 'Session', 'Logout'], 'iron-ledger', 'W3', [
        ['Authentication', [
          L('Password Storage', 'Passwords must be stored with slow, salted hashing such as Argon2 or bcrypt. Fast general-purpose hashes make cracking cheap.', 'python', 'import bcrypt\nh = bcrypt.hashpw(b"s3cret", bcrypt.gensalt(12))\nprint(bcrypt.checkpw(b"s3cret", h))', 'Which is suited to password storage?', ['MD5', 'bcrypt', 'Base64'], 1),
          L('Multi-Factor Authentication', 'A second factor blocks most credential-stuffing attempts. Prefer authenticator apps or hardware keys over SMS where possible.', 'text', 'Something you know  + password\nSomething you have  + hardware key\nSomething you are   + biometric', 'Why add a second factor?', ['A stolen password alone is not enough', 'It speeds up login', 'It removes passwords'], 0),
        ]],
        ['Sessions', [
          L('Session Lifecycle', 'After login the server issues an unpredictable identifier and rotates it to prevent fixation. Logout must invalidate it on the server.', 'text', 'login  -> issue new session id\nprivilege change -> rotate id\nlogout -> destroy server session', 'What prevents session fixation?', ['Rotating the id after login', 'Longer URLs', 'Bigger cookies'], 0),
          L('Token Pitfalls', 'Signed tokens are only trustworthy if the server verifies the signature and the expected algorithm. Never accept tokens that say they need no verification.', 'text', 'header: {"alg":"HS256"}\nserver MUST: pin algorithm, verify signature, check expiry', 'What must a server always do with a signed token?', ['Verify the signature', 'Trust the header', 'Store it in the URL'], 0),
        ]],
      ]),
    C('sqli', 'SQL Injection', 'Web Security', 'SQL Injection', 'Medium', 6, 'database',
      'See how untrusted input changes query meaning, then learn the defenses that make injection structurally impossible.',
      ['Input', 'Query', 'Database', 'Response'], 'static-harbor', 'W2', [
        ['How Injection Works', [
          L('Query Construction', 'Injection happens when input is concatenated into a query so the database cannot tell data from code. The result is a query the developer never intended.', 'sql', "-- vulnerable pattern (do not ship)\nSELECT * FROM users WHERE name = '" + "' + input + " + "'';", 'What is the root cause of SQL injection?', ['Mixing data with code', 'Slow servers', 'Large tables'], 0),
          L('Impact and Detection', 'Impact ranges from reading data to altering it. Look for database errors, odd time delays and unusual quotes in web logs.', 'text', 'WAF log: 403 /search?q=%27+OR+%271%27%3D%271\nApp log: SQLSTATE[42000] syntax error', 'Which log clue hints at injection attempts?', ['Encoded quotes in parameters', 'Short URLs', 'Many 200s'], 0),
        ]],
        ['Defenses', [
          L('Parameterized Queries', 'Prepared statements send the query structure and the values separately, so input can never become code.', 'python', 'cur.execute("SELECT * FROM users WHERE name = %s", (name,))', 'Which defense separates code from data?', ['Parameterized queries', 'Blacklists', 'Obfuscation'], 0),
          L('Least Privilege for Databases', 'Application accounts should only hold the permissions they need. Read-only accounts limit damage even when a flaw exists.', 'sql', 'CREATE USER app_ro;\nGRANT SELECT ON shop.products TO app_ro;', 'Why use a read-only app account?', ['It limits damage', 'It speeds queries', 'It encrypts rows'], 0),
        ]],
      ]),
    C('xss', 'Cross-Site Attacks: XSS & CSRF', 'Web Security', 'XSS & CSRF', 'Medium', 6, 'shield',
      'Understand script injection and forged requests, and apply output encoding, CSP and anti-forgery tokens.',
      ['User', 'Browser', 'App', 'Attacker site'], 'echo-chamber', 'W4', [
        ['Cross-Site Scripting', [
          L('Reflected, Stored and DOM XSS', 'XSS occurs when untrusted data is rendered as script in a victim browser. Stored XSS persists on the server, reflected XSS bounces from a request, DOM XSS lives in client code.', 'html', '<!-- unsafe: user text placed directly in HTML -->\n<p>Hello, {{ name }}</p>\n<!-- safe: context-aware output encoding -->', 'Which XSS type persists on the server?', ['Stored', 'Reflected', 'DOM'], 0),
          L('Output Encoding and CSP', 'Encode data for the context where it is rendered. Add a Content-Security-Policy as defense in depth to restrict script sources.', 'http', "Content-Security-Policy: default-src 'self'; script-src 'self'", 'What is the primary XSS defense?', ['Context-aware output encoding', 'Hiding inputs', 'Longer cookies'], 0),
        ]],
        ['Cross-Site Request Forgery', [
          L('How CSRF Works', 'A forged request rides on the victim\'s authenticated browser session. It targets state-changing actions such as changing an email address.', 'text', 'victim logged in at bank.example\nmalicious page triggers POST /transfer\nbrowser attaches session cookie', 'What does CSRF abuse?', ['The browser attaching cookies automatically', 'Weak Wi-Fi', 'Large uploads'], 0),
          L('Anti-CSRF Defenses', 'Use unpredictable per-session tokens and SameSite cookies, and require re-authentication for sensitive actions.', 'http', 'Set-Cookie: sid=...; SameSite=Strict\nX-CSRF-Token: 7d2f...', 'Which cookie attribute helps against CSRF?', ['SameSite', 'Path', 'Domain'], 0),
        ]],
      ]),
    C('acl', 'Access Control & API Security', 'Web Security', 'Access Control', 'Medium', 7, 'lock',
      'Broken access control is the most common serious web flaw. Learn to model, test and enforce authorization, including for APIs.',
      ['Request', 'Authn', 'Authz', 'Resource'], 'iron-ledger', 'W3', [
        ['Authorization', [
          L('IDOR and Object-Level Checks', 'An insecure direct object reference appears when the server trusts an identifier without checking ownership. Always verify the caller may access that specific object.', 'http', 'GET /api/invoices/1042\nAuthorization: Bearer <token of user A>\n-> must return 403 if invoice 1042 belongs to user B', 'What must the server check on every object request?', ['Ownership or permission', 'Browser type', 'Cookie size'], 0),
          L('Roles and Least Privilege', 'Role-based access control assigns permissions through roles. Deny by default and review roles regularly for creep.', 'text', 'role: viewer  -> read\nrole: editor  -> read, write\nrole: admin   -> read, write, manage', 'What is deny by default?', ['Block unless explicitly allowed', 'Allow all', 'Log only'], 0),
        ]],
        ['API Security', [
          L('Rate Limits and Mass Assignment', 'APIs must limit request volume and only accept expected fields. Binding raw request bodies to models can let users set fields like isAdmin.', 'json', '{ "name": "Ana", "isAdmin": true }  // server must ignore isAdmin', 'What is mass assignment?', ['Binding unexpected fields to a model', 'Large uploads', 'Parallel logins'], 0),
          L('Schema Validation', 'Validate every request against a strict schema covering type, length and range. Reject early with clear, non-revealing errors.', 'json', '{ "type": "object", "required": ["email"],\n  "properties": { "email": { "type": "string", "maxLength": 254 } } }', 'Why validate against a schema?', ['Reject malformed input early', 'Make pages prettier', 'Reduce bandwidth only'], 0),
        ]],
      ]),
    C('recon', 'Reconnaissance & Enumeration', 'Offensive Security', 'Reconnaissance', 'Medium', 7, 'eye',
      'Map an authorized target methodically: passive sources first, then careful service discovery and enumeration.',
      ['Passive', 'Active', 'Services', 'Findings'], 'black-circuit', 'N1', [
        ['Reconnaissance', [
          L('Passive Intelligence', 'Passive recon uses public sources like certificates, DNS and code repositories without touching the target. It is quiet and often surprisingly revealing.', 'text', 'sources: certificate transparency, public DNS, job posts, repos', 'What makes recon passive?', ['No direct interaction with the target', 'It is slower', 'It uses a VPN'], 0),
          L('Scope and Rules of Engagement', 'Written authorization defines targets, timing and limits. Testing outside scope is unauthorized access, regardless of intent.', 'text', 'IN SCOPE : 10.20.0.0/24 (lab)\nOUT OF SCOPE: production, third-party SaaS', 'Why define scope?', ['It keeps testing authorized', 'It speeds scans', 'It hides findings'], 0),
        ]],
        ['Enumeration', [
          L('Service Discovery', 'Port scans reveal which services listen. Version information narrows possible weaknesses and guides what to check next in the lab.', 'term', '$ scan lab.local\n22/tcp  open ssh\n8080/tcp open http', 'What does an open port indicate?', ['A listening service', 'A broken cable', 'A patched host'], 0),
          L('Content and Account Enumeration', 'Directory listings, error messages and login responses can reveal valid paths and users. Defenders should keep responses uniform.', 'text', 'valid user   -> "Wrong password"\nunknown user -> "Wrong password"   (uniform = good)', 'What do uniform error messages prevent?', ['Account enumeration', 'Caching', 'Logging'], 0),
        ]],
      ]),
    C('vuln', 'Vulnerability Assessment & Exploitation Concepts', 'Offensive Security', 'Vulnerability Assessment', 'Medium', 8, 'target',
      'Rate and prioritize weaknesses, then understand at a conceptual level how exploitation chains form.',
      ['Scan', 'Triage', 'Validate', 'Fix'], 'obsidian-node', 'L3', [
        ['Assessment', [
          L('CVE and CVSS', 'CVE identifiers name vulnerabilities and CVSS scores their severity. Context such as exposure and data value matters as much as the score.', 'text', 'CVE-YYYY-NNNN   base score 9.8 (critical)\nexposed to internet: YES  -> patch first', 'What does CVSS express?', ['Severity', 'Vendor name', 'Patch date'], 0),
          L('Prioritization', 'Rank findings by exploitability, exposure and business impact. A medium finding on an internet-facing crown jewel can outrank a high on an isolated test box.', 'text', 'priority = likelihood x impact x exposure', 'What affects priority besides severity?', ['Exposure and impact', 'Font size', 'Ticket age only'], 0),
        ]],
        ['Exploitation Concepts', [
          L('Attack Chains', 'Real compromises chain small flaws: an information leak, a weak credential, then a misconfiguration. Breaking any link stops the chain.', 'text', 'leak -> credential -> foothold -> escalation -> objective', 'How can defenders stop a chain?', ['Break any single link', 'Only patch the last step', 'Ignore leaks'], 0),
          L('Validating Safely', 'Confirm a finding with the least intrusive proof. Capture evidence, avoid data access beyond need and report clearly.', 'text', 'proof: banner shows vulnerable version\nnot required: extracting customer data', 'What should validation avoid?', ['Unnecessary data access', 'Evidence', 'Reporting'], 0),
        ]],
      ]),
    C('privesc', 'Privilege Escalation & Post-Exploitation', 'Offensive Security', 'Privilege Escalation', 'Hard', 9, 'bolt',
      'Understand how limited access becomes administrative control through misconfiguration, and how to harden against it.',
      ['Foothold', 'Enumerate', 'Escalate', 'Persist'], 'obsidian-node', 'L4', [
        ['Escalation Concepts', [
          L('Misconfigured Permissions', 'Writable scripts run by privileged users, loose sudo rules and unnecessary SUID binaries are classic weaknesses. Audit them before an attacker does.', 'term', '$ find / -perm -4000 -type f 2>/dev/null\n/usr/bin/passwd\n/usr/local/bin/backup_tool', 'Which SUID file looks unusual here?', ['/usr/bin/passwd', '/usr/local/bin/backup_tool', 'Neither'], 1),
          L('Credentials in the Wild', 'Shell history, config files and environment variables sometimes hold secrets. Teach teams to keep credentials in a vault.', 'term', '$ grep -ri "password" /etc/app/*.conf', 'Where should secrets live?', ['In a secrets vault', 'In shell history', 'In comments'], 0),
        ]],
        ['Post-Exploitation Concepts', [
          L('Persistence and Detection', 'Persistence mechanisms include scheduled tasks, startup entries and new accounts. Each leaves artifacts that detections can watch.', 'text', 'artifact: new cron entry\nartifact: new local admin\nartifact: modified service binary', 'Which is a common persistence artifact?', ['New scheduled task', 'Screen resolution', 'Desktop wallpaper'], 0),
          L('Lateral Movement Basics', 'Attackers reuse credentials to move between hosts. Network segmentation and unique local admin passwords raise the cost sharply.', 'text', 'hostA --(shared password)--> hostB --> hostC', 'What limits lateral movement?', ['Segmentation and unique credentials', 'Faster CPUs', 'More logs only'], 0),
        ]],
      ]),
    C('logs', 'Log Analysis & SIEM Fundamentals', 'Defensive Security', 'Log Analysis', 'Easy', 6, 'file',
      'Turn raw logs into answers: normalize, correlate and search events inside a SIEM.',
      ['Sources', 'Collect', 'Normalize', 'Alert'], 'zero-trace', 'F2', [
        ['Reading Logs', [
          L('Anatomy of a Log Line', 'Every useful line answers who, what, when and where. Timestamps must be consistent and in UTC, otherwise correlation breaks.', 'text', '2026-03-02T08:14:07Z sshd[412]: Failed password for svc_backup from 203.0.113.77', 'What should log timestamps use?', ['UTC', 'Local guesses', 'No timestamp'], 0),
          L('Authentication Logs', 'Bursts of failures followed by a success from the same source suggest guessing that worked. This pattern is a classic investigation lead.', 'text', '08:14 Failed ... 08:14 Failed ... 08:15 Failed ... 08:15 Accepted password', 'Which pattern suggests successful guessing?', ['Many failures then a success', 'Only successes', 'No logs'], 0),
        ]],
        ['SIEM Basics', [
          L('Collection and Normalization', 'A SIEM ingests logs from many sources and maps them to a common schema so one query works across vendors.', 'text', 'src_ip, dest_ip, user, action, outcome, timestamp', 'Why normalize logs?', ['One query works across sources', 'To shrink disks', 'To delete data'], 0),
          L('Correlation Rules', 'Correlation links separate events into one story, such as a login failure burst followed by a new admin account.', 'text', 'IF 10 failed logons in 5m AND success THEN alert "possible guessing"', 'What does correlation add?', ['Context across events', 'Faster internet', 'Encryption'], 0),
        ]],
      ]),
    C('detect', 'Detection Engineering & Threat Hunting', 'Defensive Security', 'Detection Engineering', 'Hard', 9, 'radar',
      'Write detections that are precise, testable and tuned, and hunt proactively for what rules miss.',
      ['Hypothesis', 'Data', 'Query', 'Tune'], 'zero-trace', 'F3', [
        ['Detection Engineering', [
          L('From Behavior to Rule', 'Start with attacker behavior, not tool names. Behavior-based detections survive tool changes better than hash or name matches.', 'yaml', 'title: Suspicious cron modification\nlogsource: linux auditd\ndetection:\n  selection: path|startswith "/etc/cron"\n  condition: selection', 'What should detections focus on?', ['Behavior', 'File names only', 'Colors'], 0),
          L('Testing and Tuning', 'Every rule needs test cases and a false-positive review. Measure precision and keep rules maintainable.', 'text', 'tests: 3 true positives, 5 benign samples\nfalse positive rate target: < 5%', 'Why tune a rule?', ['Reduce false positives', 'Hide alerts', 'Skip testing'], 0),
        ]],
        ['Threat Hunting', [
          L('Hypothesis-Driven Hunting', 'Hunting begins with a hypothesis, such as an unusual parent process on servers, then checks data for evidence either way.', 'text', 'hypothesis: web server spawns shell\ndata: process creation events\nresult: 0 hits / document and automate', 'How does a hunt start?', ['With a hypothesis', 'With a reboot', 'With a purchase'], 0),
          L('Baselines and Anomalies', 'You cannot spot unusual without knowing usual. Build baselines of typical logons, processes and traffic volumes.', 'text', 'baseline: 40 logons/hour    today: 410 logons/hour', 'What does a baseline enable?', ['Spotting anomalies', 'Faster boots', 'Password resets'], 0),
        ]],
      ]),
    C('ir', 'Incident Response', 'Defensive Security', 'Incident Response', 'Medium', 7, 'siren',
      'Follow a disciplined process from preparation to lessons learned, and communicate clearly under pressure.',
      ['Prepare', 'Detect', 'Contain', 'Recover'], 'zero-trace', 'F2', [
        ['The Response Lifecycle', [
          L('Preparation and Identification', 'Preparation means playbooks, contacts and tooling before anything happens. Identification confirms whether an event is truly an incident.', 'text', 'Phases: prepare > identify > contain > eradicate > recover > review', 'What happens before an incident?', ['Preparation', 'Recovery', 'Eradication'], 0),
          L('Containment Choices', 'Containment balances stopping spread with preserving evidence. Isolate hosts from the network rather than powering them off when memory matters.', 'text', 'isolate host -> snapshot -> collect evidence -> eradicate', 'Why isolate rather than power off?', ['Preserves volatile evidence', 'Saves electricity', 'It is faster'], 0),
        ]],
        ['Evidence and Reporting', [
          L('Chain of Custody', 'Record who handled evidence, when and how. Hash collected files so integrity can be shown later.', 'term', '$ sha256sum disk.img\n3b1f0c...  disk.img', 'Why hash evidence?', ['To prove integrity', 'To compress it', 'To hide it'], 0),
          L('Post-Incident Review', 'Blameless reviews turn incidents into improvements: timeline, root cause, what worked and concrete follow-up owners.', 'text', 'Timeline | Root cause | Impact | Actions (owner, due date)', 'What makes a review effective?', ['Concrete follow-up actions', 'Assigning blame', 'Skipping details'], 0),
        ]],
      ]),
    C('crypto', 'Cryptography', 'Advanced', 'Cryptography', 'Hard', 10, 'key',
      'From classical ciphers to modern authenticated encryption: what each primitive guarantees and how it fails.',
      ['Plaintext', 'Cipher', 'Key', 'Ciphertext'], 'hollow-signal', 'C3', [
        ['Foundations', [
          L('Symmetric Encryption', 'One shared key encrypts and decrypts. AES in an authenticated mode such as GCM provides both confidentiality and integrity.', 'python', 'from cryptography.hazmat.primitives.ciphers.aead import AESGCM\nkey = AESGCM.generate_key(bit_length=256)\nct = AESGCM(key).encrypt(nonce, b"data", None)', 'What does AES-GCM add over plain AES?', ['Integrity', 'Smaller files', 'Free keys'], 0),
          L('Hashing vs Encryption', 'Hashing is one-way; encryption is reversible with a key. Never use encryption where hashing belongs, such as password storage.', 'text', 'hash(x) -> fixed digest, no way back\nencrypt(x,k) -> decrypt(c,k) = x', 'Which one is reversible?', ['Encryption', 'Hashing', 'Neither'], 0),
        ]],
        ['Public Key & Pitfalls', [
          L('Public-Key Cryptography', 'Key pairs separate who can encrypt or verify from who can decrypt or sign. TLS uses it to agree on session keys.', 'text', 'public key  -> share freely\nprivate key -> never leaves owner', 'Which key must stay secret?', ['Private key', 'Public key', 'Both'], 0),
          L('Common Mistakes', 'Reused nonces, home-made algorithms and hardcoded keys break otherwise sound designs. Use vetted libraries and rotate keys.', 'text', 'DON\'T: roll your own crypto\nDON\'T: reuse nonces\nDO: use audited libraries', 'What is the safest approach to crypto?', ['Use vetted libraries', 'Invent your own cipher', 'Hardcode keys'], 0),
        ]],
      ]),
    C('re', 'Reverse Engineering & Binary Analysis', 'Advanced', 'Reverse Engineering Concepts', 'Hard', 11, 'cpu',
      'Read compiled programs: sections, strings, control flow and the habits of safe, isolated analysis.',
      ['Binary', 'Disassemble', 'Understand', 'Document'], 'kernel-orchard', 'R1', [
        ['Static Analysis', [
          L('File Formats and Strings', 'Executables have headers and sections. Printable strings often reveal messages, paths and configuration without running anything.', 'term', '$ file sample.bin\nsample.bin: ELF 64-bit LSB executable, x86-64\n$ strings -n 8 sample.bin | head -2', 'What does static analysis avoid?', ['Running the sample', 'Reading headers', 'Viewing strings'], 0),
          L('Reading Control Flow', 'Disassemblers show instructions; decompilers approximate source. Follow comparisons and branches to learn what decisions the program makes.', 'asm', 'cmp  eax, 0x2a\njne  fail\ncall success', 'What does jne do?', ['Jump if not equal', 'Jump if never', 'Join network'], 0),
        ]],
        ['Binary Analysis Practice', [
          L('Safe Analysis Environments', 'Analyze unknown samples only inside isolated, snapshotted virtual machines with no route to production networks.', 'text', 'VM: host-only network, snapshot before run, no shared folders', 'Where should unknown samples be analyzed?', ['An isolated VM', 'Your main laptop', 'A production server'], 0),
          L('Documenting Findings', 'Record hashes, behavior and indicators in a repeatable report so others can verify and defenders can act on the results.', 'text', 'sha256: ...\nbehavior: reads config, beacons every 60s\nIOCs: domain, mutex, path', 'What do IOCs help defenders do?', ['Detect the threat elsewhere', 'Decorate reports', 'Slow analysis'], 0),
        ]],
      ]),
    C('mal', 'Malware Analysis Concepts', 'Advanced', 'Malware Analysis Concepts', 'Hard', 9, 'bug',
      'A conceptual tour of how analysts classify malicious software and extract indicators, with no live samples.',
      ['Triage', 'Static', 'Dynamic', 'Report'], 'kernel-orchard', 'R2', [
        ['Triage', [
          L('Families and Behaviors', 'Malware is grouped by behavior: loaders, stealers, ransomware, backdoors. Classifying behavior guides containment priorities.', 'text', 'loader -> downloads next stage\nstealer -> collects credentials\nransomware -> encrypts for extortion', 'What does a loader do?', ['Fetches further payloads', 'Prints documents', 'Cleans disks'], 0),
          L('Quick Triage Signals', 'Hashes, signatures and reputation lookups provide fast first answers before deeper work begins.', 'term', '$ sha256sum sample.bin\n$ lookup-hash <digest>   # simulated threat feed', 'Why check a hash first?', ['Fast known-bad lookup', 'To run it', 'To rename it'], 0),
        ]],
        ['Behavior & Reporting', [
          L('Observing Behavior Safely', 'Sandboxes record file, registry and network activity. The goal is to extract indicators, not to execute on a real system.', 'text', 'observed: creates run key, resolves update.example, writes temp file', 'What is a sandbox for?', ['Observing behavior safely', 'Gaming', 'Storing backups'], 0),
          L('Writing the Report', 'Reports summarize impact, technical details and recommended mitigations in language readers can act on.', 'text', 'Summary | Technical details | IOCs | Mitigations', 'Who reads a good malware report?', ['Responders and leaders', 'Only the author', 'Nobody'], 0),
        ]],
      ]),
    C('cloud', 'Cloud Security', 'Advanced', 'Cloud Security', 'Hard', 8, 'cloud',
      'Shared responsibility, identity-first design and the misconfigurations behind many cloud incidents.',
      ['Identity', 'Network', 'Storage', 'Logging'], 'pale-meridian', 'N4', [
        ['Cloud Foundations', [
          L('Shared Responsibility', 'The provider secures the underlying infrastructure; you secure your identities, data and configuration. Misunderstanding the line causes gaps.', 'text', 'provider: hardware, hypervisor\ncustomer: IAM, data, configs', 'Who secures your IAM policies?', ['The customer', 'The provider', 'Nobody'], 0),
          L('Identity and Access', 'Identity is the new perimeter. Prefer short-lived credentials, least-privilege roles and strong multi-factor on privileged users.', 'json', '{ "Effect": "Allow", "Action": "storage:Read", "Resource": "bucket/reports/*" }', 'Which is better for access?', ['Least-privilege roles', 'Shared admin keys', 'Wildcard everything'], 0),
        ]],
        ['Misconfiguration & Monitoring', [
          L('Public Storage Risks', 'Publicly readable storage has exposed countless datasets. Block public access by default and review exceptions.', 'text', 'bucket: reports-prod   public-read: TRUE   -> finding: HIGH', 'What should storage default to?', ['Private', 'Public', 'Shared with all'], 0),
          L('Audit Logging', 'Enable management-event logs everywhere and ship them to a protected account. Without logs, investigation is guesswork.', 'text', 'trail: all regions, immutable bucket, alert on root login', 'Why centralize audit logs?', ['Protect and correlate them', 'Hide costs', 'Delay alerts'], 0),
        ]],
      ]),
    C('ad', 'Active Directory Security', 'Advanced', 'Active Directory Security', 'Insane', 12, 'users',
      'Enterprise identity under the microscope: Kerberos concepts, delegation risks and tiered administration.',
      ['User', 'Domain Controller', 'Ticket', 'Service'], 'red-sector', 'N3', [
        ['Directory Concepts', [
          L('Domains, Forests and Trust', 'Active Directory groups objects into domains and forests joined by trusts. A compromise of a domain controller is a compromise of the domain.', 'text', 'forest > domain > OU > user/computer', 'What is the most critical AD asset?', ['Domain controllers', 'Printers', 'Wallpapers'], 0),
          L('Kerberos at a Glance', 'Kerberos uses tickets issued by a trusted authority instead of sending passwords. Understanding ticket flow explains many AD weaknesses.', 'text', 'client -> KDC: request ticket\nKDC -> client: ticket\nclient -> service: present ticket', 'What does Kerberos send instead of passwords?', ['Tickets', 'Images', 'Emails'], 0),
        ]],
        ['Hardening', [
          L('Tiered Administration', 'Separate administrative accounts by tier so a workstation compromise never exposes domain-level credentials.', 'text', 'Tier 0: domain controllers\nTier 1: servers\nTier 2: workstations', 'Why tier admin accounts?', ['Contain credential exposure', 'Save licences', 'Speed up logon'], 0),
          L('Monitoring AD', 'Watch for new privileged group members, unusual ticket requests and replication from non-DC hosts.', 'text', 'alert: user added to Domain Admins\nalert: replication request from workstation', 'Which change deserves an alert?', ['A new Domain Admin', 'A new wallpaper', 'A printer driver'], 0),
        ]],
      ]),
  ];

  window.CG_COURSES = courses;
})();
