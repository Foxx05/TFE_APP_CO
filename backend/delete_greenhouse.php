<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/config.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "User not connected"
    ]);
    exit;
}

$greenhouse_id = $data["greenhouse_id"] ?? null;

if (!$greenhouse_id) {
    echo json_encode([
        "success" => false,
        "message" => "Missing greenhouse id"
    ]);
    exit;
}

$stmt = $pdo->prepare("
    DELETE FROM greenhouses
    WHERE greenhouse_id = :greenhouse_id
    AND user_id = :user_id
");

$stmt->execute([
    ":greenhouse_id" => $greenhouse_id,
    ":user_id" => $_SESSION["user_id"]
]);

echo json_encode([
    "success" => true,
    "message" => "Greenhouse deleted"
]);