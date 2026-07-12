export const STATUS_LABEL: Record<string, string> = {
  active: "진행중",
  closed: "마감",
  confirmed: "확정",
};

export const STATUS_CLASS: Record<string, string> = {
  active:
    "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400",
  closed:
    "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400",
  confirmed:
    "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400",
};
