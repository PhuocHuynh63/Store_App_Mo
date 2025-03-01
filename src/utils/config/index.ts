const apiUrl = process.env.EXPO_PUBLIC_API_URL;

const httpConfig = {
    async get(url: string) {
        const response = await fetch(apiUrl);
        return response.json();
    },
    async getOne(id: string) {
        const response = await fetch(`${apiUrl}/${id}`);
        return response.json();
    },
    async put(url: string, data: any) {
        const response = await fetch(`${apiUrl}/${url}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        return response.json();
    }
};

export default httpConfig;
