<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed.',
    ]);
    exit;
}

require_once __DIR__ . '/config/db.php';

function bookingResponse(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload);
    exit;
}

function cleanInput(string $value): string
{
    $value = trim(strip_tags($value));
    return preg_replace('/\s+/', ' ', $value) ?? '';
}

function textLength(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

$allowedServices = [
    'Complete Laboratory',
    'Digital X-Ray',
    'Ultrasound',
    'ECG',
    'Drug Testing',
    'Pre-Employment Medical Exam',
    'Executive Check-Up',
    'General Check-Up',
    'Medical Certificate',
    'Home Service',
    'Other',
];

$fullName = cleanInput((string) ($_POST['name'] ?? ''));
$phone = cleanInput((string) ($_POST['phone'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$service = cleanInput((string) ($_POST['service'] ?? ''));
$message = trim(strip_tags((string) ($_POST['message'] ?? '')));

$errors = [];

if ($fullName === '' || textLength($fullName) > 150) {
    $errors[] = 'Please provide a valid full name.';
}

if ($phone === '' || textLength($phone) > 30 || !preg_match('/^[+\d\s()-]{7,30}$/', $phone)) {
    $errors[] = 'Please provide a valid phone number.';
}

if ($email !== '' && (!filter_var($email, FILTER_VALIDATE_EMAIL) || textLength($email) > 150)) {
    $errors[] = 'Please provide a valid email address.';
}

if ($service === '' || !in_array($service, $allowedServices, true)) {
    $errors[] = 'Please select a valid service.';
}

if ($message !== '' && textLength($message) > 2000) {
    $errors[] = 'Message is too long. Please keep it under 2000 characters.';
}

if ($errors !== []) {
    bookingResponse(422, [
        'success' => false,
        'errors' => $errors,
    ]);
}

try {
    $db = getDB();
    $statement = $db->prepare(
        'INSERT INTO bookings (full_name, phone, email, service, message)
         VALUES (:full_name, :phone, :email, :service, :message)'
    );

    $statement->execute([
        ':full_name' => $fullName,
        ':phone' => $phone,
        ':email' => $email !== '' ? $email : null,
        ':service' => $service,
        ':message' => $message !== '' ? $message : null,
    ]);

    bookingResponse(200, [
        'success' => true,
        'message' => 'Booking submitted successfully.',
        'id' => (int) $db->lastInsertId(),
    ]);
} catch (Throwable $throwable) {
    bookingResponse(500, [
        'success' => false,
        'message' => 'Failed to save booking. Please try again.',
    ]);
}
