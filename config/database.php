<?php
// config/database.php - Koneksi Database MySQL SMK TI Bali Global Badung CBT
date_default_timezone_set('Asia/Makassar'); // WITA (Bali / Badung UTC+8)

class Database {
    private static $host = '127.0.0.1';
    private static $port = '3306';
    private static $db_name = 'smkti_cbt_db';
    private static $username = 'root';
    private static $password = '';
    private static $conn = null;

    public static function getConnection() {
        if (self::$conn === null) {
            try {
                $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";dbname=" . self::$db_name . ";charset=utf8mb4";
                self::$conn = new PDO($dsn, self::$username, self::$password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]);
            } catch (PDOException $e) {
                // Return null if database hasn't been created yet so setup script can run
                return null;
            }
        }
        return self::$conn;
    }

    public static function getRootConnection() {
        // Koneksi ke MySQL server tanpa memilih database (untuk instalasi / migration)
        try {
            $dsn = "mysql:host=" . self::$host . ";port=" . self::$port . ";charset=utf8mb4";
            return new PDO($dsn, self::$username, self::$password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);
        } catch (PDOException $e) {
            die("Koneksi MySQL Laragon gagal: " . $e->getMessage());
        }
    }

    public static function getDbName() {
        return self::$db_name;
    }
}
