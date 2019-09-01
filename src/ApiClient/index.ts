import {getUnixTime} from "date-fns";
import TranslateRequest from "./body";
import store from '../_store'
import {decrementLoading, incrementLoading, setLastUpdate} from '../_store/updater/actions'
// @ts-ignore
import ReconnectingEventSource from "reconnecting-eventsource";

export default class ApiClient {
    private static readonly API_ENDPOINT = "http://localhost:8080/api"; //fixme: in production only "/api"

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

    static subscribe(ids: Array<number>, types: Array<String>): EventSource {
        return new ReconnectingEventSource(this.API_ENDPOINT + "/subscribe/" + ids.join(",") + "/" + types.join(","), {})
        // return new EventSource(this.API_ENDPOINT + "/subscribe/" + ids.join(",") + "/" + types.join(","))
    }

    private static performGet(url: string, onSuccess: ((response: any) => void), onError?: ((error: any) => void)) {
        store.dispatch(incrementLoading());
        fetch(url)
            .then(res => res.json())
            .then(
                (result) => {
                    onSuccess(result);
                    store.dispatch(setLastUpdate(new Date()));
                },
                (error) => onError ? onError(error) : null
            )
            .finally(() => store.dispatch(decrementLoading()))
    }

    private static performPost(url: string, body: BodyInit, onSuccess: ((response: any) => void), onError?: ((error: any) => void)) {
        store.dispatch(incrementLoading());
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
                (result) => {
                    onSuccess(result);
                    store.dispatch(setLastUpdate(new Date()));
                },
                (error) => onError ? onError(error) : null
            )
            .finally(() => store.dispatch(decrementLoading()))
    }
}