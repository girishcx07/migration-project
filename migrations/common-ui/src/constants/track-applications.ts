
export const TABS = [
  { name: "my_applications", value: "My Applications" },
  // { name: "confirm_payment", value: "Confirm Payment" },
  // { name: "review", value: "Review" },
  { name: "ready_to_submit", value: "Ready to Submit" },
  { name: "in_process", value: "In Process" },
  { name: "on_hold", value: "On Hold" },
  { name: "completed", value: "Completed" },
  { name: "archive", value: "Archive" },
];

export const DATASIM_TABS = [
  { name: "my_applications", value: "My Applications" },
  { name: "ready_to_process", value: "In Process" },
  { name: "completed", value: "Completed" },
];

export const STATUS_OPTIONS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "Rejected", value: "rejected" },
  { label: "Under Review", value: "under_review" },
  { label: "In Process", value: "in_process" },
  { label: "On Hold", value: "on_hold" },
  { label: "Completed", value: "completed" },
  { label: "Archived", value: "archived" },
  { label: "Ready to Submit", value: "ready_to_submit" },
  { label: "Confirm Payment", value: "confirm_payment" },
  { label: "Review", value: "review" },
  { label: "In Progress", value: "in_progress" },
  { label: "Submitted", value: "submitted" },
];

export const PAYMENT_OPTIONS = [
  { label: "Online", value: "online" },
  { label: "Offline", value: "offline" },
  { label: "Bank Transfer", value: "bank_transfer" },
];

export const DESTINATION_OPTIONS = [
  { label: "United States", value: "united_states" },
  { label: "Canada", value: "canada" },
  { label: "United Kingdom", value: "united_kingdom" },
  { label: "Australia", value: "australia" },
  { label: "Germany", value: "germany" },
  { label: "France", value: "france" },
  { label: "India", value: "india" },
  { label: "Brazil", value: "brazil" },
  { label: "South Africa", value: "south_africa" },
  { label: "Russia", value: "russia" },
  { label: "Italy", value: "italy" },
  { label: "Netherlands", value: "netherlands" },
];

export const VISA_INPROGRESS_APPLICATION_STATUS = [
  { label: "Draft", value: "draft", width: 10 },
  { label: "Submitted", value: "submitted", width: 23 },
  { label: "In Queue", value: "in_queue", width: 43 },
  { label: "Immigration", value: "immigration", width: 65 },
  { label: "Decision Taken", value: "decision_taken", width: 100 },
];

export const VISA_APPROVED_APPLICATION_STATUS = [
  { label: "Submitted", value: "submitted", width: 10 },
  { label: "In Queue", value: "in_queue", width: 35 },
  { label: "Immigration", value: "immigration", width: 60 },
  { label: "Decision Taken", value: "decision_taken", width: 100 },
];

export const GROUP_RELATION_DATA = [
  {
    label: "Main Person",
    // label: "Head of Family",
    value: "Main/Only Person in a Group",
  },
  {
    label: "Son",
    value: "Son of Main Person",
  },
  {
    label: "Daughter of",
    value: "Daughter of Main Person",
  },
  {
    label: "Wife",
    value: "Wife of Main Person",
  },
  {
    label: "Mother",
    value: "Mother of Main Person",
  },
  {
    label: "Father",
    value: "Father of Main Person",
  },
  {
    label: "Brother",
    value: "Brother of Main Person",
  },
  {
    label: "Sister",
    value: "Sister of Main Person",
  },
];

export const APPLICATION_STATES = [
  { title: "Application Cancelled", value: "application_cancelled" },
  { title: "In Progress", value: "application_submitted" },
  {
    title: "Application Submitted for fulfillment",
    value: "application_submitted_for_fulfillment",
  },
  { title: "Archived", value: "archived" },
  { title: "Ready to Submit", value: "booking_submitted" },
  { title: "Deleted", value: "deleted" },
  // { title: "On Hold", value: "on_hold" },
];
