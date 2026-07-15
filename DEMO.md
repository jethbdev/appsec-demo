# AppSec Vulnerabilities Demo Guide

This guide explains how to present a live demonstration of the security vulnerabilities built into this application.

For the best presentation flow, **open two different browsers** (e.g., Chrome and Firefox, or one normal window and one private/incognito window) to represent two distinct users:
*   **User A (Victim/Target)**
*   **User B (Attacker)**

---

## 💻 Prerequisites & Setup

1.  **Start the local development server:**
    ```bash
    npm run dev
    ```
    Open the application at **[http://localhost:3000](http://localhost:3000)** (or the port specified in your terminal).
2.  **Register User A (Chrome):**
    *   Go to **Sign Up**, register `user-a@example.com` (Password: `password123`).
    *   Note their **User ID** shown on the dashboard.
3.  **Register User B (Firefox / Private Window):**
    *   Go to **Sign Up**, register `user-b@example.com` (Password: `password123`).
    *   Note their **User ID** shown on the dashboard.

---

## 🔁 Demo 1: IDOR (Insecure Direct Object Reference)

### Concept
A user can access another user's private data by simply changing an ID in the URL, because the server verifies *who you are* (Authentication) but fails to check *what you own* (Authorization).

### Live Step-by-Step
1.  **As User A (Victim):**
    *   Click the **IDOR — Broken Access Control** card on your dashboard.
    *   Copy your **User ID** from the page.
2.  **As User B (Attacker):**
    *   Click the **IDOR — Broken Access Control** card on your dashboard.
    *   Observe the URL is `/profile/<user-b-id>`.
    *   In the address bar, replace `<user-b-id>` with **User A's ID** and hit Enter.
3.  **The Reveal:**
    *   User B is now successfully viewing User A's private email and profile details.
4.  **Show the Code & Fix:**
    *   Show [`src/app/api/users/[id]/route.ts`](src/app/api/users/[id]/route.ts). Point out the lack of authorization checks.
    *   Show the one-line fix:
        ```typescript
        if (session.user.id !== id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        ```

---

## 💉 Demo 2: SQL Injection (Data Exfiltration)

### Concept
Unsanitized user input is concatenated directly into a raw database query, allowing an attacker to escape the query structure and bypass filters (like the `userId` restriction).

### Live Step-by-Step
1.  **Setup Data:**
    *   **As User A:** Create a private note: "My Private Salary: $120,000".
    *   **As User B:** Create a private note: "Attacker Note: Buy milk".
2.  **Trigger normal search (As User B):**
    *   Search for "Buy". It returns only User B's note.
    *   Point to the **SQL Executed on Server** box:
        `SELECT ... WHERE userId = 'user-b-id' AND content LIKE '%Buy%'`
3.  **Execute the Injection (As User B):**
    *   In the search input, paste:
        ```sql
        ' OR '1'='1
        ```
    *   Click **Search**.
4.  **The Reveal:**
    *   The 🚨 **SQL Injection Successful!** banner flashes.
    *   User B can now see User A's private salary note (`Other User's Note` is highlighted in red).
    *   Look at the executed SQL on the screen:
        `SELECT ... WHERE userId = 'user-b-id' AND content LIKE '%' OR '1'='1%'`
        The `'` escapes the string block, and `OR '1'='1` overrides the `userId` filter.
5.  **Show the Code & Fix:**
    *   Show [`src/app/api/notes/search/route.ts`](src/app/api/notes/search/route.ts). Explain why `$queryRawUnsafe` with string interpolation is vulnerable.
    *   Explain the fix: Use parameterized queries (`$queryRaw` tagged templates or standard Prisma ORM methods).


---

## 🔍 Demo 3: Static Analysis (Semgrep)

To show how security automation detects these issues in CI/CD pipelines:

1.  **Checkout to `main` branch:**
    ```bash
    git checkout main
    ```
2.  **Run Semgrep with the custom ruleset:**
    ```bash
    podman run --rm -v "${PWD}:/src:z" docker.io/semgrep/semgrep semgrep scan --config /src/semgrep-rules.yaml
    ```
3.  **The Reveal:**
    Semgrep immediately flags the SQL Injection vulnerability in `route.ts` line 33.
4.  **Show the Fix Verification:**
    *   Switch to the fixed branch:
        ```bash
        git checkout fix/vulnerabilities
        ```
    *   Re-run the Semgrep command. It returns **0 findings**.

---

## 🔑 Demo 4: Secret Scanning (Gitleaks)

To show how scanners detect hardcoded API keys/credentials in git history:

1.  **Checkout to `main` branch.**
2.  **Add a hardcoded credential in `src/lib/auth.ts`:**
    ```typescript
    const AWS_SECRET_ACCESS_KEY = "qS7Xg9tH2vF4wY8zK1pB3jN5mQ6sT8uA0vC2xZ4y";
    ```
3.  **Commit the change to git:**
    ```bash
    git add src/lib/auth.ts && git commit -m "add key"
    ```
4.  **Run Gitleaks:**
    ```bash
    podman run --rm -v "${PWD}:/path:z" docker.io/zricethezav/gitleaks:latest detect --source="/path" -v
    ```
5.  **The Reveal:**
    Gitleaks detects the secret and outputs the commit ID, line number, and rule name (`generic-api-key`).
6.  **The Git Database Lesson:**
    *   Checkout to a branch without the key (e.g. `fix/vulnerabilities`).
    *   Re-run Gitleaks. **It still finds it!** Explain that Git commits are stored permanently in the local `.git` history db until aggressively purged.
