# 🎯 Multi-Account Allocation - Implementation Plan

**Start Date:** February 6, 2026  
**Target Completion:** February 9-11, 2026 (3-5 days)  
**Status:** 🚀 STARTING NOW

---

## 📋 Overview

Allow users to split their savings across multiple named allocations (e.g., Emergency Fund 40%, Vacation 30%, Investment 30%).

---

## ✅ Implementation Checklist

### Day 1: Core Smart Contract (8 hours)
- [ ] Create account structures (AllocationConfig, Allocation)
- [ ] Implement `create_allocation` instruction
- [ ] Implement `update_allocation` instruction
- [ ] Implement `remove_allocation` instruction
- [ ] Add validation logic (percentages sum to 100%)
- [ ] Write unit tests for allocation management

### Day 2: Deposit/Withdraw Logic (8 hours)
- [ ] Implement `deposit_with_allocation` instruction
- [ ] Implement `withdraw_from_allocation` instruction
- [ ] Add allocation split logic
- [ ] Handle edge cases (rounding, 0% allocations)
- [ ] Write unit tests for deposits/withdrawals
- [ ] Test on devnet

### Day 3: Frontend & Polish (8 hours)
- [ ] Create AllocationManager component
- [ ] Add allocation creation UI
- [ ] Add allocation editing UI
- [ ] Add visual allocation breakdown (pie chart)
- [ ] Integrate with existing deposit flow
- [ ] End-to-end testing
- [ ] Documentation

---

## 🏗️ Architecture

### Account Structure

```rust
#[account]
pub struct AllocationConfig {
    pub owner: Pubkey,              // User who owns this config
    pub allocations: Vec<Allocation>, // Max 10 allocations
    pub total_allocations: u8,      // Count of active allocations
    pub bump: u8,                   // PDA bump
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct Allocation {
    pub name: String,               // "Emergency Fund" (max 32 chars)
    pub percentage: u8,             // 40 (out of 100)
    pub vault: Pubkey,              // PDA for this allocation's vault
    pub total_saved: u64,           // Total saved in this allocation
    pub total_withdrawn: u64,       // Total withdrawn from this allocation
    pub is_active: bool,            // Can be deactivated
}
```

### PDA Seeds

```rust
// Allocation config PDA
seeds = [b"allocation_config", user.key().as_ref()]

// Individual allocation vault PDA
seeds = [b"allocation_vault", user.key().as_ref(), index.to_le_bytes().as_ref()]
```

---

## 📝 Instructions to Implement

### 1. `create_allocation`

```rust
pub fn create_allocation(
    ctx: Context<CreateAllocation>,
    name: String,
    percentage: u8,
) -> Result<()>
```

**Validation:**
- Name length ≤ 32 characters
- Percentage 1-100
- Total allocations < 10
- Sum of all percentages ≤ 100

**Logic:**
1. Validate inputs
2. Create new Allocation struct
3. Add to allocations vector
4. Increment total_allocations

### 2. `update_allocation`

```rust
pub fn update_allocation(
    ctx: Context<UpdateAllocation>,
    index: u8,
    name: Option<String>,
    percentage: Option<u8>,
) -> Result<()>
```

**Validation:**
- Index exists
- If percentage changed, sum ≤ 100
- User is owner

**Logic:**
1. Find allocation by index
2. Update name if provided
3. Update percentage if provided
4. Validate total percentages

### 3. `remove_allocation`

```rust
pub fn remove_allocation(
    ctx: Context<RemoveAllocation>,
    index: u8,
) -> Result<()>
```

**Validation:**
- Index exists
- Allocation vault is empty (or force withdraw)
- User is owner

**Logic:**
1. Mark allocation as inactive
2. Optionally transfer remaining funds to main vault

### 4. `deposit_with_allocation`

```rust
pub fn deposit_with_allocation(
    ctx: Context<DepositWithAllocation>,
    amount: u64,
) -> Result<()>
```

**Logic:**
1. Calculate platform fee (0.4%)
2. For each active allocation:
   - Calculate allocation amount (percentage of total)
   - Transfer to allocation vault
   - Update allocation.total_saved
3. Handle rounding (remainder goes to first allocation)

### 5. `withdraw_from_allocation`

```rust
pub fn withdraw_from_allocation(
    ctx: Context<WithdrawFromAllocation>,
    index: u8,
    amount: u64,
) -> Result<()>
```

**Logic:**
1. Validate allocation has sufficient balance
2. Calculate platform fee (0.4%)
3. Transfer from allocation vault to user
4. Update allocation.total_withdrawn

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
describe("Multi-Account Allocation", () => {
  it("Creates allocation with valid percentage", async () => {
    // Test creating "Emergency Fund" with 40%
  });

  it("Fails to create allocation with invalid percentage", async () => {
    // Test percentage > 100
  });

  it("Fails when total percentages exceed 100%", async () => {
    // Create 60% + 50% = should fail
  });

  it("Deposits and splits correctly", async () => {
    // Deposit 100 SOL with 40/30/30 split
    // Verify each vault has correct amount
  });

  it("Handles rounding correctly", async () => {
    // Deposit 1 SOL with 33/33/34 split
    // Verify no lamports lost
  });

  it("Withdraws from specific allocation", async () => {
    // Withdraw from Emergency Fund only
  });

  it("Updates allocation percentage", async () => {
    // Change from 40% to 50%
  });

  it("Removes allocation", async () => {
    // Remove allocation and verify funds transferred
  });
});
```

---

## 🎨 Frontend Components

### AllocationManager.jsx

```jsx
export default function AllocationManager({ userConfig, allocationConfig }) {
  const [allocations, setAllocations] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="allocation-manager">
      {/* Allocation Pie Chart */}
      <AllocationChart allocations={allocations} />

      {/* Allocation List */}
      <AllocationList 
        allocations={allocations}
        onEdit={handleEdit}
        onRemove={handleRemove}
      />

      {/* Create New Allocation */}
      <button onClick={() => setShowCreateModal(true)}>
        + Add Allocation
      </button>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAllocationModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
}
```

### AllocationChart.jsx

```jsx
// Simple pie chart showing allocation breakdown
// Libraries: recharts or custom SVG
```

---

## 📊 User Flow

### Creating Allocations

```
1. User clicks "Manage Allocations"
2. Sees empty state: "No allocations yet"
3. Clicks "+ Add Allocation"
4. Modal appears:
   - Name: [Emergency Fund]
   - Percentage: [40]%
   - [Create]
5. Allocation created
6. Repeat for Vacation (30%), Investment (30%)
7. Total: 100% allocated
```

### Depositing with Allocations

```
1. User deposits 100 SOL
2. System automatically splits:
   - Emergency Fund: 40 SOL
   - Vacation: 30 SOL
   - Investment: 30 SOL
3. Each allocation vault updated
4. User sees breakdown in dashboard
```

### Withdrawing from Allocation

```
1. User clicks on "Emergency Fund"
2. Sees: "40 SOL saved"
3. Clicks "Withdraw"
4. Enters amount: 10 SOL
5. Confirms withdrawal
6. 10 SOL transferred to wallet
7. Emergency Fund now shows: 30 SOL
```

---

## ⚠️ Edge Cases to Handle

### 1. Rounding Issues
**Problem:** 100 SOL split 33/33/34 = 33.33... each  
**Solution:** Give remainder to first allocation

### 2. Partial Allocations
**Problem:** User only allocates 80% (20% unallocated)  
**Solution:** Allow partial allocation, remaining goes to main vault

### 3. Empty Allocation
**Problem:** User sets allocation to 0%  
**Solution:** Skip in deposit logic, allow for future use

### 4. Removing Active Allocation
**Problem:** User wants to remove allocation with funds  
**Solution:** Force transfer to main vault or require empty first

### 5. Maximum Allocations
**Problem:** User tries to create 11th allocation  
**Solution:** Enforce max 10 limit (account size constraint)

---

## 🔒 Security Considerations

### 1. Ownership Validation
- Always verify user owns allocation config
- Prevent unauthorized modifications

### 2. Percentage Validation
- Sum of percentages ≤ 100
- Individual percentage 0-100
- Prevent overflow attacks

### 3. PDA Validation
- Verify allocation vaults are correct PDAs
- Prevent vault substitution attacks

### 4. Reentrancy Protection
- Use proper CPI patterns
- No external calls during state changes

---

## 📈 Success Metrics

### Technical
- [ ] All tests passing (100% coverage)
- [ ] Builds without warnings
- [ ] Deploys to devnet successfully
- [ ] No security vulnerabilities

### User Experience
- [ ] Can create allocations in < 30 seconds
- [ ] Deposit splits correctly every time
- [ ] Withdrawal works from any allocation
- [ ] UI is intuitive and clear

### Performance
- [ ] Create allocation: < 1 second
- [ ] Deposit with split: < 2 seconds
- [ ] Withdraw: < 1 second

---

## 🚀 Deployment Plan

### Devnet Deployment
```bash
# Day 2 afternoon
anchor build
anchor deploy --provider.cluster devnet
# Update frontend with new program ID
# Test all flows
```

### Mainnet Deployment
```bash
# After security audit (Week 5)
anchor build --verifiable
anchor deploy --provider.cluster mainnet-beta
# Update frontend
# Monitor closely
```

---

## 📚 Documentation to Create

### User Documentation
- [ ] "How to Create Allocations" guide
- [ ] "Managing Your Savings Goals" tutorial
- [ ] FAQ section

### Developer Documentation
- [ ] Account structure documentation
- [ ] Instruction reference
- [ ] Integration guide for frontend

---

## ⏱️ Time Estimates

| Task | Estimated Time | Actual Time |
|------|---------------|-------------|
| Account structures | 2 hours | - |
| Create/Update/Remove | 3 hours | - |
| Deposit with split | 3 hours | - |
| Withdraw from allocation | 2 hours | - |
| Unit tests | 4 hours | - |
| Frontend components | 6 hours | - |
| Integration testing | 2 hours | - |
| Documentation | 2 hours | - |
| **Total** | **24 hours** | **-** |

**Target:** 3 days (8 hours/day)

---

## 🎯 Today's Goals (Day 1)

### Morning (4 hours)
- [x] Create implementation plan
- [ ] Set up account structures
- [ ] Implement create_allocation
- [ ] Implement update_allocation

### Afternoon (4 hours)
- [ ] Implement remove_allocation
- [ ] Add validation logic
- [ ] Write initial tests
- [ ] Test on devnet

---

## 📞 Questions & Decisions

### Design Decisions
- **Max allocations:** 10 (account size limit)
- **Name length:** 32 characters max
- **Percentage precision:** Whole numbers only (1-100)
- **Unallocated funds:** Go to main vault

### Open Questions
- [ ] Should we allow 0% allocations?
- [ ] Should we auto-rebalance when percentages change?
- [ ] Should we show historical allocation performance?

---

## 🎉 Success Criteria

### Day 1 Complete When:
- [ ] Account structures defined
- [ ] Create/Update/Remove instructions working
- [ ] Basic tests passing

### Day 2 Complete When:
- [ ] Deposit with split working
- [ ] Withdraw from allocation working
- [ ] All tests passing
- [ ] Deployed to devnet

### Day 3 Complete When:
- [ ] Frontend components complete
- [ ] End-to-end flow working
- [ ] Documentation written
- [ ] Ready for user testing

---

**Let's build this! 🚀**

**Next Step:** Create account structures in `lib.rs`
