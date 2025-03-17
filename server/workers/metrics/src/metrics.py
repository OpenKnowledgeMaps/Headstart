import time
import json
import subprocess
import logging
from common.r_wrapper import RWrapper
from common.decorators import error_logging_aspect
from common.rate_limiter import RateLimiter

formatter = logging.Formatter(
    fmt='%(asctime)s %(levelname)-8s %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)


class MetricsClient(RWrapper):
    SEPARATION_TIME = 1.5  # Separation time for rate limiting in seconds

    def __init__(self, *args):
        super().__init__(*args)
        self.rate_key = 'metrics-ratelimit'
        self.rate_limiter = RateLimiter(
            self.redis_store, 
            self.rate_key, 
            self.SEPARATION_TIME
        )

    def next_item(self):
        queue, msg = self.redis_store.blpop("metrics")
        msg = json.loads(msg.decode('utf-8'))
        item_id = msg.get('id')
        params = self.add_default_params(msg.get('params'))
        metadata = msg.get('metadata')
        return item_id, params, metadata

    @error_logging_aspect(log_level=logging.ERROR)
    def execute_search(self, params: dict, metadata: str) -> dict:
        self.logger.debug(f"execute_search function running in metrics.py")

        command = [
            self.command,
            self.runner,
            self.wd,
            params.get('q'),
            params.get('service')
        ]

        data = {
            "params": params,
            "metadata": metadata
        }

        try:
            proc = subprocess.Popen(
                command, 
                stdin=subprocess.PIPE, 
                stdout=subprocess.PIPE, 
                stderr=subprocess.PIPE,
                encoding='utf-8'
            )
            stdout, stderr = proc.communicate(json.dumps(data))

            # TODO: Remove after development
            self.logger.debug(f"Raw stdout: {stdout}")
            self.logger.debug(f"Raw stderr: {stderr}")

            output = [line for line in stdout.split('\n') if line]
            errors = [line for line in stderr.split('\n') if line]

            # TODO: Remove after development
            if not output:
                raise ValueError("No output received from the subprocess")
            if len(output) < 2:
                raise ValueError(f"Unexpected output format: {output}")

            if not output:
                raise ValueError("No output received from the subprocess")

            raw_metadata = json.loads(output[-2])

            self.logger.debug(f"Raw metadata: {raw_metadata}")

            if isinstance(raw_metadata, dict) and raw_metadata.get('status') == "error":
                return raw_metadata

            return {
                "input_data": raw_metadata,
                "params": params
            }

        except Exception as e:
            self.logger.error(f"Error during command execution: {e}")
            if errors:
                self.logger.error(f"Stderr: {errors}")
            raise

    @error_logging_aspect(log_level=logging.ERROR)
    def run(self):
        while True:
            while self.rate_limiter.rate_limit_reached():
                self.logger.debug('🛑 Request is limited')
                time.sleep(0.1)
                continue

            item_id, params, metadata = self.next_item()
            self.logger.debug(f"Processing item: {item_id}")
            self.logger.debug(f"Params: {params}")

            try:
                result = self.execute_search(params, metadata)
                result["id"] = item_id

                output_key = f"{item_id}_output"
                self.logger.debug(f"Storing result in key: {output_key}")
                self.logger.debug(f"Result: {result}")
                self.redis_store.set(output_key, json.dumps(result))

            except Exception as e:
                self.logger.exception("Exception during metrics enrichment.")
                self.logger.error(f"Params: {params}")
                self.logger.error(f"Error: {e}")