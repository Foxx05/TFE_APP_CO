<?php
session_start();
header("Content-Type: application/json");

require_once __DIR__ . "/config.php";

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "User not connected"
    ]);
    exit;
}

$greenhouse_id = $_GET["greenhouse_id"] ?? null;

if (!$greenhouse_id) {
    echo json_encode([
        "success" => false,
        "message" => "Missing greenhouse id"
    ]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT greenhouse_id, name, length_m, width_m, height_m, orientation
    FROM greenhouses
    WHERE greenhouse_id = :greenhouse_id
    AND user_id = :user_id
    LIMIT 1
");

$stmt->execute([
    ":greenhouse_id" => $greenhouse_id,
    ":user_id" => $_SESSION["user_id"]
]);

$greenhouse = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$greenhouse) {
    echo json_encode([
        "success" => false,
        "message" => "Greenhouse not found"
    ]);
    exit;
}

echo json_encode([
    "success" => true,
    "greenhouse" => $greenhouse
]);