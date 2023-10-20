from datetime import datetime, timedelta

def parse_iso(date, in_milliseconds=True):
    format = "%Y-%m-%dT%H:%M:%S{ms}Z".format(ms=".%f" if in_milliseconds else "")

    return datetime.strptime(date, format)

def to_iso(date):
    return "%s:%.3fZ" % (
            date.strftime('%Y-%m-%dT%H:%M'),
            float("%.3f" % (date.second + date.microsecond / 1e6))
        )

def to_timestamp(date):
    return int(date.timestamp())

def in_weekend_range(date, num_of_days):
    in_weekend_range = False

    for i in range(num_of_days + 1):
        in_weekend_range = (date - timedelta(hours = 24 * i)).weekday() >= 5
        
        if in_weekend_range:
            break
    print('in weekend range', in_weekend_range)
    return in_weekend_range
