import unittest
from unittest.mock import patch, MagicMock, Mock
import json
import pandas as pd
from redis import Redis
from orcid.src.orcid import OrcidWorker
from pyorcid import errors as pyorcid_errors
import requests

class TestOrcidClient(unittest.TestCase):

    def setUp(self):
        self.mock_redis = MagicMock(spec=Redis)
        self.client = OrcidWorker(redis_store=self.mock_redis)

        self.mock_author_info = {
            "author_name": "John Doe",
            "total_citations": 15,
        }
        self.mock_metadata = pd.DataFrame({
            "id": ["123"],
            "authors": [["John Doe"]],
            "title": ["Test Title"], 
            "subtitle": [""],
            "paper_abstract": ["Test abstract"],
            "published_in": ["Test Journal"],
            "year": [2020], 
            "citation_count": [10],
        })

        self.mock_enriched_metadata = pd.DataFrame({
            "id": ["123"],
            "authors": ["John Doe"],
            "title": ["Test Title"], 
            "subtitle": [""],
            "paper_abstract": ["Test abstract"],
            "published_in": ["Test Journal"],
            "year": [2020], 
            "citation_count": [10],
            # after enirchment
            "citation_count": [10],
            "cited_by_wikipedia_count": [2],
            "cited_by_msm_count": [0],
            "cited_by_policies_count": [0],
            "cited_by_patents_count": [1],
            "cited_by_accounts_count": [3],
        })

    # @patch('pyorcid.orcid_authentication.OrcidAuthentication.get_public_access_token')
    # @patch('pyorcid.orcid_authentication.OrcidAuthentication')
    # def test_authenticate(
    #     self, 
    #     mock_orcid_authentication, 
    #     mock_get_public_access_token
    # ):
    #     # Check initial access_token is None
    #     self.assertIsNone(self.client.access_token)

    #     mock_get_public_access_token.return_value = "mock_access_token"

    #     # Create an instance of OrcidClient and call authenticate
    #     client = OrcidClient()
    #     client.authenticate()

    #     # Assert that get_public_access_token was called once
    #     mock_get_public_access_token.assert_called_once()

    #     # Check that the access token was updated correctly
    #     self.assertEqual(client.access_token, 'mock_access_token')

    #     # Ensure OrcidAuthentication was instantiated with the correct parameters
    #     mock_orcid_authentication.assert_called_once_with(
    #         client_id=client.ORCID_CLIENT_ID,
    #         client_secret=client.ORCID_CLIENT_SECRET
    #     )

    def test_next_item(self):
        # Set up the mock Redis to return a mock message
        mock_message = json.dumps({"id": "123", "params": {"orcid": "0000-0002-1825-0097"}, "endpoint": "search"}).encode('utf-8')
        self.mock_redis.blpop.return_value = (None, mock_message)

        item_id, params, endpoint = self.client.next_item()

        self.assertEqual(item_id, "123")
        self.assertEqual(params["orcid"], "0000-0002-1825-0097")
        self.assertEqual(endpoint, "search")

    @patch('orcid.src.orcid.OrcidClient.execute_search')
    def test_handle_search_success(self, mock_execute_search):
        # Set up the mocks
        mock_execute_search.return_value = {"status": "success", "id": "123"}
        mock_params = {"orcid": "0000-0002-1825-0097"}

        self.client.handle_search("123", mock_params)

        # Check that the data was pushed back to the Redis queue
        self.mock_redis.rpush.assert_called_once_with(
            "input_data",
            json.dumps(mock_execute_search.return_value).encode("utf8")
        )

    @patch('orcid.src.orcid.OrcidClient.execute_search')
    def test_handle_search_error(self, mock_execute_search):
        # Simulate an error during search execution
        mock_execute_search.side_effect = Exception("An error occurred")

        mock_params = {"orcid": "0000-0002-1825-0097"}
        with self.assertLogs(self.client.logger, level="ERROR") as log:
            self.client.handle_search("123", mock_params)

            # Check that the logger caught the error
            self.assertIn("Exception during data retrieval.", log.output[0])

    @patch('orcid.src.orcid.OrcidClient._initialize_orcid')  # Adjust the path if necessary
    def test_initialize_orcid_mock(self, mock_initialize_orcid):
        mock_initialize_orcid.return_value = None
        client = OrcidWorker()
        orcid = client._initialize_orcid("some_orcid_id")
        self.assertIsNone(orcid)


    @patch('orcid.src.orcid.OrcidClient._initialize_orcid')
    @patch('orcid.src.orcid.OrcidClient._retrieve_author_info_and_metadata')
    @patch('orcid.src.orcid.OrcidClient._process_metadata')
    def test_execute_search_success(
        self, 
        mock_process_metadata_mock,
        retrieve_author_info_and_metadata_mock,
        mock_initialize_orcid, 
    ):
        mock_initialize_orcid.return_value = None
        retrieve_author_info_and_metadata_mock.return_value = (self.mock_author_info, self.mock_metadata)
        mock_process_metadata_mock.return_value = self.mock_enriched_metadata
        
        params = {"orcid": "0000-0002-1825-0097", "limit": 1}
        client = OrcidWorker()
        result = client.execute_search(params)

        # Assert the returned result structure
        self.assertIn("input_data", result)
        self.assertIn("author", result)
        self.assertEqual(result["author"]["author_name"], "John Doe")
        self.assertEqual(result["author"]["total_citations"], 15)

    @patch('orcid.src.orcid.OrcidClient._handle_error')  # Patch _handle_error directly
    @patch('orcid.src.orcid.OrcidClient._initialize_orcid')  # Patch _initialize_orcid directly
    def test_execute_search_invalid_orcid(self, mock_initialize_orcid: MagicMock, mock_handle_error: MagicMock):
        # Simulate NotFound error when _initialize_orcid is called
        response = requests.Response()
        response.status_code = 404
        mock_initialize_orcid.side_effect = pyorcid_errors.NotFound(response)

        # Prepare the client and the parameters
        client = OrcidWorker()
        params = {"orcid": "invalid-orcid"}

        # Execute the method under test
        client.execute_search(params)

        # Ensure _handle_error is called with the correct parameters
        mock_handle_error.assert_called_once_with(params, "invalid orcid id", mock_initialize_orcid.side_effect)
    def test_enrich_author_info(self):
        mock_author_info = {"author_name": "John Doe"}
        mock_metadata = pd.DataFrame({
            "citation_count": [10, 5],
            "cited_by_wikipedia_count": [2, 1],
            "cited_by_msm_count": [0, 0],
            "cited_by_policies_count": [0, 0],
            "cited_by_patents_count": [1, 1],
            "cited_by_accounts_count": [3, 2],
            "year": [2018, 2020]
        })

        enriched_info = self.client.enrich_author_info(mock_author_info, mock_metadata)

        self.assertEqual(enriched_info["total_citations"], 15)
        self.assertEqual(enriched_info["total_neppr"], 5)
        self.assertEqual(enriched_info["h_index"], 2)
        self.assertEqual(enriched_info["academic_age"], "6")
        self.assertAlmostEqual(enriched_info["normalized_h_index"], 0.3333, places=4)

if __name__ == '__main__':
    unittest.main()