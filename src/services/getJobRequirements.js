export const getJobRequirements = async () => {
    try {
        const response = await fetch('http://192.168.20.111:8081/api/getreq');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Failed to fetch job requirements:", error);
        return [];
    }
};