export const STATUS_LABEL: Record<string, string> = {
  active: "진행중",
  closed: "마감",
  confirmed: "확정",
};

export const STATUS_CLASS: Record<string, string> = {
  active:
    "bg-blue-600 text-white border-blue-700 dark:bg-blue-600 dark:text-white dark:border-blue-700",
  closed:
    "bg-gray-400 text-white border-gray-500 dark:bg-gray-600 dark:text-gray-100 dark:border-gray-700",
  confirmed:
    "bg-green-600 text-white border-green-700 dark:bg-green-600 dark:text-white dark:border-green-700",
};
