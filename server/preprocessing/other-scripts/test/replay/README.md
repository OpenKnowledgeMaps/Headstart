# Replay fixtures for area-title labelling

This directory holds the **replay fixtures** and their **expected outputs** used by
`test/replay_harness.R` and `test/test_replay_modes.R`.

- `<name>.inputs.rds` — a frozen input bundle for `create_cluster_labels`
  (clusters, metadata, type_counts, stops, params, service, …), captured from a
  real map. This is what gets replayed.
- `<name>.expected.rds` — the expected per-cluster labels under **Mode 0**. Created
  automatically the first time `test_replay_modes.R` runs against a new fixture.

The harness replays a fixture offline under a chosen ranking mode, so label output
is deterministic and independent of BASE/PubMed/etc. — this is our fast iteration
loop, **not** a replacement for end-to-end tests.

## Capturing a fixture from a real map

1. Ensure the dataprocessing worker runs with `LOGLEVEL=DEBUG` (it dumps
   `summarize_00_label_inputs.rds` per map under `/headstart/output/<vis_id>/`).
2. Generate the map (BASE / PubMed / ORCID / OpenAIRE) and note its `vis_id`.
3. Copy the bundle out of the container into this directory, naming it by
   integration + topic, e.g.:

   ```sh
   docker cp dev-dataprocessing-1:/headstart/output/<vis_id>/summarize_00_label_inputs.rds \
     server/preprocessing/other-scripts/test/replay/pubmed_cancer.inputs.rds
   ```

4. Run the suite; the first run records the Mode-0 expected output:

   ```sh
   docker exec -w /headstart/other-scripts dev-dataprocessing-1 \
     sh test/run_tests.sh test/test_replay_modes.R
   ```

5. Commit both the `.inputs.rds` and the generated `.expected.rds`.

## Current fixtures

One **generic** and/or one **biomedical** (MeSH-bearing) map per integration. Biomedical maps
are what exercise the specific/generic MeSH split in Modes 2/3.

| fixture | integration | query / id | kind |
|---|---|---|---|
| `base_cancer_research`   | BASE     | `cancer research`     | biomedical |
| `base_digital_education` | BASE     | `digital education`   | generic |
| `pubmed_infection`       | PubMed   | `infection`           | biomedical (MeSH-rich) |
| `orcid_96127791`         | ORCID    | `0000-0001-9612-7791` | biomedical (health records) |
| `orcid_5116955x`         | ORCID    | `0000-0001-5116-955X` | generic (game theory) |
| `openaire_fight_ncov`    | OpenAIRE | `Fight-nCoV` project  | biomedical (COVID) |
