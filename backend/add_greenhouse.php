<?php
session_start();
header("Content-Type: application/json");

require_once "config.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($_SESSION["user_id"])) {
    echo json_encode([
        "success" => false,
        "message" => "User not connected"
    ]);
    exit;
}

$name = trim($data["name"] ?? "");
$length_m = $data["length_m"] ?? null;
$width_m = $data["width_m"] ?? null;
$height_m = $data["height_m"] ?? null;
$orientation = trim($data["orientation"] ?? "");

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
    INSERT INTO greenhouses
    (user_id, name, length_m, width_m, height_m, orientation)
    VALUES 
    (:user_id, :name, :length_m, :width_m, :height_m, :orientation)
");

$stmt->execute([
    ":user_id" => $_SESSION["user_id"],
    ":name" => $name,
    ":length_m" => $length_m ?: null,
    ":width_m" => $width_m ?: null,
    ":height_m" => $height_m ?: null,
    ":orientation" => $orientation ?: null,
]);

echo json_encode([
    "success" => true,
    "message" => "Greenhouse added"
]);