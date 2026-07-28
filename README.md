# Staff Hub

Design a modern, clean, and intuitive staffing dashboard for my staffing agency. The application should feel professional, minimalistic, and optimized for speed and ease of use rather than being overloaded with features.

The dashboard should function as a central hub for managing employees, clients, tasks, and employee requests.

Dashboard (Home)

When I open the application, I should immediately see:

• Upcoming Tasks
• Past Due Tasks
• Employee Requests
• Payroll Issues
• Employees Starting Soon
• Recently Completed Tasks
• Quick Statistics (Total Active Employees, Total Clients, Open Requests, Open Payroll Issues)

The dashboard should prioritize information that requires immediate attention.

Tasks

Tasks should have:

• Due Date
• Priority (Low, Medium, High)
• Assigned Employee (if applicable)
• Company
• Status (Open, In Progress, Completed)
• Notes

Tasks should automatically appear under Upcoming or Past Due based on their due date.

Companies

Create a Companies section displaying cards or a clean table of all clients.

Examples include:

• PG (PureGreen)
• PGWILM (PureGreen Wilmington)
• PNIX (Phoenix Conway)
• YARD (Phoenix Ocean Isle)
• PNIXCRD (Phoenix Creedmoor)
• PNIXMRS (Phoenix Morrisville)
• BRIGHT
• BRIGHTM
• MBSR
• MRG
• AMAZ

Clicking a company should open its dedicated page.

Company Page

Each company page should display:

Company Information

Current Active Employees

Pending Starts

Former Employees

Payroll Issues

Employee Requests

Company Notes

Search Employees

Employee Table

Each employee row should include:

Employee Name

Phone Number

Status

Position

Pay Rate

Hire Date

Current Assignment

Employee Number

Notes

Clicking an employee should open a detailed employee profile.

Employee Profile

Include:

Personal Information

Contact Information

Emergency Contact

Employee Number

Current Company

Position

Pay Rate

Employment Status

Hire Date

Direct Deposit Status

Payroll Issues

W-2 Requests

Check Reissues

Documents

General Notes

Task History

Requests

Include a Requests section where employee requests can be tracked, such as:

Returned Checks

Direct Deposit Changes

W-2 Requests

Employment Verification

Address Changes

General HR Requests

Each request should display:

Employee

Company

Request Type

Date Submitted

Priority

Status

Assigned To

Notes

Global Search

A search bar should instantly search employees, companies, employee numbers, and phone numbers.

Design Requirements

The interface should be extremely clean and modern.

Avoid clutter.

Use soft colors with subtle accents.

Prioritize readability.

Display information using clean cards and organized tables.

Allow filtering and sorting throughout the application.

The application should feel similar to Airtable, Monday.com, or Notion, but simpler and purpose-built for staffing agencies.

The overall philosophy should be:

"Everything important is visible within one or two clicks."

The dashboard should be optimized for daily operational use rather than data entry.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b98fbf0e-2d4c-4b0b-902b-3203d5845e16).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
