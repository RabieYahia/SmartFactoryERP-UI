/\*\*

- PROFESSIONAL UI SYSTEM - Developer Guide
-
- This file demonstrates best practices for using the new alert,
- confirmation, and styling systems in the SmartFactoryERP-UI application.
  \*/

// ============================================
// 1. USING THE ALERT SERVICE
// ============================================

import { Component, inject } from '@angular/core';
import { AlertService } from './core/services/alert.service';

@Component({
selector: 'app-example',
template: `    <button (click)="onSuccess()">Show Success</button>
    <button (click)="onError()">Show Error</button>
 `
})
export class ExampleComponent {
private alertService = inject(AlertService);

// ✅ SUCCESS ALERT
onSuccess() {
this.alertService.success('Order created successfully!');
// Auto-dismisses after 5 seconds
}

// ❌ ERROR ALERT
onError() {
this.alertService.error('Failed to save changes. Please try again.');
// Auto-dismisses after 6 seconds
}

// ⚠️ WARNING ALERT
onWarning() {
this.alertService.warning('This action cannot be undone.');
// Auto-dismisses after 5 seconds
}

// ℹ️ INFO ALERT
onInfo() {
this.alertService.info('New updates are available.');
// Auto-dismisses after 4 seconds
}

// 🎯 CUSTOM ALERT (no auto-dismiss)
onPersistent() {
this.alertService.show('This message stays until you dismiss it', 'info', 0);
}
}

// ============================================
// 2. USING THE CONFIRM SERVICE
// ============================================

import { ConfirmService } from './core/services/confirm.service';

@Component({
selector: 'app-example-confirm',
template: `    <button (click)="onDelete()">Delete Item</button>
    <button (click)="onConfirm()">Confirm Action</button>
 `
})
export class ExampleConfirmComponent {
private confirmService = inject(ConfirmService);
private alertService = inject(AlertService);

// 🗑️ DANGER CONFIRMATION (for deletions)
onDelete() {
this.confirmService.danger(
'Are you sure you want to delete this item? This cannot be undone.',
() => {
// User clicked "Delete"
console.log('Item deleted');
this.alertService.success('Item deleted successfully');
},
() => {
// User clicked "Cancel" (optional)
console.log('Deletion cancelled');
}
);
}

// ⚠️ WARNING CONFIRMATION (for critical actions)
onConfirm() {
this.confirmService.warning(
'This will deduct materials from inventory. Continue?',
() => {
// User clicked "Confirm"
console.log('Action confirmed');
this.alertService.success('Materials deducted');
}
);
}

// ℹ️ INFO CONFIRMATION (for general confirmations)
onInfo() {
this.confirmService.info(
'Please review the changes before saving.',
() => {
console.log('User acknowledged');
}
);
}
}

// ============================================
// 3. PROFESSIONAL BUTTON STYLING
// ============================================

/\*\*

- HTML EXAMPLE:
-
- <!-- Primary Action Button -->
- <button class="btn btn-primary">
- <i class="bi bi-check-circle me-2"></i>Save Changes
- </button>
-
- <!-- Secondary Action Button -->
- <button class="btn btn-secondary">
- <i class="bi bi-arrow-right me-2"></i>Next Step
- </button>
-
- <!-- Success Button -->
- <button class="btn btn-success">
- <i class="bi bi-plus-circle me-2"></i>Create New
- </button>
-
- <!-- Danger Button -->
- <button class="btn btn-danger">
- <i class="bi bi-trash me-2"></i>Delete
- </button>
-
- <!-- Warning Button -->
- <button class="btn btn-warning">
- <i class="bi bi-exclamation-triangle me-2"></i>Caution
- </button>
-
- <!-- Outline Button -->
- <button class="btn btn-outline-secondary">
- <i class="bi bi-arrow-left me-2"></i>Go Back
- </button>
-
- <!-- Cancel/Back Button -->
- <button class="btn btn-cancel">Cancel</button>
-
- <!-- Small Button -->
- <button class="btn btn-primary btn-sm">Small Button</button>
-
- <!-- Large Button -->
- <button class="btn btn-primary btn-lg">Large Button</button>
  \*/

// ============================================
// 4. BOOTSTRAP ICONS REFERENCE
// ============================================

/\*\*

- Common Icons Used in SmartFactoryERP
-
- Dashboard: bi-speedometer2
- Inventory: bi-box-seam
- Purchasing: bi-truck
- Sales: bi-cash-coin
- Production: bi-gear
- IoT: bi-cpu
- Expenses: bi-receipt
- HR: bi-people
- Attendance: bi-clock-history
- Tasks: bi-list-check
- AI: bi-robot
-
- Actions:
- Add: bi-plus-circle
- Edit: bi-pencil-square
- Delete: bi-trash
- View: bi-eye
- Download: bi-download
- Upload: bi-upload
- Search: bi-search
- Settings: bi-gear
- Save: bi-check-circle
- Cancel: bi-x-circle
- Back: bi-arrow-left
- Forward: bi-arrow-right
-
- Status:
- Success: bi-check-circle-fill
- Error: bi-exclamation-triangle-fill
- Warning: bi-exclamation-circle-fill
- Info: bi-info-circle-fill
- Loading: bi-hourglass-split (with spinner)
-
- Lists & Data:
- List: bi-list-ul
- Table: bi-table
- Calendar: bi-calendar
- Clock: bi-clock
- Chart: bi-bar-chart
- Graph: bi-graph-up
-
- For complete list, visit: https://icons.getbootstrap.com/
  \*/

// ============================================
// 5. REAL-WORLD EXAMPLE: COMPLETE WORKFLOW
// ============================================

import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
selector: 'app-create-order',
template: `
<form [formGroup]="form" (ngSubmit)="onSubmit()">
<div class="form-group mb-3">
<label class="form-label">Order Name</label>
<input type="text" class="form-control" formControlName="name" />
</div>

      <div class="d-flex gap-2">
        <button type="submit" class="btn btn-primary">
          <i class="bi bi-check-circle me-2"></i>Create Order
        </button>
        <button type="button" (click)="onCancel()" class="btn btn-cancel">
          <i class="bi bi-x-circle me-2"></i>Cancel
        </button>
      </div>
    </form>

`
})
export class CreateOrderExampleComponent {
private fb = inject(FormBuilder);
private alertService = inject(AlertService);
private confirmService = inject(ConfirmService);
private router = inject(Router);

form: FormGroup = this.fb.group({
name: ['', Validators.required]
});

onSubmit() {
if (this.form.invalid) {
this.alertService.warning('Please fill all required fields');
return;
}

    // Show confirmation before creating
    this.confirmService.info(
      `Create order "${this.form.value.name}"?`,
      () => this.create(),
      () => this.alertService.info('Creation cancelled')
    );

}

private create() {
// Simulate API call
this.alertService.success('Order created successfully!');
setTimeout(() => this.router.navigate(['/orders']), 1500);
}

onCancel() {
if (this.form.dirty) {
this.confirmService.warning(
'You have unsaved changes. Discard them?',
() => this.router.navigate(['/orders'])
);
} else {
this.router.navigate(['/orders']);
}
}
}

// ============================================
// 6. REMOVING OLD-STYLE ALERTS
// ============================================

/\*\*

- BEFORE (Old Way - No longer use!):
-
- alert('✅ Success!');
- alert('❌ Error: ' + errorMsg);
- if (!confirm('Are you sure?')) return;
- console.log('📦 Data loaded:', data);
  \*/

/\*\*

- AFTER (New Professional Way):
-
- this.alertService.success('Success!');
- this.alertService.error(errorMsg);
- this.confirmService.warning('Are you sure?', () => { });
- console.log('Data loaded:', data);
  \*/

// ============================================
// 7. THEME COLORS REFERENCE
// ============================================

/\*\*

- CSS Custom Properties available for styling:
-
- Primary Colors:
- --primary: #1e7cff
- --primary-dark: #0055cc
-
- Secondary Colors:
- --secondary: #06b6b6
-
- Status Colors:
- --success: #22c55e
- --warning: #f59e0b
- --danger: #ef4444
- --info: #0ea5e9
-
- Neutral Colors:
- --neutral-50 through --neutral-900
-
- Semantic:
- --bg: #f9fafb (background)
- --surface: #ffffff (cards, containers)
- --text-primary: #111827
- --text-secondary: #6b7280
- --text-muted: #9ca3af
-
- Usage in CSS:
- .my-element {
- background: var(--primary);
- color: var(--text-primary);
- border: 1px solid var(--neutral-300);
- }
  \*/

// ============================================
// 8. MIGRATION CHECKLIST
// ============================================

/\*\*

- If you're updating an existing component:
-
- [ ] Import AlertService
- [ ] Import ConfirmService (if needed)
- [ ] Replace all alert() calls
- [ ] Replace all confirm() calls
- [ ] Remove emoji from console.log
- [ ] Update button classes
- [ ] Add Bootstrap icons instead of emoji
- [ ] Test in browser
- [ ] Check responsive behavior
- [ ] Verify error messages are helpful
      \*/

// ============================================
// 9. PERFORMANCE TIPS
// ============================================

/\*\*

- Alert Service:
- - Alerts auto-dismiss, so no memory leaks
- - Set duration to 0 only when necessary
- - Stack multiple alerts - they won't interfere
-
- Confirm Service:
- - Dialogs close after confirmation/cancellation
- - Safe to call multiple times
- - No performance impact
-
- Icons:
- - Bootstrap Icons are lightweight SVG
- - Reuse the same icons throughout app
- - Icons are already cached by browser
- - Better than emoji in terms of clarity and accessibility
    \*/

export { };
