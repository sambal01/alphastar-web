<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once __DIR__ . '/config/db.php';

const HEART_STORAGE_FILE = __DIR__ . '/storage/heart-reactions.json';

function heartResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function cleanVisitorToken(string $value): string
{
    $value = trim($value);
    $value = preg_replace('/[^a-zA-Z0-9_-]/', '', $value) ?? '';
    return substr($value, 0, 64);
}

function ensureHeartTable(PDO $db): void
{
    $db->exec(
        'CREATE TABLE IF NOT EXISTS heart_reactions (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            visitor_token VARCHAR(64) NOT NULL UNIQUE,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
    );
}

function getHeartCount(PDO $db): int
{
    return (int) $db->query('SELECT COUNT(*) FROM heart_reactions')->fetchColumn();
}

function hasLiked(PDO $db, string $visitorToken): bool
{
    if ($visitorToken === '') {
        return false;
    }

    $statement = $db->prepare('SELECT id FROM heart_reactions WHERE visitor_token = :visitor_token LIMIT 1');
    $statement->execute([
        ':visitor_token' => $visitorToken,
    ]);

    return (bool) $statement->fetchColumn();
}

function ensureHeartStorageDirectory(): void
{
    $directory = dirname(HEART_STORAGE_FILE);

    if (!is_dir($directory)) {
        mkdir($directory, 0775, true);
    }
}

function readHeartFileStore(): array
{
    ensureHeartStorageDirectory();

    if (!file_exists(HEART_STORAGE_FILE)) {
        return [
            'tokens' => [],
        ];
    }

    $raw = file_get_contents(HEART_STORAGE_FILE);
    if (!is_string($raw) || trim($raw) === '') {
        return [
            'tokens' => [],
        ];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        return [
            'tokens' => [],
        ];
    }

    $tokens = $decoded['tokens'] ?? [];
    if (!is_array($tokens)) {
        $tokens = [];
    }

    return [
        'tokens' => array_values(array_unique(array_filter(array_map('strval', $tokens)))),
    ];
}

function writeHeartFileStore(array $data): void
{
    ensureHeartStorageDirectory();

    $payload = json_encode([
        'tokens' => array_values(array_unique(array_filter(array_map('strval', $data['tokens'] ?? [])))),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);

    if (!is_string($payload)) {
        throw new RuntimeException('Unable to encode heart storage.');
    }

    file_put_contents(HEART_STORAGE_FILE, $payload, LOCK_EX);
}

function getHeartCountFromFile(): int
{
    $store = readHeartFileStore();
    return count($store['tokens']);
}

function hasLikedInFile(string $visitorToken): bool
{
    if ($visitorToken === '') {
        return false;
    }

    $store = readHeartFileStore();
    return in_array($visitorToken, $store['tokens'], true);
}

function saveHeartInFile(string $visitorToken): bool
{
    $store = readHeartFileStore();
    $alreadyLiked = in_array($visitorToken, $store['tokens'], true);

    if (!$alreadyLiked) {
        $store['tokens'][] = $visitorToken;
        writeHeartFileStore($store);
    }

    return !$alreadyLiked;
}

function heartStorageMode(): string
{
    static $mode = '';

    if ($mode !== '') {
        return $mode;
    }

    try {
        $db = getDB();
        ensureHeartTable($db);
        $mode = 'database';
    } catch (Throwable $error) {
        $mode = 'file';
    }

    return $mode;
}

try {
    $storageMode = heartStorageMode();
} catch (Throwable $error) {
    heartResponse(500, [
        'success' => false,
        'message' => 'Unable to prepare heart reactions.',
    ]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $visitorToken = cleanVisitorToken((string) ($_GET['visitor_token'] ?? ''));

    if ($storageMode === 'file') {
        heartResponse(200, [
            'success' => true,
            'count' => getHeartCountFromFile(),
            'liked' => hasLikedInFile($visitorToken),
            'storage' => 'file',
        ]);
    }

    $db = getDB();
    heartResponse(200, [
        'success' => true,
        'count' => getHeartCount($db),
        'liked' => hasLiked($db, $visitorToken),
        'storage' => 'database',
    ]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    heartResponse(405, [
        'success' => false,
        'message' => 'Method not allowed.',
    ]);
}

$rawBody = file_get_contents('php://input');
$decodedBody = is_string($rawBody) && $rawBody !== '' ? json_decode($rawBody, true) : [];
$requestData = is_array($decodedBody) ? $decodedBody : [];

$visitorToken = cleanVisitorToken((string) ($requestData['visitor_token'] ?? $_POST['visitor_token'] ?? ''));

if (strlen($visitorToken) < 12) {
    heartResponse(422, [
        'success' => false,
        'message' => 'Invalid visitor token.',
    ]);
}

try {
    if ($storageMode === 'file') {
        $inserted = saveHeartInFile($visitorToken);

        heartResponse(200, [
            'success' => true,
            'already_liked' => !$inserted,
            'liked' => true,
            'count' => getHeartCountFromFile(),
            'storage' => 'file',
        ]);
    }

    $db = getDB();
    $alreadyLiked = hasLiked($db, $visitorToken);

    if (!$alreadyLiked) {
        $statement = $db->prepare('INSERT INTO heart_reactions (visitor_token) VALUES (:visitor_token)');
        $statement->execute([
            ':visitor_token' => $visitorToken,
        ]);
    }

    heartResponse(200, [
        'success' => true,
        'already_liked' => $alreadyLiked,
        'liked' => true,
        'count' => getHeartCount($db),
        'storage' => 'database',
    ]);
} catch (Throwable $error) {
    heartResponse(500, [
        'success' => false,
        'message' => 'Unable to save heart reaction.',
    ]);
}
