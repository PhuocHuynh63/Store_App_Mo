export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "2-digit" });
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year} `;
};
