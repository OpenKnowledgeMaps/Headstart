import logging
import json
from typing import Optional
import pandas as pd
import uuid
from common.decorators import error_logging_aspect
import numpy as np
from pyorcid import Orcid, errors as pyorcid_errors
from pyorcid.orcid_authentication import OrcidAuthentication
from typing import Tuple
from common.utils import get_key
from transform import (
    extract_author_info,
    retrieve_full_works_metadata,
    sanitize_metadata,
)
from redis import StrictRedis

class OrcidService:
    logger = logging.getLogger(__name__)

    def __init__(
        self,
        access_token: str,
        sandbox: bool,
        redis_store: StrictRedis,
    ) -> None:
        self.access_token = access_token
        self.sandbox = sandbox
        self.redis_store = redis_store

    @staticmethod
    def create(
        orcid_client_id: str,
        orcid_client_secret: str,
        sandbox: bool = False,
        redis_store: StrictRedis = None,
    ):
        orcid_auth = OrcidAuthentication(
            client_id=orcid_client_id, client_secret=orcid_client_secret
        )
        access_token = orcid_auth.get_public_access_token()

        return OrcidService(
            access_token=access_token,
            sandbox=sandbox,
            redis_store=redis_store,
        )

    @error_logging_aspect(log_level=logging.ERROR)
    def execute_search(self, params: dict) -> dict:
        try:
            orcid_id = params.get("orcid")
            limit = params.get("limit")
            orcid = self._initialize_orcid(orcid_id)
            author_info, metadata = self._retrieve_author_info_and_metadata(orcid, limit)

            if metadata.empty:
                return self._handle_insufficient_results(params, orcid_id)
            
            metadata = self._process_metadata(metadata, author_info, params)
            
            return self._format_response(data=metadata, author_info=author_info, params=params)
        except (
            pyorcid_errors.Forbidden,
            pyorcid_errors.NotFound,
            pyorcid_errors.BadRequest,
        ) as e:
            return self._handle_error(params, "invalid orcid id", e)
        except (pyorcid_errors.Unauthorized, Exception) as e:
            return self._handle_error(params, "unexpected data processing error", e)

    def enrich_metadata(self, params: dict, metadata: pd.DataFrame) -> pd.DataFrame:
        """
        This function enriches the metadata DataFrame with additional information
        from external sources, in this case crossref and altmetric.
        The function will store the enriched metadata in the Redis queue for further
        processing, from where it will be picked up by the metrics worker.
        Returned data will be the original metadata enriched with additional
        metadata columns from the external sources.

        Parameters:
        - params (dict): The parameters for the search endpoint.
        - metadata (pd.DataFrame): The metadata DataFrame to enrich.

        Returns:
        - pd.DataFrame: The enriched metadata DataFrame.
        """
        request_id = str(uuid.uuid4())
        task_data = {
            "id": request_id,
            "params": params,
            "metadata": metadata.to_json(orient="records"),
        }
        self.redis_store.rpush("metrics", json.dumps(task_data))
        result = get_key(self.redis_store, request_id, 300)
        self.logger.debug(f"Enriched metadata for request {request_id}")
        metadata = pd.DataFrame(json.loads(result["input_data"]))
        for c in [
            "citation_count",
            "cited_by_wikipedia_count",
            "cited_by_msm_count",
            "cited_by_policies_count",
            "cited_by_patents_count",
            "cited_by_accounts_count",
        ]:
            if c not in metadata.columns:
                metadata[c] = np.NaN
        return metadata

    def enrich_author_info(self, author_info: dict, metadata: pd.DataFrame) -> dict:
        """
        This function enriches the author information with additional information.
        Specifically, we extract and aggregate metrics data from the author's works,
        such as citation counts and altmetric counts.

        Parameters:
        - author_info (dict): The author information dictionary.
        - metadata (pd.DataFrame): The metadata DataFrame containing the author's works.

        Returns:
        - dict: The enriched author information dictionary.
        """

        # Total citations
        author_info["total_citations"] = int(
            metadata["citation_count"].astype(float).sum()
        )

        # Total unique social media mentions
        author_info["total_unique_social_media_mentions"] = int(
            metadata["cited_by_accounts_count"].astype(float).sum()
        )

        # Total NEPPR (non-academic references)
        author_info["total_neppr"] = int(
            metadata[
                [
                    "cited_by_wikipedia_count",
                    "cited_by_msm_count",
                    "cited_by_policies_count",
                    "cited_by_patents_count",
                ]
            ]
            .astype(float)
            .sum()
            .sum()
        )

        # Calculate h-index
        citation_counts = (
            metadata["citation_count"].astype(float).sort_values(ascending=False).values
        )
        h_index = np.sum(citation_counts >= np.arange(1, len(citation_counts) + 1))
        author_info["h_index"] = int(h_index)

        def extract_year(value):
            try:
                # Attempt to extract the year assuming various formats
                year_str = str(value)
                if len(year_str) >= 4:
                    return int(year_str[:4])
                return None
            except (ValueError, TypeError):
                return None

        # Apply the function to extract the year
        metadata["publication_year"] = metadata["year"].apply(extract_year)

        # Filter out rows where year could not be extracted
        valid_years = metadata["publication_year"].dropna().astype(int)

        if valid_years.empty:
            # If no valid years are found, set academic age to 0 or some default value
            academic_age = 0
        else:
            # Calculate academic age
            current_year = pd.Timestamp.now().year
            earliest_publication_year = valid_years.min()
            academic_age = current_year - earliest_publication_year

        author_info["academic_age"] = str(academic_age)

        # Calculate normalized h-index
        author_info["normalized_h_index"] = (
            h_index / academic_age if academic_age > 0 else 0
        )

        return author_info
    
    def _initialize_orcid(self, orcid_id: str) -> Orcid:
        self.logger.debug(f"Initializing ORCID {orcid_id} with access token {self.access_token}")
        return Orcid(
            orcid_id=orcid_id,
            orcid_access_token=self.access_token,
            state="public",
            sandbox=self.sandbox,
        )
    
    def _retrieve_author_info_and_metadata(self, orcid: Orcid, limit: Optional[int]) -> Tuple[dict, pd.DataFrame]:
        personal_details = orcid.personal_details()
        author_info = extract_author_info(
            orcid._orcid_id,
            personal_details,
            orcid,
        )
        works_data = pd.DataFrame(orcid.works_full_metadata(limit=limit))
        metadata = retrieve_full_works_metadata(works_data)
        return author_info, metadata

    def _process_metadata(self, metadata: pd.DataFrame, author_info: dict, params: dict) -> pd.DataFrame:
        metadata["authors"] = metadata["authors"].replace("", author_info["author_name"])
        metadata = sanitize_metadata(metadata)
        self.logger.debug(f"sanitized metadata: {metadata}")
        metadata = self.enrich_metadata(params, metadata)
        self.logger.debug(f"enrich metadata: {metadata}")
        author_info = self.enrich_author_info(author_info, metadata)
        self.logger.debug(f"enrich author info: {author_info}")
        metadata = metadata.head(int(params.get("limit")))
        self.logger.debug(f"metadata: {metadata}")
        return metadata

    def _format_response(self, data: pd.DataFrame, author_info: dict, params: dict) -> dict:
        text = pd.concat([data.id, data[["title", "paper_abstract", "subtitle", "published_in", "authors"]]
                        .apply(lambda x: " ".join(x), axis=1)], axis=1)
        text.columns = ["id", "content"]

        response = {
            "input_data": {
                "metadata": data.to_json(orient='records'),
                "text": text.to_json(orient='records')
            },
            "author": author_info,
            "params": params
        }
        return response

    def _handle_insufficient_results(self, params: dict, orcid_id: str) -> dict:
        self.logger.debug(f"ORCID {orcid_id} has no works metadata.")
        return {
            "params": params,
            "status": "error",
            "reason": ["not enough results for orcid"],
        }

    def _handle_error(self, params: dict, reason: str, exception: Exception) -> dict:
        self.logger.error(exception)
        self.logger.error(params)
        return {"params": params, "status": "error", "reason": [reason]}