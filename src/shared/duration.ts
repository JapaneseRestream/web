export const durationStrToSeconds = (durationStr: string) => {
	const [h = 0, m = 0, s = 0] = durationStr.split(":").map(Number);
	return (h * 60 + m) * 60 + s;
};

export const secondsToDurationStr = (seconds: number) => {
	const h = Math.floor(seconds / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = seconds % 60;
	return `${h.toFixed()}:${m.toFixed().padStart(2, "0")}:${s.toFixed().padStart(2, "0")}`;
};
