import {Moment} from "moment";

export default class ApiClient {
    private static readonly API_ENDPOINT = "http://localhost:3000/api";

    static getDatasources(from: Moment, to: Moment, onSuccess: ((response: any) => void), onError?: ((response: any) => void)) {
        this.performGet(this.API_ENDPOINT + "/ds/" + from.unix() + "/" + to.unix(), onSuccess, onError);
    }

    private static performGet(url: string, onSuccess: ((response: any) => void), onError?: ((response: any) => void)) {
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => onSuccess(result),
                (error) => onError ? onError(error) : null
            )
    }
}