import io
from datetime import datetime
import pandas as pd

# a map between item metadata in the dynamo table and the corresponding attribute in the datset schema
# key: metadata attribute key
# key_map: schema attribute key
# type: custom function to be applied to the meta attribute for normalization
# level:
#      df: the function will be applied on the entier dataframe column
#      row: the function will be applied on the dataframe attribute row by row
# source_prop: if the source attribute in the dataframe is an object, the name of the attribute
schema_map = [
    { 'key': 'id'              ,'key_map': 'ITEM_ID'            ,'type': 'unguidify'   ,'level': 'df' },
    { 'key': 'postedDate'      ,'key_map': 'CREATION_TIMESTAMP' ,'type': 'timestamp'   ,'level': 'df' },
    { 'key': 'cmsUpdateDate'   ,'key_map': 'CMS_UPDATE_DATE'    ,'type': 'timestamp'   ,'level': 'df' },
    { 'key': 'headline'        ,'key_map': 'HEADLINE'           ,'type': 'string'      ,'level': 'df' },
    { 'key': 'type'            ,'key_map': 'TYPE'               ,'type': 'string'      ,'level': 'df' },
    { 'key': 'topics'          ,'key_map': 'TOPICS'             ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'channel'         ,'key_map': 'CHANNEL'            ,'type': 'string'      ,'level': 'df' },
    { 'key': 'channels'        ,'key_map': 'CHANNELS'           ,'type': 'categorical' ,'level': 'row', 'source_prop': 'productCode' },
    { 'key': 'agencies'        ,'key_map': 'AGENCIES'           ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'tradeBloc'       ,'key_map': 'TRADE_BLOC'         ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'locations'       ,'key_map': 'LOCATIONS'          ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'companies'       ,'key_map': 'COMPANIES'          ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'tribunals'       ,'key_map': 'TRIBUNALS'          ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'industries'      ,'key_map': 'INDUSTRIES'         ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'federalStatutes' ,'key_map': 'FEDERAL_STATUTES'   ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'service'         ,'key_map': 'SERVICE'            ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'reporters'       ,'key_map': 'REPORTERS'          ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
    { 'key': 'contributors'    ,'key_map': 'CONTRIBUTORS'       ,'type': 'categorical' ,'level': 'row', 'source_prop': 'name'},
]

def get_map(key):
    return next((x for x in schema_map if x['key'] == key), None)

def unguidify(df_col):
    return df_col.str.replace('-','')

def categorical(categories, prop_name):
    if isinstance(categories, list):
        formatted = ''
        for category in categories:
            formatted += category[prop_name] + '|'

        formatted = formatted[0 : 1000]
        formatted = formatted[0 : formatted.rfind('|')]
        return formatted
    else:
        return categories[prop_name]

def timestamp(df_col):
    return (pd.to_datetime(df_col).astype('int64')//1e9).astype(int)

map_switcher = {
    'categorical': categorical,
    'timestamp': timestamp,
    'unguidify': unguidify
}
 
def formatValue(key, prop_name, value, processor):
    if value is None or len(value) == 0:
        return 'null'
    else:      
        for line in value:
            return processor(value, prop_name)

def has_attribute(ds_schema, attribute):
    schema_attribute = next((x for x in ds_schema if x['name'] == attribute), None)
    if schema_attribute is None:
        return False
    return True

def to_dataset_schema(items, ds_schema, include_headers = True):
    df = pd.DataFrame.from_dict(items)

    for col_key in df.columns: 
        col_map = get_map(col_key)

        if has_attribute(ds_schema, col_map['key_map']) == False:
            del df[col_key]
            continue

        processor = map_switcher.get(col_map['type'], None)
        if processor == None:
            df[col_map['key_map']] = df[col_key]
            del df[col_key]
            continue

        if col_map['level'] == 'df':
            df[col_map['key_map']] = processor(df[col_key])
        else:
            df[col_map['key_map']] = pd.DataFrame([formatValue(col_key, col_map['source_prop'], line, processor) for line in df[col_key]])
        
        del df[col_key]

    s_buf = io.StringIO()
    df.to_csv(s_buf, index = False, header = include_headers)
    return s_buf.getvalue()

def snake_to_camel(word):
    return ''.join(x.lower() if index == 0 else x.capitalize() or '_' for index, x in enumerate(word.split('_')))

# map items from the dynamo table to dataset schema
# include_headers: include the attributes names as headers in the results csv file
def to_dataset_items_schema(items, ds_schema, include_headers = True):
    df = pd.DataFrame.from_dict(items)

    for col_key in df.columns: 
        col_map = get_map(col_key)

        if has_attribute(ds_schema, col_map['key_map']) == False:
            del df[col_key]
            continue

        df_key = snake_to_camel(col_map['key_map'])
        
        processor = map_switcher.get(col_map['type'], None)
        if processor == None:
            df[df_key] = df[col_key]
            if df_key != col_key:
                del df[col_key]
            continue

        if col_map['level'] == 'df':
            df[df_key] = processor(df[col_key])
        else:
            df[df_key] = pd.DataFrame([formatValue(col_key, col_map['source_prop'], line, processor) for line in df[col_key]])
        
        if df_key != col_key:
            del df[col_key]

    return df