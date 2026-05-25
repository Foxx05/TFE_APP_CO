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
$name = trim($data["name"] ?? "");
$length_m = $data["length_m"] ?? null;
$width_m = $data["width_m"] ?? null;
$height_m = $data["height_m"] ?? null;
$orientation = trim($data["orientation"] ?? "");

if (!$greenhouse_id) {
    echo json_encode([
        "success" => false,
        "message" => "Missing greenhouse id"
    ]);
    exit;
}

if ($name === "") {
    echo json_encode([
        "success" => false,
        "message" => "Name is required"
    ]);
    exit;
}

if (strlen($name) > 12) {
    echo json_encode([
        "success" => false,
        "message" => "Name must contain maximum 12 characters"
    ]);
    exit;
}

$stmt = $pdo->prepare("
    UPDATE greenhouses
    SET 
        name = :name,
        length_m = :length_m,
        width_m = :width_m,
        height_m = :height_m,
        orientation = :orientation
    WHERE greenhouse_id = :greenhouse_id
    AND user_id = :user_id
");

$stmt->execute([
    ":name" => $name,
    ":length_m" => $length_m ?: null,
    ":width_m" => $width_m ?: null,
    ":height_m" => $height_m ?: null,
    ":orientation" => $orientation ?: null,
    ":greenhouse_id" => $greenhouse_id,
    ":user_id" => $_SESSION["user_id"]
]);

echo json_encode([
    "success" => true,
    "message" => "Greenhouse updated"
]);