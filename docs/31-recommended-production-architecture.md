# Recommended Production Architecture

## Recommended State
```
                ┌───────────────┐
                │ Next.js Admin │
                └───────┬───────┘
                        │
                        ▼
┌────────────┐    ┌───────────────┐
│ Flutter    │───▶│ Node.js API   │
│ Customer   │    └───────┬───────┘
└────────────┘            │
                          ├──── MongoDB
┌────────────┐             │
│ Flutter    │─────────────┤
│ Restaurant │             │
└────────────┘             ├──── Redis
                           │
┌────────────┐             ├──── FCM
│ Flutter    │─────────────┤
│ Delivery   │             ├──── Maps
└────────────┘             │
                           ├──── Payments
                           │
                           └──── Queue/Workers
```
