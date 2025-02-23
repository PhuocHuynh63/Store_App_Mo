declare namespace IData {
    export interface Product {
        id: string;
        artName: string;
        price: number;
        description: string;
        glassSurface: string;
        image: string;
        brand: string;
        imgBrand: string;
        limitedTimeDeal: boolean;
        feedbacks: Feedback[];
    }

    export interface Feedback {
        rating: number;
        comment: string;
        author: string;
        date: string;
    }
}