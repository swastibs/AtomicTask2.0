import ApiResponse from "../../shared/utils/ApiResponse.js";

export const getHealth = (req, res) => {
  const totalSeconds = process.uptime();

  const years = Math.floor(totalSeconds / (365 * 24 * 3600));
  let remaining = totalSeconds % (365 * 24 * 3600);

  const months = Math.floor(remaining / (30 * 24 * 3600));
  remaining %= 30 * 24 * 3600;

  const days = Math.floor(remaining / (24 * 3600));
  remaining %= 24 * 3600;

  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;

  const minutes = Math.floor(remaining / 60);
  const seconds = Math.floor(remaining % 60);

  const parts = [];
  if (years > 0) parts.push(`${years}y`);
  if (months > 0) parts.push(`${months}mo`);
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  const uptimeString = parts.join(", ");

  return ApiResponse.ok(
    res,
    { uptime: uptimeString, timestamp: new Date().toISOString() },
    "Server is healthy and running",
  );
};
