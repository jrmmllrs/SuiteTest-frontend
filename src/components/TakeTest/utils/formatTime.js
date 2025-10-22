export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}

export function getInitialTime(timeRemaining, timeLimit) {
  if (timeRemaining !== null && timeRemaining !== undefined) {
    return timeRemaining;
  }
  return timeLimit * 60;
}