<?php

use PHPUnit\Framework\TestCase;

class DbConnectionTest extends TestCase
{
    protected static $persistence;

    public static function setUpBeforeClass(): void
    {
        require dirname(__FILE__) . '/../persistence/SQLitePersistence.php';

        $db_path = '/app/storage/test.sqlite';
        self::$persistence = new headstart\persistence\SQLitePersistence($db_path);
    }

    public static function tearDownAfterClass(): void
    {
        self::$persistence = null;
    }

    public function testDbConnection(): void
    {
        $vis_id = 'd161dba364a1e8c0468b9c74407e3575';

        $data = self::$persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
//        var_dump($data);
    }

//    old version of connection to db test
//  public function testDbConnectionTest(): void
//  {
//    require dirname(__FILE__) . '/../persistence/SQLitePersistence.php';
//
//    $db_path = '/app/storage/test.sqlite';
//    $persistence = new headstart\persistence\SQLitePersistence($db_path);
//
//    $vis_id = 'd161dba364a1e8c0468b9c74407e3575';
//
//    $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
//    var_dump($data);
////    echo($data);
//  }
}

