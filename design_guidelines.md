# Visual Inspection Report Builder - Design Guidelines

## Design Approach
**Material Design System** - Content-rich application with clear visual hierarchy and functional components. This is a productivity tool where clarity, organization, and professional output are paramount.

## Typography System
- **Primary Font**: Inter (Google Fonts)
- **Headings**: 
  - H1: 2xl (24px), font-semibold - Page titles
  - H2: xl (20px), font-semibold - Section headers
  - H3: lg (18px), font-medium - Subsections
- **Body**: base (16px), font-normal - All content, forms, tables
- **Labels**: sm (14px), font-medium - Form labels, table headers
- **Meta**: xs (12px), font-normal - Timestamps, captions

## Layout System
**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16 for consistent rhythm
- Outer containers: p-8 or p-12
- Section spacing: gap-6 or gap-8
- Form fields: space-y-4
- Tight groupings: gap-2 or gap-4

**Container Strategy**:
- Main canvas: max-w-5xl mx-auto (optimal for print/PDF at 8.5x11)
- Full-width tables: w-full with responsive scroll
- Form sections: Grid layout with responsive columns

## Component Library

### Navigation & Header
Top app bar with logo placement, report title, and action buttons (Save Draft, Generate PDF, Print). Secondary toolbar with tabs for different report sections (Details, Inspection Items, Images, Summary).

### Report Canvas
White background with subtle border (border border-gray-200), rounded corners (rounded-lg), shadow (shadow-sm). Each section within canvas uses bordered cards with clear separation.

### Company Branding Section
Top of report - upload logo placeholder (max 200px width), company name (H2), address fields, contact information in clean grid layout (grid-cols-2 gap-4).

### Inspection Details Form
Structured input groups:
- Text inputs: border border-gray-300, rounded-md, px-4 py-2, focus states with border-blue-500
- Date/time pickers with calendar icon
- Dropdown selects with chevron indicators
- Equipment ID, Location, Inspector Name, Date fields in 2-column grid

### Image Upload Zones
Bordered dashed areas (border-2 border-dashed border-gray-300) with upload icon and "Click or drag to upload" text. Once uploaded, images display in grid (grid-cols-2 md:grid-cols-3 gap-4) with thumbnail previews, captions below each image, and remove button overlay.

### Data Tables
Full-width responsive tables with:
- Header row: bg-gray-50, font-medium text
- Bordered cells: border border-gray-200
- Alternating row colors: even:bg-gray-50
- Editable cells with inline edit icons
- Add row button at bottom
- Columns: Item #, Component, Condition, Notes, Action Required

### Signature Capture
Canvas area (border border-gray-300, aspect ratio 3:1) with "Sign Here" placeholder. Clear and Confirm buttons below. Once signed, displays as locked image with timestamp and signer name underneath.

### Action Buttons
- Primary: bg-blue-600 text-white, rounded-md, px-6 py-2.5
- Secondary: border border-gray-300, rounded-md, px-6 py-2.5
- Icon buttons: Square (w-10 h-10) with single icon, border on secondary actions
- Button groups use gap-3 spacing

### Summary Section
Key findings in bulleted format, overall status indicator (badge component with rounded-full, px-3 py-1), recommendation text area, inspector signature and date at bottom.

## Images Section
**No hero image** - This is a functional application, not a landing page. The primary visual elements are:
1. **User-uploaded inspection photos** - Equipment close-ups, damage areas, serial number plates displayed in responsive grid
2. **Logo uploads** - Company branding placement in report header
3. **Signature captures** - Digital signatures rendered as images

## Print/PDF Optimization
Design with print stylesheet in mind:
- Clean white backgrounds (no gradients/shadows in print)
- All content fits within standard page margins
- Page break considerations for sections
- High-contrast borders remain visible when printed
- Hide interactive elements (buttons, edit controls) in print view

## Responsive Behavior
- Desktop (lg): Full 2-column layouts, side-by-side forms
- Tablet (md): Maintain 2-column grids, condensed spacing
- Mobile: Single column stack, full-width tables with horizontal scroll

**Critical**: Maintain professional document structure across all viewports - this tool produces official reports.