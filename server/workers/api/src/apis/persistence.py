import os
import json
import uuid
import time
import redis
import asyncio
import aioredis
import pandas as pd

from flask import Blueprint, request, make_response, jsonify, abort, redirect
from flask_restx import Namespace, Resource, fields
from .request_validators import SearchParamSchema
from apis.utils import get_key, detect_error


persistence_ns = Namespace("persistence", description="Persistence API operations redirect")

persistence_uri = "%s:%s" %(os.getenv("PERISTENCE_HOST"),
                             os.getenv("PERISTENCE_PORT"))

@persistence_ns.route('/')
def persistence():
    return redirect(persistence_uri + "/api/persistence")