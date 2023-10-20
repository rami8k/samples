import os
import re
from functools import wraps

def __valid_origin(origin):
    cors_regex = re.compile('https:\/\/([a-z0-9]+[.-])*(mydomain|mydomain)[.]com')

    if cors_regex.match(origin) is None:
        local_regex = re.compile('(http|https):\/\/([a-z0-9]+[.-])*(local){1}[.](mydomain|mydomain)[.]com')
        if local_regex.match(origin) is None:
            return False
        
    return True

# add cors headers to api response
def add_cors_response(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        resp = f(*args, **kwargs)

        origin = None
        event = args[0]
        if "headers" in event and event['headers'] is not None:
            if "Origin" in event["headers"]:
                origin = event["headers"]["Origin"]
            elif "origin" in event["headers"]:
                origin = event["headers"]["origin"]

        if origin is None:
            return resp

        if "headers" not in resp.keys():
            resp["headers"] = {}

        if __valid_origin(origin):
            resp["headers"]["Access-Control-Allow-Origin"] = origin
            resp["headers"]["Access-Control-Allow-Methods"] = "GET, POST"

        return resp

    return wrapper
