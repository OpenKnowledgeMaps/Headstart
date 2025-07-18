<?php

namespace headstart\library\tests\functions;

use PHPUnit\Framework\TestCase;
use headstart\library\Toolkit;

require_once __DIR__ . "/../../Toolkit.php";

class ToolkitTest extends TestCase {
    /**
     * Testing method: addOrInitiatlizeArrayKeyNumerical.
     *
     * Tests that a new key is added with a value of 1 when it does not exist in the array.
     */
    public function testThatKeyWillBeAdded(): void {
        $data = [];
        $key = 'key';

        Toolkit::addOrInitiatlizeArrayKeyNumerical($data, $key);

        $this->assertArrayHasKey($key, $data, 'The key should be added to the array.');
        $this->assertSame(1, $data[$key], 'The new key should have a value of 1.');
    }

    /**
     * Testing method: addOrInitiatlizeArrayKeyNumerical.
     *
     * Tests the edge case when key already exists and has 0 value.
     */
    public function testThatKeyCountWillBeIncrementedCorrectlyWhenItIsEqualsToZero(): void {
        $data = ["key" => 0];
        $key = 'key';

        Toolkit::addOrInitiatlizeArrayKeyNumerical($data, $key);

        $this->assertArrayHasKey($key, $data, 'The key should be added to the array.');
        $this->assertSame(1, $data[$key], 'The new key should have a value of 1.');
    }

    /**
     * Testing method: addOrInitiatlizeArrayKeyNumerical.
     *
     * Tests that an existing numerical key's value is incremented by 1.
     */
    public function testThatKeyCountWillBeIncrementedCorrectly(): void {
        $key = 'key';
        $initialValue = 10;
        $data = [$key => $initialValue];

        Toolkit::addOrInitiatlizeArrayKeyNumerical($data, $key);
        $this->assertSame($initialValue + 1, $data[$key], 'The existing key value should be incremented.');
    }

    /**
     * Testing method: addOrInitiatlizeArrayKeyNumerical.
     *
     * Tests the behavior when a key exists but its value is null.
     * `isset()` returns false for null values, so it should be treated as a new key.
     */
    public function testThatFunctionHandlesNullValueAsNew(): void {
        $key = 'key';
        $data = [$key => null];

        Toolkit::addOrInitiatlizeArrayKeyNumerical($data, $key);
        $this->assertSame(1, $data[$key], 'A key with a null value should be re-initialized to 1.');
    }

    /**
     * Testing method: addOrInitiatlizeArrayKeyNumerical.
     *
     * Tests that the function does not affect other keys in the array.
     */
    public function testAddOrInitiatlizeArrayKeyNumericalDoesNotAffectOtherKeys(): void {
        $data = [
            'unrelated_key' => 'some string',
            'another_value' => 123
        ];
        $keyToIncrement = 'key';
        $expectedUnrelatedValue = 'some string';
        $expectedAnotherValue = 123;

        Toolkit::addOrInitiatlizeArrayKeyNumerical($data, $keyToIncrement);

        $this->assertSame(1, $data[$keyToIncrement]);

        $this->assertArrayHasKey('unrelated_key', $data);
        $this->assertSame($expectedUnrelatedValue, $data['unrelated_key']);

        $this->assertArrayHasKey('another_value', $data);
        $this->assertSame($expectedAnotherValue, $data['another_value']);

        $this->assertCount(3, $data);
    }

    /**
     * Testing method: addOrInitiatlizeArrayKey.
     *
     * Tests that a new key and its value will be added in the array.
     */
    public function testThatKeyWithValueWillBeAdded(): void {
        $array = [];
        $key = 'key';
        $value = 'value';

        Toolkit::addOrInitiatlizeArrayKey($array, $key, $value);

        $this->assertArrayHasKey($key, $array, 'The key should be added to the array.');
        $this->assertSame(["value"], $array[$key], 'The new key should have a value of 1.');
    }

    /**
     * Testing method: addOrInitiatlizeArrayKey.
     *
     * Tests that an existing key will be found and its value will be updated.
     */
    public function testAddsValueToExistingKey(): void {
        $array = ['foo' => ['bar']];
        Toolkit::addOrInitiatlizeArrayKey($array, 'foo', 'baz');

        $this->assertEquals(['bar', 'baz'], $array['foo']);
    }

    /**
     * Testing method: addOrInitiatlizeArrayKey.
     *
     * Tests that an existing key will be found and its value will be updated
     * with multiple values.
     */
    public function testAddsMultipleValuesToExistingKey(): void {
        $array = [];
        Toolkit::addOrInitiatlizeArrayKey($array, 'items', 1);
        Toolkit::addOrInitiatlizeArrayKey($array, 'items', 2);
        Toolkit::addOrInitiatlizeArrayKey($array, 'items', 3);

        $this->assertEquals([1, 2, 3], $array['items']);
    }
}