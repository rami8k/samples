import os
import time
import requests
import json

class Items:
    def __init__(self):
        # todo: example of graphql query to pull articles(items), delete if not used
        self.items_query = "query($startCmsUpdateDate: String!, $offset: Int) { articles(startCmsUpdateDate: $startCmsUpdateDate, limit: 100, offset: $offset) { count items { id type channel { private } cmsUpdateDate postedDate type headline agencies { name } federalStatutes { name } tradeBloc { name } locations { name } companies { name } tribunals { name } industries { name } service { name } reporters { name } contributors { name } topics { name } channels { name productCode } } } }"

    # calls datasource api
    # todo: modify parameters and implementation to work with your needs
    # this example calls a graphql endpoint to pull articles(items)
    def __datasource_query(self, query, variables=None):
        headers = {
            'Content-Type': 'application/json',
			'Accept': 'application/json'
        }

        response = requests.post(
            os.getenv('ITEMS_API_URL'),
            headers = headers,
            json = { 'query' : query, 'variables': variables }
        )

        try:
            response.raise_for_status()
            return response.json()['data']
        except (requests.HTTPError, json.JSONDecodeError) as error:
            raise ItemsError(error)

    # get items that has been added after a certain date(the previous pull date)
    # pulls items in batchs to reduce load on the data source, sleeps for 2 sec between pulls
    def get_items(self, pull_date):
        offset = 0
        tempItems = self.__datasource_query(self.items_query, { 'startCmsUpdateDate': pull_date, 'offset': offset })['articles']['items']
        items = tempItems

        while len(tempItems) > 0:
            offset += 100
            tempItems = self.__datasource_query(self.items_query, { 'startCmsUpdateDate': pull_date, 'offset': offset })['articles']['items']
            items.extend(tempItems)

            time.sleep(2)

        return items

class ItemsError(Exception):
    """Wrapper for errors that occur within this module
    
    Since errors can occur from multiple sources within this module,
    wrap the errors so callers don't need to be aware of implementation

    Attributes:
        error: The original error
    """
    def __init__(self, error):
        self.error = error

    def __getattr__(self, name):
        """Forward unknown calls to wrapped error, helpful for str()"""
        return getattr(self.error, name)
