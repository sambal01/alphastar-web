<?php
declare(strict_types=1);

session_start();

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION['admin_id'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Unauthorized.',
    ]);
    exit;
}

require_once __DIR__ . '/config/db.php';

$allowedStatuses = ['pending', 'confirmed', 'cancelled', 'done'];
$status = (string) ($_GET['status'] ?? 'all');
$search = trim((string) ($_GET['q'] ?? ''));
$page = max(1, (int) ($_GET['page'] ?? 1));
$limit = 20;

if ($status !== 'all' && !in_array($status, $allowedStatuses, true)) {
    http_response_code(422);
    echo json_encode([
        'success' => false,
        'message' => 'Invalid status filter.',
    ]);
    exit;
}

try {
    $db = getDB();
    $conditions = [];
    $params = [];

    if ($status !== 'all') {
        $conditions[] = 'status = :status';
        $params[':status'] = $status;
    }

    if ($search !== '') {
        $conditions[] = '(full_name LIKE :search OR phone LIKE :search OR email LIKE :search OR service LIKE :search)';
        $params[':search'] = '%' . $search . '%';
    }

    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
    $offset = ($page - 1) * $limit;

    $statement = $db->prepare(
        "SELECT * FROM bookings {$where} ORDER BY created_at DESC LIMIT :limit OFFSET :offset"
    );

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

    echo json_encode([
        'success' => true,
        'bookings' => $bookings,
        'total' => $total,
        'page' => $page,
        'pages' => max(1, (int) ceil($total / $limit)),
    ]);
} catch (Throwable $throwable) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Unable to fetch bookings.',
    ]);
}
