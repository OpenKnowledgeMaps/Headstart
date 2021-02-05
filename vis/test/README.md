# Tests

## Running the tests

Run all tests with the command

```
npm test
```

Run a single test file with the command

```
npm test -- <name of the test file>
```

## Structure

All frontend tests can be found in subdirectories of this directory:

- [Component tests](./component/README.md)
- [Store tests](./store/README.md)
- [Snapshot tests](./snapshot/README.md)

In the `data/` folder, all test data are stored ([see more](./data/README.md)).

## Code coverage

The goal is to achieve full (100%) code coverage. That's why the information about the 
coverage is provided in the command `npm test`.

Sometimes it's not possible to test some code (e.g. the hyphenation language modules), it's too
hard (e.g. the legacy code copied from helpers.js) or it simply isn't worth it (e.g. the animations).
In these situations, we didn't write any tests for such code.

Full list of uncovered code (this list may vary and should be updated periodically):

| File | Uncovered lines | Reason |
| ---- | --------------- | ------ |
| BasicListEntries.js | 29-30,34-35,74-80 | code already tested in other list entries |
| ClassificationListEntries.js | 38 | code already tested in other list entries |
| StandardListEntries.js | 120 | code already tested in other list entries |
| Bubble.jsx | 24-38,140-148 | animations - tested manually (would need to mock time) |
| BubbleTitle.jsx | 42,61-103 | copied legacy code - tested manually (would need to mock requestAnimationFrame) |
| Bubble.jsx | 24-38,140-148 | animations - tested manually (would need to mock time) |
| PreviewImage.jsx | 9 | untestable legacy code (request) |
| data.js | 80,172-176,186 | untestable legacy code |
| debounce.js | 13-18 | untestable legacy code |
| force.js | 69-70 | hard to test (would need to change test data) |
| string.js | 51-59,67-74 | untestable legacy code |
| de.js, en.js | 30,29 | untestable legacy code |
