<?php

use PHPUnit\Framework\TestCase;

class DbConnectionTest extends TestCase
{
  public function testDbConnectionTest(): void
  {
    require dirname(__FILE__) . '/../persistence/SQLitePersistence.php';

    $db_path = '/app/storage/test.sqlite';
    $persistence = new headstart\persistence\SQLitePersistence($db_path);

    $vis_id = 'd161dba364a1e8c0468b9c74407e3575';

    $data = $persistence->getLastVersion($vis_id, $details = false, $context = true)[0];
    var_dump($data);
//    echo($data);
  }
}

