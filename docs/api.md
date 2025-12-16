# API Reference

## Backend Server

### GET /api/status

Returns the current status of all monitored endpoints.

**Response**

```json
{
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "overallStatus": "operational",
  "environments": [
    {
      "name": "Production",
      "regions": [
        {
          "region": "US",
          "url": "https://us.example.com",
          "status": "operational",
          "responseTime": 145,
          "lastChecked": "2024-01-15T10:30:00.000Z"
        }
      ]
    }
  ]
}
```

**Status Values**

| Status | Description |
|--------|-------------|
| `operational` | Endpoint responding normally (<2s) |
| `degraded` | Endpoint slow (>2s) or returning 4xx |
| `outage` | Endpoint unreachable or returning 5xx |
| `unknown` | Status check failed |

**Error Response (503)**

```json
{
  "error": "Status not yet available"
}
```

---

### GET /health

Server health check endpoint.

**Response**

```json
{
  "status": "ok"
}
```

---

## Cloudflare Worker Proxy

### POST /

Check multiple endpoints via the CORS proxy.

**Request**

```json
{
  "endpoints": [
    {
      "url": "https://api.example.com",
      "environment": "Production",
      "region": "US"
    }
  ],
  "timeout": 10000
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `endpoints` | array | Yes | List of endpoints to check |
| `endpoints[].url` | string | Yes | URL to check |
| `endpoints[].environment` | string | Yes | Environment name |
| `endpoints[].region` | string | Yes | Region identifier |
| `timeout` | number | No | Request timeout in ms (default: 10000) |

**Response**

```json
[
  {
    "region": "US",
    "url": "https://api.example.com",
    "status": "operational",
    "responseTime": 145,
    "lastChecked": "2024-01-15T10:30:00.000Z"
  }
]
```

**Error Responses**

| Status | Body |
|--------|------|
| 400 | `{"error": "Invalid request: endpoints array required"}` |
| 400 | `{"error": "Invalid JSON body"}` |
| 405 | `{"error": "Method not allowed"}` |
