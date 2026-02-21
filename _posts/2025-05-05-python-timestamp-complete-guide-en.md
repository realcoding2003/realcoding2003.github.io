---
layout: post
title: "Python Timestamp Guide - Current Time, Conversion, and Practical Usage"
date: 2025-05-05 14:30:00 +0900
categories: [Development, Python]
tags: [python, timestamp, time, datetime, database, beginner]
author: "Kevin Park"
excerpt: "From getting timestamp values in Python to conversion methods and real project applications. Explained with ready-to-use code examples."
lang: en
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2025/05/05/python-timestamp-complete-guide-en/
---

# Python Timestamp Guide - Current Time, Conversion, and Practical Usage

## 🎯 Core Solutions (Ready to Use)

### Most Commonly Used Patterns

```python
import time

# 1. Get current timestamp (with decimal)
timestamp = time.time()
print(timestamp)
# Output: 1717484200.256982

# 2. Get integer timestamp (most commonly used)
timestamp_int = int(time.time())
print(timestamp_int)
# Output: 1717484200

# 3. Millisecond timestamp (JavaScript compatible)
timestamp_ms = int(time.time() * 1000)
print(timestamp_ms)
# Output: 1717484200256
```

### Frequently Used Conversions in Practice

```python
from datetime import datetime

# 4. Convert datetime to timestamp
dt = datetime.now()
timestamp_from_dt = int(dt.timestamp())

# 5. Convert timestamp to datetime
dt_from_timestamp = datetime.fromtimestamp(timestamp_int)
print(dt_from_timestamp)
# Output: 2025-06-04 14:30:00

# 6. Get timestamp for specific date
specific_date = datetime(2025, 12, 25, 0, 0, 0)
christmas_timestamp = int(specific_date.timestamp())
```

### Database Storage Format

```python
# For DynamoDB, MongoDB etc.
db_timestamp = {
    'created_at': int(time.time()),
    'updated_at': int(time.time())
}

# For MySQL, PostgreSQL etc.
sql_datetime = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
```

---

## 📚 Detailed Explanation

### Background and Necessity

A timestamp is a way to represent a specific point in time as a number, indicating the number of seconds elapsed since January 1, 1970, 00:00:00 UTC. Major situations where timestamps are needed in development:

- **Database Storage**: Recording creation/modification times
- **API Communication**: Time data exchange
- **Log Management**: Tracking event occurrence times
- **Cache Expiration**: Setting TTL (Time To Live)
- **Performance Measurement**: Calculating execution times

### Various Timestamp Generation Methods

#### 1. Using time Module

```python
import time

# Current time timestamp (float)
current_time = time.time()
print(f"Float timestamp: {current_time}")

# Convert to integer (seconds)
int_timestamp = int(current_time)
print(f"Integer timestamp: {int_timestamp}")

# Millisecond unit (JavaScript compatible)
ms_timestamp = int(current_time * 1000)
print(f"Millisecond timestamp: {ms_timestamp}")
```

#### 2. Using datetime Module

```python
from datetime import datetime, timezone

# Current time timestamp
now = datetime.now()
timestamp = int(now.timestamp())

# Convert to UTC time
utc_now = datetime.now(timezone.utc)
utc_timestamp = int(utc_now.timestamp())

# Specific date timestamp
specific_date = datetime(2025, 1, 1, 0, 0, 0)
new_year_timestamp = int(specific_date.timestamp())
```

### Real-World Use Cases

#### 1. DynamoDB TTL Configuration

```python
import time

def create_session_data(user_id, session_data, expire_hours=24):
    """Store session data in DynamoDB (with TTL setting)"""
    ttl = int(time.time()) + (expire_hours * 3600)  # Expires after 24 hours
    
    item = {
        'user_id': user_id,
        'session_data': session_data,
        'created_at': int(time.time()),
        'ttl': ttl  # DynamoDB automatically deletes
    }
    return item

# Usage example
session = create_session_data('user123', {'login': True})
print(session)
```

#### 2. API Log Time Recording

```python
import time
import json

def log_api_request(endpoint, method, response_time):
    """Record API request logs"""
    log_entry = {
        'timestamp': int(time.time()),
        'endpoint': endpoint,
        'method': method,
        'response_time_ms': response_time,
        'date_readable': datetime.fromtimestamp(time.time()).strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Save to log file
    with open('api_logs.json', 'a') as f:
        f.write(json.dumps(log_entry) + '\n')

# Usage example
log_api_request('/api/users', 'GET', 150)
```

#### 3. Performance Measurement

```python
import time

def measure_execution_time(func):
    """Function execution time measurement decorator"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        print(f"{func.__name__} execution time: {execution_time:.4f} seconds")
        return result
    return wrapper

@measure_execution_time
def slow_function():
    time.sleep(2)  # Wait 2 seconds
    return "Complete"

# Usage example
slow_function()
# Output: slow_function execution time: 2.0021 seconds
```

### Timezone Handling and Conversion

```python
from datetime import datetime, timezone
import pytz

# Create UTC timestamp
utc_now = datetime.now(timezone.utc)
utc_timestamp = int(utc_now.timestamp())

# Convert to Korean time
kst = pytz.timezone('Asia/Seoul')
kst_time = datetime.fromtimestamp(utc_timestamp, tz=kst)

# Timestamps for various timezones
timezones = {
    'UTC': timezone.utc,
    'KST': pytz.timezone('Asia/Seoul'),
    'PST': pytz.timezone('US/Pacific'),
    'EST': pytz.timezone('US/Eastern')
}

for tz_name, tz in timezones.items():
    local_time = datetime.now(tz)
    timestamp = int(local_time.timestamp())
    print(f"{tz_name}: {timestamp} ({local_time.strftime('%Y-%m-%d %H:%M:%S %Z')})")
```

### Error Handling and Exception Cases

```python
from datetime import datetime

def safe_timestamp_conversion(date_string, format_string='%Y-%m-%d %H:%M:%S'):
    """Safe conversion of date string to timestamp"""
    try:
        dt = datetime.strptime(date_string, format_string)
        return int(dt.timestamp())
    except ValueError as e:
        print(f"Date format error: {e}")
        return None
    except Exception as e:
        print(f"Unexpected error: {e}")
        return None

# Usage example
valid_date = "2025-06-04 14:30:00"
invalid_date = "2025-13-40 25:70:70"

print(safe_timestamp_conversion(valid_date))    # Normal conversion
print(safe_timestamp_conversion(invalid_date))  # Returns None
```

### Useful Helper Functions

```python
import time
from datetime import datetime

class TimestampHelper:
    """Timestamp utility class"""
    
    @staticmethod
    def now():
        """Current timestamp (integer)"""
        return int(time.time())
    
    @staticmethod
    def now_ms():
        """Current timestamp (milliseconds)"""
        return int(time.time() * 1000)
    
    @staticmethod
    def to_readable(timestamp):
        """Convert timestamp to readable format"""
        return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d %H:%M:%S')
    
    @staticmethod
    def days_ago(days):
        """Timestamp N days ago"""
        return int(time.time() - (days * 24 * 3600))
    
    @staticmethod
    def days_later(days):
        """Timestamp N days later"""
        return int(time.time() + (days * 24 * 3600))

# Usage example
helper = TimestampHelper()

print(f"Current: {helper.now()}")
print(f"Current (ms): {helper.now_ms()}")
print(f"Readable format: {helper.to_readable(helper.now())}")
print(f"7 days ago: {helper.days_ago(7)}")
print(f"30 days later: {helper.days_later(30)}")
```

## Conclusion

Handling timestamps in Python is a development fundamental, but real projects require consideration of various situations such as timezone handling, database storage, and API communication. Please refer to the code examples provided in this post to choose the appropriate method for your project.

**Key Points**:
- `int(time.time())` is sufficient for most cases
- Integer timestamps recommended for database storage
- Store in UTC when timezone is important
- Implement safe conversion with error handling

**Next Steps**: 
- Timestamp usage in Django or Flask
- Timestamps with time-series databases
- Time synchronization methods between microservices