import logging
import json
import pandas as pd
import os
import uuid
from common.decorators import error_logging_aspect
import numpy as np
from pyorcid import Orcid, errors as pyorcid_errors
from pyorcid.orcid_authentication import OrcidAuthentication
from typing import Tuple
from common.utils import get_key, get_nested_value, enrich_metadata
from repositories.author_info import AuthorInfoRepository
from repositories.works import WorksRepository
from redis import StrictRedis
from typing import Dict, List, Union
from model import AuthorInfo, SuccessResult, ErrorResult
from dataclasses import asdict
import time

def remove_doi_prefix(doi):
    if pd.isna(doi) or doi == '':  # Handle NaN, None, or empty strings
        return np.nan
    return doi.replace('https://dx.doi.org/', '').replace('https://doi.org/', '')

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


    def log_dataframe(self, df: pd.DataFrame, params: Dict[str, str], name: str, ):
        orcid = params.get('orcid')
        
        columns_to_print = ['id', 'title', 'doi', 'paper_abstract', 'link', 'subject', 'subject_orig', 'oa_state']

        transformed = df.copy().reindex(columns=columns_to_print)
        
        transformed = transformed.fillna(value='missing')
        
        # create folder
        folder = f'./output/{orcid}'
        if not os.path.exists(folder):
            os.makedirs(folder)
        file_path = f"{folder}/{name}.csv"
        transformed.sort_values(by='doi', ascending=True).to_csv(file_path, index=False)

    def request_base_metadata(self, dois: List[str], params: Dict[str, str]) -> pd.DataFrame:
        orcid = params.get('orcid')
        
        batch_size = 25
        batches = [dois[i:i + batch_size] for i in range(0, len(dois), batch_size)]
        base_metadata = pd.DataFrame(dtype=object)

        timing_data = []

        for batch in batches:
            start_time = time.time()
            q_advanced = " OR ".join([f"dcdoi:{doi}" for doi in batch if doi])

            request_id = str(uuid.uuid4())

            task_data = {
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
                    # ? is that a good idea to pass here empty query?
                    'q': '', 
                    'today': '2024-10-21', 
                    'unique_id': 'abf2625e2d84eb4367fb443e2cb6f4a1', 
                    'service': 'base', 
                    'embed': 'false', 
                    'vis_id': 'abf2625e2d84eb4367fb443e2cb6f4a1', 
                    'limit': 120, 
                    'list_size': 100,
                    'deduplicate_base': 'false'
                },
                "endpoint": "search"
            }
            
            self.redis_store.rpush("base", json.dumps(task_data))
            result = get_key(self.redis_store, request_id, 600)
            
            end_time = time.time()
            duration = end_time - start_time
            timing_data.append({
                "request_id": request_id,
                "batch_size": len(batch),
                "duration": duration,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(start_time))
            })

            base_response: str = get_nested_value(result, ["input_data", "metadata"], '[]') # type: ignore

            base_metadata = pd.concat([
                base_metadata, 
                pd.DataFrame(json.loads(base_response)        )
            ], ignore_index=True)

        timing_df = pd.DataFrame(timing_data)
        folder = f'./output/{orcid}'
        if not os.path.exists(folder):
            os.makedirs(folder)
        timing_df.to_csv(f'{folder}/stat_base_requests.csv', index=False)

        return base_metadata
    
    def enrich_metadata_with_base(self, params: Dict[str, str], metadata: pd.DataFrame) -> pd.DataFrame:
        self.logger.debug(f"Enriching metadata with base for ORCID {params.get('orcid')}")
        
        original_columns = metadata.columns.to_list()
        required_fields = ['id', 'identifier', 'relevance', 'relation', 'title', 'subtitle', 'doi', 
                       'paper_abstract', 'link', 'subject', 'oa_state', 'subject_orig', 'published_in', 
                       'year', 'authors', 'url', 'resulttype', 'type', 'typenorm', 'lang', 'language', 
                       'content_provider', 'coverage', 'is_duplicate', 'has_dataset', 'sanitized_authors', 
                       'relations', 'annotations', 'repo', 'source', 'volume', 'issue', 'page', 'issn', 
                       'citation_count', 'cited_by_wikipedia_count', 'cited_by_msm_count', 'cited_by_policies_count', 
                       'cited_by_patents_count', 'cited_by_accounts_count', 'cited_by_fbwalls_count',
                        'cited_by_feeds_count',
                        'cited_by_gplus_count',
                        'cited_by_rdts_count',
                        'cited_by_qna_count',
                        'cited_by_tweeters_count',
                        'cited_by_videos_count']
        required_fields = list(set(required_fields + metadata.columns.to_list()))

        self.logger.debug(f'fields to reindex: {required_fields}')
        metadata = metadata.reindex(columns=required_fields)

        self.logger.debug('metadata reindexed')
        
        # TEMPORAL
        #self.log_dataframe(metadata, params, '_original')
        # TEMPORAL

        raw_dois = metadata["doi"].tolist()
        dois = [doi for doi in raw_dois if doi and pd.notna(doi)]

        self.logger.debug(f"Dois to search in base: {dois}")

        base_metadata = self.request_base_metadata(dois, params)
        base_metadata = base_metadata.reindex(columns=required_fields)
        base_metadata.loc[:, 'doi'] = base_metadata['doi'].apply(remove_doi_prefix)

        # Remove rows where 'doi' is pd.NaN
        base_metadata = base_metadata[pd.notna(base_metadata['doi'])]
        base_metadata = base_metadata[base_metadata['doi'].isin(dois)]
        base_metadata = base_metadata.drop_duplicates(subset='doi', keep='first')

        # TEMPORAL
        # self.log_dataframe(base_metadata, params, '_base')
        # TEMPORAL

        # Select and rename relevant fields from base_metadata, including subject_orig
        fields_to_merge = {
            'oa_state': 'oa_state_base', 
            'subject': 'subject_base', 
            'subject_orig': 'subject_orig_base',  # Include subject_orig
            'paper_abstract': 'paper_abstract_base', 
            'link': 'link_base',
            'relation': 'relation_base'
        }

        # Rename base metadata columns to avoid conflicts with original metadata
        base_metadata = base_metadata.rename(columns=fields_to_merge)

        # Merge base metadata into the original metadata
        enriched_metadata = pd.merge(
            metadata,
            base_metadata[['doi'] + list(fields_to_merge.values())],  # Use renamed columns from base_metadata
            on='doi',
            how='left'
        )

        # Custom merging functions
        def custom_merge(existing_value, new_value):
            return existing_value if pd.notnull(existing_value) and existing_value  else new_value

        def custom_merge_link_oa_state(row):
            existing_link, existing_oa_state = row['link'], row['oa_state']
            new_link, new_oa_state = row.get('link_base', None), row.get('oa_state_base', None)
            if pd.isna(existing_link) and pd.notna(new_link):
                return new_link, new_oa_state
            return existing_link, existing_oa_state

        enriched_metadata['paper_abstract'] = enriched_metadata.apply(
            lambda row: custom_merge(row['paper_abstract'], row['paper_abstract_base']), axis=1
        )
        enriched_metadata['subject_orig'] = enriched_metadata.apply(
            lambda row: custom_merge(row['subject_orig'], row['subject_orig_base']), axis=1
        )
        enriched_metadata['subject'] = enriched_metadata.apply(
            lambda row: custom_merge(row['subject'], row['subject_base']), axis=1
        )
        enriched_metadata['relation'] = enriched_metadata.apply(
            lambda row: custom_merge(row['relation'], row['relation_base']), axis=1
        )

        self.logger.debug('assigned some fields')

        # Apply custom logic for link and oa_state and assign results
        link_oa_state_values = enriched_metadata.apply(custom_merge_link_oa_state, axis=1)
        enriched_metadata['link'], enriched_metadata['oa_state'] = zip(*link_oa_state_values)

        enriched_metadata.drop(columns=['paper_abstract_base', 'subject_orig_base', 'subject_base', 'oa_state_base', 'link_base', 'relation_base'], inplace=True)
        
        # TEMPORAL
        #self.log_dataframe(enriched_metadata, params, '_enriched')
        # TEMPORAL

        self.logger.debug(f"Enriched metadata using base for ORCID {params.get('orcid')}: {enriched_metadata[['id', 'link', 'oa_state']].head()}")

        # temporal solution, for some reason if we have some undefined data, dataprocessing is failing
        enriched_metadata = enriched_metadata.reindex(columns=list(set(original_columns + ['oa_state', 'subject', 'subject_orig', 'paper_abstract', 'link', 'relation'])))
        
        return enriched_metadata

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
            metadata[
                [
                    "cited_by_fbwalls_count",
                    "cited_by_feeds_count",
                    "cited_by_gplus_count",
                    "cited_by_rdts_count",
                    "cited_by_qna_count",
                    "cited_by_tweeters_count",
                    "cited_by_videos_count"
                ]
            ].astype(float).sum().sum()
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
        self.logger.debug('citation counts', citation_counts)
        h_index = 0
        for i, citation in enumerate(citation_counts, start=1):
            if citation >= i:
                h_index = i
            else:
                break
        author_info.h_index = h_index

        self.logger.debug(f"h_index after {author_info.h_index}")

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
        if "year" in metadata.columns:
            metadata["publication_year"] = metadata["year"].apply(extract_year)
        else:
            metadata["publication_year"] = None  # Or assign a default value

        self.logger.debug(f"author_info {author_info}")
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
        source_for_metadata_enrichment = "crossref"
        metadata = enrich_metadata(self.redis_store, params, metadata, source_for_metadata_enrichment)
        self.logger.debug(f'metadata shape after base enrichment: {metadata.shape}')
        author_info = self.enrich_author_info(author_info, metadata, params)
        self.logger.debug(f'metadata shape after enrichment: {metadata.shape}')
        limit = params.get("limit", '200')
        metadata = metadata.head(int(limit))
        metadata = self.enrich_metadata_with_base(params, metadata)
        self.logger.debug(f'metadata shape after processing: {metadata.shape}')
        return metadata

    def _format_response(self, data: pd.DataFrame, author_info: AuthorInfo, params: Dict[str, str]) -> SuccessResult:
        self.logger.debug(f"Formatting response for ORCID {params.get('orcid')}")
        desired_columns = ["title", "paper_abstract", "subtitle", "published_in", "authors", "subject_orig"]

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
        self.logger.debug(f"Error processing ORCID: {exception}. Params: {params}")
        self.logger.debug(exception.__traceback__)
        return {"status": "error", "reason": [reason]}