# settings.py
import os
from dotenv import load_dotenv

if(os.getenv('ENV_TYPE') != 'production'):
    load_dotenv()