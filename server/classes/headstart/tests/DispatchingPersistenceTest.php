<?php

namespace headstart\tests;

require_once("autoload.inc.php"); // use some autoloading script that was already present

use headstart\persistence\Persistence;
use PHPUnit\Framework\TestCase;

/**
 * @covers \headstart\persistence\DispatchingPersistence
 */
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

    public function testGetRevisionDispatchesToOldPersistence(): void
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $oldPersistence->expects($this->once())
            ->method('getRevision')
            ->with(
                $this->equalTo("vis_id1"),
                $this->equalTo("rev_id1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 0);
        $dispatcherPersistence->getRevision("vis_id1", "rev_id1");
    }

    public function testGetRevisionDispatchesToNewPersistence(): void
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $newPersistence->expects($this->once())
            ->method('getRevision')
            ->with(
                $this->equalTo("vis_id1"),
                $this->equalTo("rev_id1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 1);
        $dispatcherPersistence->getRevision("vis_id1", "rev_id1");
    }

    public function testWriteRevisionDispatchesToOldPersistence(): void
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $oldPersistence->expects($this->once())
            ->method('writeRevision')
            ->with(
                $this->equalTo("vis_id1"),
                $this->equalTo("data1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 0);
        $dispatcherPersistence->writeRevision("vis_id1", "data1");
    }

    public function testWriteRevisionDispatchesToNewPersistence(): void
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $newPersistence->expects($this->once())
            ->method('writeRevision')
            ->with(
                $this->equalTo("vis_id1"),
                $this->equalTo("data1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 1);
        $dispatcherPersistence->writeRevision("vis_id1", "data1");
    }

    public function testExistsVisualizationDispatchesToOldPersistence(): array|bool
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $oldPersistence->expects($this->once())
            ->method('existsVisualization')
            ->with(
                $this->equalTo("vis_id1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 0);
        $result = $dispatcherPersistence->existsVisualization("vis_id1");
        return $result;
    }

    public function testExistsVisualizationDispatchesToNewPersistence(): array|bool
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $newPersistence->expects($this->once())
            ->method('existsVisualization')
            ->with(
                $this->equalTo("vis_id1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 1);
        $result = $dispatcherPersistence->existsVisualization("vis_id1");
        return $result;
    }

    public function testGetLastVersionDispatchesToOldPersistence(): array|bool
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $oldPersistence->expects($this->once())
            ->method('getLastVersion')
            ->with(
                $this->equalTo("vis_id1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 0);
        $result = $dispatcherPersistence->getLastVersion("vis_id1");
        return $result;
    }

    public function testGetLastVersionDispatchesToNewPersistence(): array|bool
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);
        $newPersistence->expects($this->once())
            ->method('getLastVersion')
            ->with(
                $this->equalTo("vis_id1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 1);
        $result = $dispatcherPersistence->getLastVersion("vis_id1");
        return $result;
    }

    public function testGetLatestRevisionsDispatchesToOldPersistence(): array|bool
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);

        $oldPersistence->expects($this->once())
            ->method('getLatestRevisions');

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 0);
        $result = $dispatcherPersistence->getLatestRevisions();
        return $result;
    }

    public function testGetLatestRevisionsDispatchesToNewPersistence(): array|bool
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);

        $newPersistence->expects($this->once())
            ->method('getLatestRevisions');

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 1);
        $result = $dispatcherPersistence->getLatestRevisions();
        return $result;
    }

    public function testGetContextDispatchesToOldPersistence(): array|bool
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);

        $oldPersistence->expects($this->once())
            ->method('getContext')
            ->with(
                $this->equalTo("vis_id1"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 0);
        $result = $dispatcherPersistence->getContext("vis_id1");
        return $result;
    }

    public function testCreateID()
    {
        $oldPersistence = $this->createMock(Persistence::class);
        $newPersistence = $this->createMock(Persistence::class);

        $oldPersistence->expects($this->once())
            ->method('createID')
            ->with(
                $this->equalTo("string_array"),
            );

        $dispatcherPersistence = new \headstart\persistence\DispatchingPersistence($oldPersistence,
            $newPersistence, 0);
        $result = $dispatcherPersistence->createID("string_array");
        return $result;
    }
}





