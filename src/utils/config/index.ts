const httpConfig = {
    baseUrl: 'https://67b8a9db699a8a7baef4db0c.mockapi.io/api/Product',

    async get(url: string) {
        const response = await fetch(`${this.baseUrl}${url}`);
        return response.json();
    }
};

export default httpConfig;
