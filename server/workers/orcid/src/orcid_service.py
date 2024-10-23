import logging
import json
import pandas as pd
import uuid
from common.decorators import error_logging_aspect
import numpy as np
from pyorcid import Orcid, errors as pyorcid_errors
from pyorcid.orcid_authentication import OrcidAuthentication
from typing import Tuple
from common.utils import get_key, get_nested_value
from repositories.author_info import AuthorInfoRepository
from repositories.works import WorksRepository
from redis import StrictRedis
from typing import Dict, List, Union
from model import AuthorInfo, SuccessResult, ErrorResult
from dataclasses import asdict

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
        sandbox: bool,
        redis_store: StrictRedis,
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
    def execute_search(self, params: Dict[str, str]) -> Union[SuccessResult, ErrorResult]:
        try:
            orcid_id = params.get("orcid")
            if not orcid_id:
                raise ValueError("ORCID ID is required.")
            orcid = self._initialize_orcid(orcid_id)
            author_info, metadata = self._retrieve_author_info_and_metadata(orcid)

            if metadata.empty:
                return self._handle_insufficient_results(params, orcid_id)
            
            metadata = self._process_metadata(metadata, author_info, params)

            self.logger.debug('metadata processed inside of _process_metadata')
            
            return self._format_response(data=metadata, author_info=author_info, params=params)
        except (
            pyorcid_errors.Forbidden,
            pyorcid_errors.NotFound,
            pyorcid_errors.BadRequest,
        ) as e:
            return self._handle_error(params, "invalid orcid id", e)
        except (pyorcid_errors.Unauthorized, Exception) as e:
            return self._handle_error(params, "unexpected data processing error", e)

    def enrich_metadata(self, params: Dict[str, str], metadata: pd.DataFrame) -> pd.DataFrame:
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

        self.logger.debug(f"Enriching metadata for ORCID {params.get('orcid')}")
        
        request_id = str(uuid.uuid4())
        task_data = {
            "id": request_id,
            "params": params,
            "metadata": metadata.to_json(orient="records"),
        }
        
        self.redis_store.rpush("metrics", json.dumps(task_data))
        result = get_key(self.redis_store, request_id, 300)
        
        metadata = pd.DataFrame(result["input_data"])
        
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
    
    def enrich_metadata_with_base(self, params: Dict[str, str], metadata: pd.DataFrame) -> pd.DataFrame:
        self.logger.debug(f"Enriching metadata with base for ORCID {params.get('orcid')}")
        # TODO: as not all metadata should be enriched with base, we should add some filtering here
        # base enrichment should be used only for cases when the following data is missing oa_state
            # subject_cleaned
            # paper_abstract
            # link
        # when 

        

        raw_dois = metadata["doi"].tolist()

        dois = [doi for doi in raw_dois if doi]

        batch_size = 25

        batches = [dois[i:i + batch_size] for i in range(0, len(dois), batch_size)]

        base_metadata = pd.DataFrame()

        for batch in batches:
            q_advanced = " OR ".join([f"dcdoi:{doi}" for doi in batch if doi])

            request_id = str(uuid.uuid4())

            task_data = {
                # https://dev.openknowledgemaps.org/visconnect-prototype/search?type=get&service=base&sorting=most-relevant&document_types%5B%5D=121&lang_id%5B%5D=all-lang&min_descsize=300&vis_type=timeline&q_advanced=(10.5281%2FZENODO.1196397)
                # q_advanced: (dcdoi:ddd OR dcdoi:ddd OR dcdoi:ddd)
                # 10.5281/ZENODO.1196397
                
                "id": request_id,
                "params": {
                    "q_advanced": q_advanced,
                    "raw": True,
                    'language': 'english', 
                    'time_range': 'any-time', 
                    'sorting': 'most-relevant', 
                    'document_types': ['4', '11', '111', '13', '16', '7', '5', '12', '121', '122', '17', '19', '3', '52', '2', 'F', '1A', '14', '15', '6', '51', '1', '18', '181', '183', '182'], 
                    'min_descsize': '0', 
                    'from': '1665-01-01', 
                    'to': '2024-10-21', 
                    'q': '', 
                    'today': '2024-10-21', 
                    'unique_id': 'abf2625e2d84eb4367fb443e2cb6f4a1', 
                    'service': 'base', 
                    'embed': 'false', 
                    'vis_id': 'abf2625e2d84eb4367fb443e2cb6f4a1', 
                    'limit': 120, 
                    'list_size': 100
                },
                "endpoint": "search"
            }

            self.redis_store.rpush("base", json.dumps(task_data))
            result = get_key(self.redis_store, request_id, 300)

            self.logger.debug(f"Result from base: {result}")

            base_response: str = get_nested_value(result, ["input_data", "metadata"], '[]') # type: ignore

            base_metadata = pd.concat([
                base_metadata, 
                pd.DataFrame(json.loads(base_response)        )
            ], ignore_index=True)

        print(base_metadata.columns)    
        
        return metadata

    def enrich_author_info(self, author_info: AuthorInfo, metadata: pd.DataFrame, params: Dict[str, str]) -> AuthorInfo:
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
        author_info.total_citations = int(
            metadata["citation_count"].astype(float).sum()
        )

        # Total unique social media mentions
        author_info.total_unique_social_media_mentions = int(
            metadata["cited_by_accounts_count"].astype(float).sum()
        )

        # Total NEPPR (non-academic references)
        author_info.total_neppr = int(
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
        citation_counts: List[float] = (
            metadata["citation_count"].astype(float).sort_values(ascending=False).tolist()
        )


        # Calculate h-index
        h_index = 0
        for i, citation in enumerate(citation_counts, start=1):
            if citation >= i:
                h_index = i
            else:
                break

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

        academic_age = author_info.academic_age
        if (academic_age is not None):
            academic_age_offset = params.get("academic_age_offset")
            if academic_age_offset:
                academic_age += int(academic_age_offset)
        author_info.academic_age = academic_age

        # Calculate normalized h-index
        author_info.normalized_h_index = (
            h_index / academic_age if academic_age and academic_age > 0 else None
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
    
    def _retrieve_author_info_and_metadata(self, orcid: Orcid) -> Tuple[AuthorInfo, pd.DataFrame]:
        author_info = AuthorInfoRepository(orcid).extract_author_info()
        metadata = WorksRepository(orcid).get_full_works_metadata()

        return author_info, metadata

    def _process_metadata(self, metadata: pd.DataFrame, author_info: AuthorInfo, params: Dict[str, str]) -> pd.DataFrame:
        metadata["authors"] = metadata["authors"].replace("", author_info.author_name)
        metadata = self.enrich_metadata(params, metadata)
        metadata = self.enrich_metadata_with_base(params, metadata)
        self.logger.debug(f"Enriching author info for ORCID {params.get('orcid')}")
        author_info = self.enrich_author_info(author_info, metadata, params)
        limit = params.get("limit", '200')
        metadata = metadata.head(int(limit))
        return metadata

    def _format_response(self, data: pd.DataFrame, author_info: AuthorInfo, params: Dict[str, str]) -> SuccessResult:
        self.logger.debug(f"Formatting response for ORCID {params.get('orcid')}")
        desired_columns = ["title", "paper_abstract", "subtitle", "published_in", "authors"]

        # Filter the columns to only those that exist in the DataFrame
        existing_columns = [col for col in desired_columns if col in data.columns]

        # Proceed with the concatenation using only the existing columns
        text = pd.concat(
            [
                data.id,
                data[existing_columns]  # Use only the existing columns
                .fillna('')  # Replace NaN values with an empty string
                .apply(lambda x: " ".join(x.astype(str)), axis=1)  # Ensure all elements are strings before joining
            ],
            axis=1
        )
        text.columns = ["id", "content"]

        self.logger.debug(f"Returning response for ORCID {params.get('orcid')} len {len(data)}")

        return {
            'status': 'success',
            'data': {
                "input_data": {
                    "metadata": data.to_json(orient='records'),
                    "text": text.to_json(orient='records')
                },
                "author": asdict(author_info),
                "params": params
            },
        }

    def _handle_insufficient_results(self, params: Dict[str, str], orcid_id: str) -> ErrorResult:
        self.logger.debug(f"ORCID {orcid_id} has no works metadata. Params: {params}")
        return {
            "status": "error",
            "reason": ["not enough results for orcid"],
        }

    def _handle_error(self, params: Dict[str, str], reason: str, exception: Exception) -> ErrorResult:
        self.logger.error(f"Error processing ORCID: {exception}. Params: {params}")
        return {"status": "error", "reason": [reason]}