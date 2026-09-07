<?php
declare(strict_types=1);

session_start();

if (!isset($_SESSION['admin_id'])) {
    header('Location: login.php');
    exit;
}

if (!isset($_SESSION['admin_csrf'])) {
    $_SESSION['admin_csrf'] = bin2hex(random_bytes(32));
}

require_once __DIR__ . '/../backend/config/db.php';

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8');
}

$allowedStatuses = ['pending', 'confirmed', 'cancelled', 'done'];
$statusFilter = (string) ($_GET['status'] ?? 'all');
$searchQuery = trim((string) ($_GET['q'] ?? ''));
$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = 20;
$flash = '';
$error = '';

if ($statusFilter !== 'all' && !in_array($statusFilter, $allowedStatuses, true)) {
    $statusFilter = 'all';
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $bookingId = (int) ($_POST['booking_id'] ?? 0);
    $newStatus = (string) ($_POST['status'] ?? '');
    $csrfToken = (string) ($_POST['csrf_token'] ?? '');
    $redirectStatus = (string) ($_POST['redirect_status'] ?? $statusFilter);
    $redirectQuery = trim((string) ($_POST['redirect_query'] ?? $searchQuery));
    $redirectPage = max(1, (int) ($_POST['redirect_page'] ?? $page));

    if ($redirectStatus !== 'all' && !in_array($redirectStatus, $allowedStatuses, true)) {
        $redirectStatus = 'all';
    }

    $redirectParams = [
        'status' => $redirectStatus,
        'q' => $redirectQuery,
        'page' => $redirectPage,
    ];

    if (!hash_equals($_SESSION['admin_csrf'], $csrfToken)) {
        $redirectParams['error'] = 'Your session expired. Please refresh the page and try again.';
        header('Location: index.php?' . http_build_query($redirectParams));
        exit;
    }

    if ($bookingId <= 0 || !in_array($newStatus, $allowedStatuses, true)) {
        $redirectParams['error'] = 'Invalid booking update request.';
        header('Location: index.php?' . http_build_query($redirectParams));
        exit;
    }

    try {
        $db = getDB();
        $statement = $db->prepare(
            'UPDATE bookings SET status = :status, updated_at = CURRENT_TIMESTAMP WHERE id = :id'
        );
        $statement->execute([
            ':status' => $newStatus,
            ':id' => $bookingId,
        ]);

        $redirectParams['updated'] = '1';
        header('Location: index.php?' . http_build_query($redirectParams));
        exit;
    } catch (Throwable $throwable) {
        $redirectParams['error'] = 'Unable to update booking status.';
        header('Location: index.php?' . http_build_query($redirectParams));
        exit;
    }
}

if (isset($_GET['updated'])) {
    $flash = 'Booking status updated successfully.';
}

if (isset($_GET['error'])) {
    $error = (string) $_GET['error'];
}

$bookings = [];
$total = 0;
$pages = 1;

try {
    $db = getDB();
    $conditions = [];
    $params = [];

    if ($statusFilter !== 'all') {
      $conditions[] = 'status = :status';
      $params[':status'] = $statusFilter;
    }

    if ($searchQuery !== '') {
      $conditions[] = '(full_name LIKE :search OR phone LIKE :search OR email LIKE :search OR service LIKE :search)';
      $params[':search'] = '%' . $searchQuery . '%';
    }

    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
    $offset = ($page - 1) * $limit;

    $query = "SELECT * FROM bookings {$where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset";
    $statement = $db->prepare($query);

    foreach ($params as $key => $value) {
        $statement->bindValue($key, $value, PDO::PARAM_STR);
    }

    $statement->bindValue(':limit', $limit, PDO::PARAM_INT);
    $statement->bindValue(':offset', $offset, PDO::PARAM_INT);
    $statement->execute();
    $bookings = $statement->fetchAll();

    $countStatement = $db->prepare("SELECT COUNT(*) FROM bookings {$where}");
    foreach ($params as $key => $value) {
        $countStatement->bindValue($key, $value, PDO::PARAM_STR);
    }
    $countStatement->execute();
    $total = (int) $countStatement->fetchColumn();
    $pages = max(1, (int) ceil($total / $limit));

    if ($page > $pages) {
        header('Location: index.php?' . http_build_query([
            'status' => $statusFilter,
            'q' => $searchQuery,
            'page' => $pages,
        ]));
        exit;
    }
} catch (Throwable $throwable) {
    $error = 'Unable to load bookings. Please check the database connection.';
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard | Alpha Star Laboratory Clinic</title>
  <style>
    :root {
      --primary: #0d9488;
      --primary-dark: #0f766e;
      --accent: #dc2626;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-200: #e5e7eb;
      --gray-500: #6b7280;
      --gray-700: #374151;
      --gray-900: #111827;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      background: #f8fafc;
      color: var(--gray-900);
    }
    .page {
      max-width: 1380px;
      margin: 0 auto;
      padding: 24px;
    }
    .topbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      padding: 24px 0;
    }
    .topbar h1 {
      margin: 0;
      font-size: 2rem;
    }
    .topbar p {
      margin: 6px 0 0;
      color: var(--gray-500);
    }
    .topbar a {
      text-decoration: none;
      color: #fff;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      padding: 12px 18px;
      border-radius: 999px;
      font-weight: 700;
    }
    .panel,
    .table-wrap {
      background: rgba(255, 255, 255, 0.98);
      border: 1px solid rgba(229, 231, 235, 0.96);
      border-radius: 24px;
      box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
    }
    .panel {
      padding: 20px;
      margin-bottom: 22px;
    }
    .filters {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      align-items: end;
    }
    label {
      display: block;
      margin-bottom: 8px;
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--gray-700);
    }
    input,
    select,
    button {
      font: inherit;
    }
    input,
    select {
      width: 100%;
      padding: 12px 14px;
      border-radius: 14px;
      border: 1px solid rgba(209, 213, 219, 0.95);
    }
    .filter-actions {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .filter-actions button,
    .filter-actions a,
    .status-form button {
      border: 0;
      border-radius: 999px;
      padding: 11px 16px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
    }
    .filter-actions button,
    .status-form button {
      color: #fff;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
    }
    .filter-actions a {
      color: var(--gray-700);
      background: var(--gray-100);
    }
    .notice,
    .error {
      margin-bottom: 16px;
      padding: 14px 16px;
      border-radius: 16px;
      font-weight: 600;
    }
    .notice {
      background: rgba(13, 148, 136, 0.08);
      color: var(--primary-dark);
    }
    .error {
      background: rgba(220, 38, 38, 0.08);
      color: var(--accent);
    }
    .summary {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      margin-bottom: 14px;
      color: var(--gray-500);
      font-weight: 600;
    }
    .table-wrap {
      overflow: hidden;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th,
    td {
      padding: 16px 18px;
      text-align: left;
      vertical-align: top;
      border-bottom: 1px solid var(--gray-100);
    }
    th {
      background: var(--gray-50);
      color: var(--gray-700);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    td small {
      display: block;
      color: var(--gray-500);
      margin-top: 4px;
    }
    .status-chip {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 999px;
      padding: 6px 12px;
      font-size: 0.82rem;
      font-weight: 700;
      text-transform: capitalize;
    }
    .status-pending { background: rgba(245, 158, 11, 0.12); color: #b45309; }
    .status-confirmed { background: rgba(13, 148, 136, 0.12); color: var(--primary-dark); }
    .status-cancelled { background: rgba(220, 38, 38, 0.12); color: var(--accent); }
    .status-done { background: rgba(34, 197, 94, 0.12); color: #15803d; }
    .status-form {
      display: grid;
      gap: 8px;
    }
    .status-form select {
      min-width: 150px;
    }
    .pagination {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 18px;
      flex-wrap: wrap;
    }
    .pagination a,
    .pagination span {
      padding: 10px 14px;
      border-radius: 12px;
      text-decoration: none;
      background: #fff;
      border: 1px solid var(--gray-200);
      color: var(--gray-700);
      font-weight: 700;
    }
    .pagination .active {
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: #fff;
      border-color: transparent;
    }
    .empty {
      padding: 28px;
      color: var(--gray-500);
    }
    @media (max-width: 1023px) {
      .filters {
        grid-template-columns: 1fr;
      }
      .summary,
      .topbar {
        flex-direction: column;
        align-items: flex-start;
      }
      .table-wrap {
        overflow-x: auto;
      }
      table {
        min-width: 960px;
      }
    }
  </style>
</head>
<body>
  <div class="page">
    <header class="topbar">
      <div>
        <h1>Booking Dashboard</h1>
        <p>Welcome, <?= e($_SESSION['admin_username'] ?? 'Admin') ?>. Manage booking requests for Alpha Star Laboratory Clinic.</p>
      </div>
      <a href="logout.php">Log Out</a>
    </header>

    <section class="panel">
      <?php if ($flash !== ''): ?>
        <div class="notice"><?= e($flash) ?></div>
      <?php endif; ?>
      <?php if ($error !== ''): ?>
        <div class="error"><?= e($error) ?></div>
      <?php endif; ?>

      <form method="get" action="">
        <div class="filters">
          <div>
            <label for="status">Status</label>
            <select id="status" name="status">
              <option value="all" <?= $statusFilter === 'all' ? 'selected' : '' ?>>All statuses</option>
              <?php foreach ($allowedStatuses as $status): ?>
                <option value="<?= e($status) ?>" <?= $statusFilter === $status ? 'selected' : '' ?>><?= ucfirst($status) ?></option>
              <?php endforeach; ?>
            </select>
          </div>
          <div>
            <label for="q">Search</label>
            <input id="q" type="text" name="q" value="<?= e($searchQuery) ?>" placeholder="Name, phone, email, or service">
          </div>
          <div class="filter-actions">
            <button type="submit">Apply Filters</button>
            <a href="index.php">Reset</a>
          </div>
        </div>
      </form>
    </section>

    <div class="summary">
      <span>Total bookings: <?= e($total) ?></span>
      <span>Showing page <?= e($page) ?> of <?= e($pages) ?></span>
    </div>

    <section class="table-wrap">
      <?php if ($bookings === [] && $error === ''): ?>
        <div class="empty">No bookings found for the current filters.</div>
      <?php else: ?>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Service</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            <?php foreach ($bookings as $booking): ?>
              <tr>
                <td>#<?= e($booking['id']) ?></td>
                <td>
                  <strong><?= e($booking['full_name']) ?></strong>
                  <?php if (!empty($booking['message'])): ?>
                    <small><?= e($booking['message']) ?></small>
                  <?php endif; ?>
                </td>
                <td><?= e($booking['phone']) ?></td>
                <td><?= e($booking['email'] ?: '—') ?></td>
                <td><?= e($booking['service']) ?></td>
                <td>
                  <span class="status-chip status-<?= e($booking['status']) ?>">
                    <?= e($booking['status']) ?>
                  </span>
                </td>
                <td><?= e(date('M d, Y h:i A', strtotime((string) $booking['created_at']))) ?></td>
                <td>
                  <form class="status-form" method="post" action="">
                    <input type="hidden" name="booking_id" value="<?= e($booking['id']) ?>">
                    <input type="hidden" name="csrf_token" value="<?= e($_SESSION['admin_csrf']) ?>">
                    <input type="hidden" name="redirect_status" value="<?= e($statusFilter) ?>">
                    <input type="hidden" name="redirect_query" value="<?= e($searchQuery) ?>">
                    <input type="hidden" name="redirect_page" value="<?= e($page) ?>">
                    <select name="status">
                      <?php foreach ($allowedStatuses as $status): ?>
                        <option value="<?= e($status) ?>" <?= $booking['status'] === $status ? 'selected' : '' ?>>
                          <?= ucfirst($status) ?>
                        </option>
                      <?php endforeach; ?>
                    </select>
                    <button type="submit">Update</button>
                  </form>
                </td>
              </tr>
            <?php endforeach; ?>
          </tbody>
        </table>
      <?php endif; ?>
    </section>

    <?php if ($pages > 1): ?>
      <nav class="pagination" aria-label="Pagination">
        <?php for ($i = 1; $i <= $pages; $i++): ?>
          <?php
          $query = http_build_query([
              'status' => $statusFilter,
              'q' => $searchQuery,
              'page' => $i,
          ]);
          ?>
          <?php if ($i === $page): ?>
            <span class="active"><?= e($i) ?></span>
          <?php else: ?>
            <a href="index.php?<?= e($query) ?>"><?= e($i) ?></a>
          <?php endif; ?>
        <?php endfor; ?>
      </nav>
    <?php endif; ?>
  </div>
</body>
</html>
