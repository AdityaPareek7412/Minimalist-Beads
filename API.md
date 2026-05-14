# API Documentation - MinimalistBeads

Complete API reference for all endpoints.

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

Most endpoints require authentication. Include JWT token in headers:

```
Authorization: Bearer <access_token>
```

For testing without auth, use dummy user IDs in request body.

---

## Products API

### Get All Products

```http
GET /api/products

Query Parameters:
- page (number): Page number (default: 1)
- limit (number): Items per page (default: 12)
- categories (string): Comma-separated category slugs
- minPrice (number): Minimum price filter
- maxPrice (number): Maximum price filter
- sortBy (string): "newest", "trending", "price-low", "price-high"
- search (string): Search term

Response:
{
  "products": [
    {
      "id": "prod_1",
      "name": "Amethyst Ring",
      "slug": "amethyst-ring",
      "price": 2499,
      "stock": 10,
      "images": [...],
      "category": {...}
    }
  ],
  "total": 245,
  "page": 1,
  "totalPages": 21
}

Status Codes:
200 - Success
500 - Server error
```

### Get Single Product

```http
GET /api/products/[slug]

Parameters:
- slug (string): Product slug

Response:
{
  "id": "prod_1",
  "name": "Amethyst Ring",
  "description": "Beautiful handcrafted amethyst ring...",
  "price": 2499,
  "originalPrice": 3999,
  "stock": 10,
  "images": [
    {
      "id": "img_1",
      "url": "https://...",
      "alt": "Product image"
    }
  ],
  "category": {...},
  "reviews": [...]
}

Status Codes:
200 - Success
404 - Product not found
500 - Server error
```

### Create Product (Admin)

```http
POST /api/products

Headers:
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "name": "New Ring",
  "slug": "new-ring",
  "description": "Product description",
  "price": 1999,
  "stock": 20,
  "categoryId": "cat_1",
  "images": [
    {
      "url": "https://...",
      "alt": "Ring image"
    }
  ]
}

Response: Created product object

Status Codes:
201 - Created
400 - Invalid input
401 - Unauthorized
403 - Forbidden
500 - Server error
```

### Update Product (Admin)

```http
PUT /api/products/[slug]

Headers:
Authorization: Bearer <admin_token>
Content-Type: application/json

Request Body:
{
  "name": "Updated Name",
  "price": 1999,
  "stock": 15
}

Response: Updated product object

Status Codes:
200 - Success
400 - Invalid input
401 - Unauthorized
404 - Product not found
500 - Server error
```

---

## Orders API

### Get User Orders

```http
GET /api/orders

Query Parameters:
- userId (string): User ID

Response:
[
  {
    "id": "ord_1",
    "orderNumber": "MB20240115001",
    "total": 2999,
    "status": "PENDING",
    "paymentStatus": "PENDING",
    "createdAt": "2024-01-15T10:30:00Z",
    "items": [...]
  }
]

Status Codes:
200 - Success
401 - Unauthorized
500 - Server error
```

### Create Order

```http
POST /api/orders

Request Body:
{
  "userId": "user_123",
  "items": [
    {
      "productId": "prod_1",
      "quantity": 2
    }
  ],
  "shippingAddressId": "addr_1",
  "paymentMethod": "razorpay",
  "couponCode": "SAVE10"
}

Response:
{
  "order": {
    "id": "ord_1",
    "orderNumber": "MB20240115001",
    "total": 2999,
    "status": "PENDING"
  },
  "razorpayOrder": {
    "id": "order_1234567890",
    "amount": 299900
  }
}

Status Codes:
201 - Created
400 - Invalid input
404 - Product/coupon not found
500 - Server error
```

### Get Order Details

```http
GET /api/orders/[id]

Parameters:
- id (string): Order ID

Response:
{
  "id": "ord_1",
  "orderNumber": "MB20240115001",
  "items": [...],
  "total": 2999,
  "status": "CONFIRMED",
  "payment": {...}
}

Status Codes:
200 - Success
404 - Order not found
500 - Server error
```

---

## Payment API

### Verify Payment

```http
POST /api/payment/verify

Request Body:
{
  "razorpayOrderId": "order_1234567890",
  "razorpayPaymentId": "pay_1234567890",
  "razorpaySignature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d"
}

Response:
{
  "message": "Payment verified successfully",
  "order": {...}
}

Status Codes:
200 - Success
400 - Invalid signature
404 - Payment not found
500 - Server error
```

---

## Cart API

### Get Cart Items

```http
GET /api/cart

Query Parameters:
- userId (string): User ID

Response:
[
  {
    "id": "cart_1",
    "productId": "prod_1",
    "quantity": 2,
    "product": {
      "id": "prod_1",
      "name": "Amethyst Ring",
      "price": 2499,
      "images": [...]
    }
  }
]

Status Codes:
200 - Success
500 - Server error
```

### Add to Cart

```http
POST /api/cart

Request Body:
{
  "userId": "user_123",
  "productId": "prod_1",
  "quantity": 2
}

Response:
{
  "id": "cart_1",
  "productId": "prod_1",
  "quantity": 2,
  "product": {...}
}

Status Codes:
201 - Created
400 - Invalid input
500 - Server error
```

### Remove from Cart

```http
DELETE /api/cart

Query Parameters:
- userId (string): User ID
- productId (string): Product ID

Response:
{
  "message": "Item removed from cart"
}

Status Codes:
200 - Success
404 - Item not found
500 - Server error
```

---

## Categories API

### Get All Categories

```http
GET /api/categories

Response:
[
  {
    "id": "cat_1",
    "name": "Rings",
    "slug": "rings",
    "icon": "💎",
    "featured": true
  }
]

Status Codes:
200 - Success
500 - Server error
```

### Create Category (Admin)

```http
POST /api/categories

Headers:
Authorization: Bearer <admin_token>

Request Body:
{
  "name": "New Category",
  "slug": "new-category",
  "icon": "✨",
  "description": "Category description"
}

Response: Created category object

Status Codes:
201 - Created
401 - Unauthorized
403 - Forbidden
500 - Server error
```

---

## Reviews API

### Get Product Reviews

```http
GET /api/reviews

Query Parameters:
- productId (string): Product ID

Response:
[
  {
    "id": "rev_1",
    "productId": "prod_1",
    "userId": "user_1",
    "rating": 5,
    "title": "Amazing product!",
    "comment": "Exceeded expectations...",
    "user": {
      "name": "Jane Doe",
      "avatar": "..."
    }
  }
]

Status Codes:
200 - Success
500 - Server error
```

### Create Review

```http
POST /api/reviews

Request Body:
{
  "productId": "prod_1",
  "userId": "user_123",
  "rating": 5,
  "title": "Amazing product!",
  "comment": "Excellent quality and fast shipping."
}

Response: Created review object

Status Codes:
201 - Created
400 - Invalid input
500 - Server error
```

---

## Common Response Formats

### Success Response

```json
{
  "status": 200,
  "data": {
    "id": "...",
    "name": "..."
  }
}
```

### Error Response

```json
{
  "status": 400,
  "error": "Invalid request",
  "message": "Product not found"
}
```

---

## Rate Limiting

- 100 requests per 15 minutes per IP
- Admin endpoints: 200 requests per 15 minutes

---

## Webhooks

### Razorpay Webhook

```http
POST /api/webhooks/razorpay

Events:
- payment.authorized
- payment.failed
- order.paid

Processing:
1. Verify signature
2. Update payment status
3. Update order status
4. Send confirmation email
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Server Error |
| 503 | Service Unavailable |

---

## Example Requests

### cURL

```bash
# Get products
curl -X GET http://localhost:3000/api/products

# Create order
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_123",
    "items": [{"productId": "prod_1", "quantity": 1}]
  }'
```

### JavaScript Fetch

```javascript
// Get products
const response = await fetch('/api/products?page=1&limit=12')
const data = await response.json()

// Create order
const order = await fetch('/api/orders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user_123',
    items: [{ productId: 'prod_1', quantity: 1 }]
  })
})
```

### Python Requests

```python
import requests

# Get products
response = requests.get('http://localhost:3000/api/products')
data = response.json()

# Create order
response = requests.post(
    'http://localhost:3000/api/orders',
    json={
        'userId': 'user_123',
        'items': [{'productId': 'prod_1', 'quantity': 1}]
    }
)
```

---

## Testing

Use tools like:
- [Postman](https://www.postman.com)
- [Insomnia](https://insomnia.rest)
- [Thunder Client](https://www.thunderclient.com) (VS Code Extension)

---

**Last Updated**: January 15, 2024
**Version**: 1.0
**Status**: Production Ready

