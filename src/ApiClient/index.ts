import {getUnixTime} from "date-fns";
import TranslateRequest from "./body";

export default class ApiClient {
    private static readonly API_ENDPOINT = "http://localhost:3000/api";

    static getDatasources(from: Date, to: Date, onSuccess: ((response: any) => void), onError?: ((error: any) => void)) {
        this.performGet(this.API_ENDPOINT + "/ds/" + getUnixTime(from) + "/" + getUnixTime(to),
            onSuccess,
            onError);
    }

    static getRecentStats(type: string, onSuccess: ((response: any) => void), onError?: ((error: any) => void)) {
        this.performGet(this.API_ENDPOINT + "/stats/" + type,
            onSuccess,
            onError);
    }

    static getXyStats(request: TranslateRequest, onSuccess: ((response: any) => void), onError?: ((error: any) => void)) {
        this.performPost(this.API_ENDPOINT + "/stats/translate",
            JSON.stringify(request),
            onSuccess,
            onError);
    }

    private static performGet(url: string, onSuccess: ((response: any) => void), onError?: ((error: any) => void)) {
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => onSuccess(result),
                (error) => onError ? onError(error) : null
            )
    }

    private static performPost(url: string, body: BodyInit, onSuccess: ((response: any) => void), onError?: ((error: any) => void)) {
        fetch(url, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: body
        })
            .then(res => res.json())
            .then(
                (result) => onSuccess(result),
                (error) => onError ? onError(error) : null
            )
    }
}