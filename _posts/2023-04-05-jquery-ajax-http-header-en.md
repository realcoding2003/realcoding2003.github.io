---
layout: post
title: "Adding Values to HTTP Headers in JavaScript jQuery AJAX Communication"
date: 2023-04-05 12:00:00 +0900
categories: [Development, Tutorial]
tags: [javascript, jquery, ajax, http-header, beforeSend, authorization]
author: "Kevin Park"
lang: en
excerpt: "Learn core methods and practical examples for adding authentication tokens to HTTP headers using beforeSend and setRequestHeader in AJAX communication."
permalink: /en/:year/:month/:day/:title/
redirect_from:
  - /2023/04/05/jquery-ajax-http-header-en/
---

# Adding Values to HTTP Headers in JavaScript jQuery AJAX Communication

## 🎯 Core Solution (Ready to Use)

To add values to HTTP headers in AJAX communication, use the **`beforeSend`** option.

```javascript
$.ajax({
    method: "POST",
    url: "your-api-url",
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer your-token");
        xhr.setRequestHeader("x-api-key", "your-api-key");
    },
    success: function(response) {
        console.log(response);
    },
    error: function(xhr, status, error) {
        console.error('Error:', error);
    }
});
```

### Most Commonly Used Patterns

**1. Adding Authorization Header**
```javascript
beforeSend: function(xhr) {
    xhr.setRequestHeader("Authorization", "Bearer " + accessToken);
}
```

**2. Adding API Key Header**
```javascript
beforeSend: function(xhr) {
    xhr.setRequestHeader("x-api-key", "your-api-key");
}
```

**3. Adding Multiple Headers**
```javascript
beforeSend: function(xhr) {
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-Custom-Header", "custom-value");
}
```

---

## 📚 Detailed Explanation

### Why beforeSend is Necessary

When communicating with API servers in web applications, authentication information often needs to be included in HTTP headers for security purposes. This is particularly essential in the following situations:

- **REST API Authentication**: JWT tokens, Bearer tokens
- **AWS API Gateway**: API Keys, IAM authentication
- **Third-party API Integration**: Service-specific authentication keys
- **CSRF Security**: Token-based security handling

### Real Development Example

Below is actual development code using AWS API Gateway and Cognito authentication:

```javascript
$.ajax({
    method: "POST",
    url: "https://console-api.ciottb.com/dashboard",
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", cognito.session.idToken.jwtToken);
    },
    error: function(xhr, status, error) {
        alert(xhr.responseJSON.errorMessage);
        Swal.fire({
            type: 'error',
            title: xhr.responseJSON.errorMessage,
            showConfirmButton: true,
        });
    },
    success: function(res) {
        $("#word_cloud").jqCloud(res.total.wordcloud);
        tot_wordList(res.total.word_cnt);
        risk(res.Apple, "#apple");
        risk(res.Canonical, "#Canonical");
        risk(res.Cisco, "#Cisco");
        risk(res.Debian, "#Debian");
        risk(res.Google, "#Google");
        risk(res.Linux, "#Linux");
        risk(res.Microsoft, "#Microsoft");
        risk(res.Redhat, "#Redhat");
        risk(res.Sqlite, "#Sqlite");
    }
});
```

### xhr.setRequestHeader() Method Details

**Syntax**
```javascript
xhr.setRequestHeader(headerName, headerValue)
```

**Parameters**
- `headerName`: Name of the HTTP header (string)
- `headerValue`: Value to set for the header (string)

**Important Notes**
- Can only be called within the `beforeSend` callback
- Case-insensitive (HTTP standard)
- Multiple calls with the same header name accumulate values

### Various Usage Examples

**1. Conditional Header Addition**
```javascript
$.ajax({
    method: "GET",
    url: "/api/data",
    beforeSend: function(xhr) {
        // Add token only when logged in
        const token = localStorage.getItem('accessToken');
        if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
        
        // Add debug header only in development environment
        if (window.location.hostname === 'localhost') {
            xhr.setRequestHeader("X-Debug-Mode", "enabled");
        }
    }
});
```

**2. Dynamic Token Handling**
```javascript
function makeAuthenticatedRequest(url, data) {
    return $.ajax({
        method: "POST",
        url: url,
        beforeSend: function(xhr) {
            // Token expiry check and renewal
            const token = getValidToken(); // Token validation function
            xhr.setRequestHeader("Authorization", "Bearer " + token);
            xhr.setRequestHeader("Content-Type", "application/json");
        },
        data: JSON.stringify(data)
    });
}
```

**3. Global Header Settings**
```javascript
// Apply common headers to all AJAX requests
$.ajaxSetup({
    beforeSend: function(xhr) {
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        
        // Add only when authentication token exists
        const token = sessionStorage.getItem('authToken');
        if (token) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
    }
});

// Headers are automatically added to all subsequent $.ajax() calls
$.get("/api/user/profile", function(data) {
    console.log(data);
});
```

### Frequently Used Header Types

**1. Authentication Headers**
```javascript
// JWT Token
xhr.setRequestHeader("Authorization", "Bearer " + jwtToken);

// API Key
xhr.setRequestHeader("x-api-key", apiKey);
xhr.setRequestHeader("X-API-KEY", apiKey);

// Basic Authentication
xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password));
```

**2. Content Headers**
```javascript
// JSON data transmission
xhr.setRequestHeader("Content-Type", "application/json");

// File upload
xhr.setRequestHeader("Content-Type", "multipart/form-data");

// Response format specification
xhr.setRequestHeader("Accept", "application/json");
```

**3. Security Headers**
```javascript
// CSRF Token
xhr.setRequestHeader("X-CSRF-Token", csrfToken);

// Request origin verification
xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");

// Custom security header
xhr.setRequestHeader("X-Client-Version", "1.0.0");
```

### Error Handling and Debugging

**1. Header-related Error Handling**
```javascript
$.ajax({
    method: "POST",
    url: "/api/data",
    beforeSend: function(xhr) {
        try {
            xhr.setRequestHeader("Authorization", "Bearer " + getToken());
        } catch (error) {
            console.error("Header setting error:", error);
            return false; // Abort request
        }
    },
    error: function(xhr, status, error) {
        if (xhr.status === 401) {
            alert("Authentication required. Please login again.");
            window.location.href = "/login";
        } else if (xhr.status === 403) {
            alert("Access denied.");
        }
    }
});
```

**2. Checking Header Values**
```javascript
$.ajax({
    beforeSend: function(xhr) {
        xhr.setRequestHeader("Authorization", "Bearer " + token);
        
        // Check headers in developer tools
        console.log("Set headers:", {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        });
    }
});
```

### AWS API Gateway Specific Examples

**1. Cognito User Pool Authentication**
```javascript
function callApiWithCognito(endpoint, data) {
    const cognitoUser = userPool.getCurrentUser();
    
    cognitoUser.getSession((err, session) => {
        if (err) {
            console.error('Session error:', err);
            return;
        }
        
        $.ajax({
            method: "POST",
            url: `https://your-api-id.execute-api.region.amazonaws.com/prod/${endpoint}`,
            beforeSend: function(xhr) {
                // Cognito JWT Token
                xhr.setRequestHeader("Authorization", session.getIdToken().getJwtToken());
                xhr.setRequestHeader("Content-Type", "application/json");
            },
            data: JSON.stringify(data),
            success: function(response) {
                console.log('Success:', response);
            }
        });
    });
}
```

**2. IAM Signature Authentication (AWS Signature V4)**
```javascript
$.ajax({
    method: "POST",
    url: "https://api.amazonaws.com/service",
    beforeSend: function(xhr) {
        // Signature headers generated by AWS SDK
        xhr.setRequestHeader("Authorization", awsSignature);
        xhr.setRequestHeader("X-Amz-Date", amzDate);
        xhr.setRequestHeader("X-Amz-Security-Token", sessionToken);
    }
});
```

## Conclusion

Adding HTTP headers in jQuery AJAX can be easily implemented using the `beforeSend` option and the `xhr.setRequestHeader()` method.

**Key Points**:
- Use `xhr.setRequestHeader(headerName, headerValue)` in the `beforeSend` callback
- Essential for transmitting security information like authentication tokens and API keys
- Consider conditional header addition and error handling
- Useful for integrating with cloud services like AWS API Gateway

This approach enables secure and efficient API communication.