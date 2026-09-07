<?php
declare(strict_types=1);

session_start();

if (isset($_SESSION['admin_id'])) {
    header('Location: index.php');
    exit;
}

if (!isset($_SESSION['login_csrf'])) {
    $_SESSION['login_csrf'] = bin2hex(random_bytes(32));
}

require_once __DIR__ . '/../backend/config/db.php';

$error = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim((string) ($_POST['username'] ?? ''));
    $password = (string) ($_POST['password'] ?? '');
    $csrfToken = (string) ($_POST['csrf_token'] ?? '');

    if (!hash_equals($_SESSION['login_csrf'], $csrfToken)) {
        $error = 'Your session expired. Please refresh the page and try again.';
    } elseif ($username === '' || $password === '') {
        $error = 'Please enter both username and password.';
    } else {
        try {
            $db = getDB();
            $statement = $db->prepare('SELECT id, username, password FROM admins WHERE username = :username LIMIT 1');
            $statement->execute([':username' => $username]);
            $admin = $statement->fetch();

            if ($admin && password_verify($password, $admin['password'])) {
                session_regenerate_id(true);
                $_SESSION['admin_id'] = (int) $admin['id'];
                $_SESSION['admin_username'] = $admin['username'];
                header('Location: index.php');
                exit;
            }

            $error = 'Invalid username or password.';
        } catch (Throwable $throwable) {
            $error = 'Unable to connect to the database. Please check your configuration.';
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Login | Alpha Star Laboratory Clinic</title>
  <style>
    :root {
      color-scheme: light;
      --primary: #0d9488;
      --primary-dark: #0f766e;
      --accent: #dc2626;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --gray-900: #111827;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 24px;
      font-family: Inter, Arial, sans-serif;
      background:
        radial-gradient(circle at top left, rgba(13, 148, 136, 0.12), transparent 30%),
        linear-gradient(180deg, #f8fffe 0%, #ffffff 100%);
      color: var(--gray-900);
    }
    .login-card {
      width: min(100%, 420px);
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(229, 231, 235, 0.95);
      border-radius: 28px;
      padding: 32px;
      box-shadow: 0 18px 50px rgba(15, 23, 42, 0.12);
    }
    h1 {
      margin: 0 0 10px;
      font-size: 2rem;
      line-height: 1.1;
    }
    p {
      margin: 0 0 24px;
      color: var(--gray-500);
      line-height: 1.6;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--gray-700);
    }
    input {
      width: 100%;
      border: 1px solid rgba(209, 213, 219, 0.95);
      border-radius: 16px;
      padding: 14px 16px;
      margin-bottom: 18px;
      font: inherit;
    }
    input:focus {
      outline: 3px solid rgba(13, 148, 136, 0.12);
      border-color: rgba(13, 148, 136, 0.45);
    }
    button {
      width: 100%;
      border: 0;
      border-radius: 999px;
      padding: 14px 18px;
      font: inherit;
      font-weight: 700;
      color: #fff;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      cursor: pointer;
    }
    .error {
      margin-bottom: 16px;
      padding: 12px 14px;
      border-radius: 14px;
      background: rgba(220, 38, 38, 0.08);
      color: var(--accent);
      font-weight: 600;
    }
    .helper {
      margin-top: 18px;
      font-size: 0.92rem;
      color: var(--gray-500);
    }
  </style>
</head>
<body>
  <main class="login-card">
    <h1>Admin Login</h1>
    <p>Sign in to view patient booking requests and update appointment statuses.</p>

    <?php if ($error !== ''): ?>
      <div class="error"><?= htmlspecialchars($error, ENT_QUOTES, 'UTF-8') ?></div>
    <?php endif; ?>

    <form method="post" action="">
      <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['login_csrf'], ENT_QUOTES, 'UTF-8') ?>">
      <label for="username">Username</label>
      <input id="username" name="username" type="text" autocomplete="username" required>

      <label for="password">Password</label>
      <input id="password" name="password" type="password" autocomplete="current-password" required>

      <button type="submit">Sign In</button>
    </form>

    <p class="helper">Default credentials after schema import: <strong>admin</strong> / <strong>Admin@1234</strong></p>
  </main>
</body>
</html>
