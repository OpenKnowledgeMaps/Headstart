<?php

namespace headstart\tests;

require_once("autoload.inc.php"); // use some autoloading script that was already present

use headstart\persistence\Persistence;
use PHPUnit\Framework\TestCase;


class DispatchingPersistenceTest extends TestCase
{

    public function testCreateVisualizationDispatcherToOldPersistence(): void
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $oldPersistence->expects($this->once())
            ->method('createVisualization')
            ->with(
                $this->equalTo("test"),
                $this->equalTo("test"),
                $this->equalTo("test")
            );
        $newPersistence->expects($this->once())
            ->method('createVisualization')
            ->with(
                $this->equalTo("test"),
                $this->equalTo("test"),
                $this->equalTo("test")
            );
        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 0.5);
        $dispatcherPersistence->createVisualization("test", "test", "test");
    }

}



