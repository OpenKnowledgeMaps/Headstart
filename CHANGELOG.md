# Changelog

## 2022-07-20

### Changes

- Improved streamgraph so that it works with the BASE data too.
- Improved streamgraph UI (labels, tooltip, axes).
- Improved the citation feature: added more metadata (issue, page, volume, issn).
- Improved the UI in general: customized behavior for non-textual documents.

## 2022-07-14

### Bugfixes

- Fixed a few loopholes in the error handling logic of the backend (PR #672).

## 2022-06-23

### Bugfixes

- Removed the embed=true parameter from the vis citation.
- Making sure the embed=true parameter is only once in the embed modal.

## 2022-05-19

### New features

- The BASE content provider is now displayed in the context line & more info modal.

### Changes

- The new share buttons are now hidden in the embed mode.

## 2022-05-05

### New features

- Added export to BibTex for each paper (frontend interface & backend endpoint).
- Added BASE document type tags with icons.
- New share buttons.

### Changes

- New look and feel (design & CSS changes).

### Security

- Periodical npm security update.

## 2022-03-28

### Changes

- Streamgraph CSS changes: rounded buttons, heading color.
- Default timespan date in GoTriple.

## 2022-03-17

### Deprecations

- Unsupported browser warning is now displayed also in Opera and Edge (the only supported browsers are Chrome, Firefox and Safari).

### Internal

- Refactored remaining old code.

## 2022-03-03

### Security

- Routine npm security update

## 2022-02-17

### Changes

- disabled the cite paper feature in main integration
- enabled the cite paper feature in Triple

## 2022-01-31

### New features

- new citation button & modal generating citations (APA, MLA, Chicago, ACM) for each paper

### Changes

- unified appearance and functionality of copy buttons in modals
- FontAwesome update: new icons; reduced dependency on outer page imports

### Bug fixes

- fixed crashing app when a pdf preview was opened during animation

### Internal

- removed unused local examples; added new local examples (triple, viper, covis)

## 2022-01-20

### New features

- backend data sanitization
- pdfs searchable by the searchbox

### Changes

- data preprocessing refactoring

### Bug fixes

- footer size on narrow screens

### Internal

- test database update

## 2021-12-22

### Changes

- unified HTML & CSS of various paper tags (access tags, dataset tag, custom tags)

## 2021-12-09

### New features

- added abbreviation to list entry items (heading, source, authors)

### Changes

- refactored list entries code
- heading & list UI changes
    - moved info button to the context line
    - moved pdf button
    - minor list changes
- major CSS changes (restyled the whole Headstart)

### Removed

- link buttons from list

## 2021-11-25

### New features

- zooming and selecting papers with browser's back/forward buttons
- adding a zoomed bubble/selected paper name to the page title

### Changes

- improved hot reloading in webpack
- urls of local examples have changed

### Removed

- dead tracking code (Google Analytics, our custom endpoint) and related config parameter
