
## 2026-03-09 - [Fix strict require statements on ETH transfers DoS]
**Vulnerability:** In Escrow's dispute resolution, sending ETH with  natively and strictly checking `require(success)` can revert the entire transaction if the target contract throws or has no receive fallback, causing a DoS where remaining ETH gets permanently locked.
**Learning:** Implementing the Pull over Push pattern and not directly enforcing state changes around individual failed payouts prevents a single malicious or malfunctioning recipient from breaking dispute finalization for everyone.
**Prevention:** Replace direct `.call` require checks with an internal `_safeTransfer` helper that handles failed transfers by routing them gracefully to a `pendingWithdrawals` mapping to be reclaimed later manually.
## 2024-03-24 - [Fix strict require statements on ETH transfers DoS]
**Vulnerability:** In Escrow's dispute resolution, sending ETH with '.call' natively and strictly checking require(success) can revert the entire transaction if the target contract throws or has no receive fallback, causing a DoS where remaining ETH gets permanently locked.
**Learning:** Implementing the Pull over Push pattern and not directly enforcing state changes around individual failed payouts prevents a single malicious or malfunctioning recipient from breaking dispute finalization for everyone.
**Prevention:** Replace direct '.call' require checks with an internal '_safeTransfer' helper that handles failed transfers by routing them gracefully to a 'pendingWithdrawals' mapping to be reclaimed later manually.
