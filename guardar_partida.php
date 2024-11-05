<?php
try {
    // Configuración de la conexión a la base de datos
    $dsn = "mysql:host=localhost;dbname=torres_database;port=3307"; // Cambia el puerto si es necesario
    $username = "root";
    $password = "lkqaz923";

    // Crear conexión PDO
    $conn = new PDO($dsn, $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    // Validar datos recibidos
    if (isset($_POST['username'], $_POST['diskCount'], $_POST['time'])) {
        $username = $_POST['username'];
        $diskCount = $_POST['diskCount'];
        $time = $_POST['time'];
        $dateRegister = date("Y-m-d H:i:s"); // Fecha y hora actual

        // Insertar el registro en la base de datos
        $sql = "INSERT INTO plays (username, diskCount, time, dateRegister) VALUES (:username, :diskCount, :time, :dateRegister)";
        $stmt = $conn->prepare($sql);

        // Ejecutar la consulta con parámetros seguros
        $stmt->execute([
            ':username' => $username,
            ':diskCount' => $diskCount,
            ':time' => $time,
            ':dateRegister' => $dateRegister
        ]);

        echo "Registro guardado exitosamente";
    } else {
        echo "Error: Datos incompletos";
    }
} catch (PDOException $e) {
    echo "Error al guardar el registro: " . $e->getMessage();
}
?>
