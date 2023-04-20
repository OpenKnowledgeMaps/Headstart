# Contributing Guidelines
Thank you for considering contributing to this repository. We appreciate your effort in making this a better resource for everyone.

## How to Contribute
Contributors are welcome to provide additional data to the Tome.gg map. To add a new entry, please follow these steps:

### Fork this repository
Create a new branch: git checkout -b new-entry
Add your entry in the following format:

```json
{
  "id": "unique-id",
  "relation": "",
  "identifier": "url",
  "title": "title",
  "paper_abstract": "abstract",
  "published_in": "reference type",
  "year": "year of publication",
  "subject_orig": "keywords",
  "subject": "keywords",
  "authors": "author(s)",
  "link": "url",
  "oa_state": "open access status",
  "url": "url",
  "relevance": "relevance score",
  "lang_detected": "language detected",
  "x": "x coordinate",
  "y": "y coordinate",
  "cluster_labels": "cluster labels",
  "area_uri": "area URI",
  "area": "area",
  "resulttype": "result type"
}
```

Make sure you fill in all the fields correctly.
Submit a pull request to the main branch of this repository.

### Entry Details
To add a new entry, you must provide the following details:

1. URL: The URL of the resource you want to add.
2. Title: The title of the resource.
3. Abstract or summary: A brief summary or abstract of the resource.
4. Year of publication: The year the resource was published.
5. Author: The author(s) of the resource.
6. Keywords: The keywords that describe the resource.
7. Cluster labels: The labels that describe the cluster(s) the resource belongs to.
8. Area: The area or topic the resource belongs to.
9. Reference type (result type): The type of the resource (e.g., book, article, report, etc.).

## Code of Conduct
We expect contributors to follow our Code of Conduct in all interactions with the community.

## License
By contributing to this repository, you agree that your contributions will be licensed under the MIT License.