import { NODE_ENV } from "./config.mjs";

export class ApiResponse {
    #response;
    #status;
    #message;
    #prevPath;
    #data;
    constructor(response, status, message, prevPath = '/', data = {}) {
        this.#response = response;
        this.#status = status;
        this.#message = message;
        this.#prevPath = prevPath;
        this.#data = data;
    }
    get getResponse() {return this.#response;}
    set setResponse(response) {this.#response = response;}
    get getStatus() {return this.#status;}
    set setStatus(status) {this.#status = status;}
    get getMessage() {return this.#message;}
    set setMessage(message) {this.#message = message;}
    get getPrevPath() {return this.#prevPath;}
    set setPrevPath(prevPath) {this.#prevPath = prevPath;}
    get getData() {return this.#data;}
    set setData(data) {this.#data = data;}

    /**
     * Set the message for the API response
     * @param {string} devMessage - API Response message when not in production
     * @param {string} publicMessage - API Response message when in production
     */
    applyMessage(devMessage,publicMessage) {
        this.#message = (NODE_ENV !== 'production') ? devMessage : publicMessage;
    }

    setApiResponse(response, status, message, prevPath = '/', data = {}) {
        this.#response = response;
        this.#status = status;
        this.#message = message;
        this.#prevPath = prevPath;
        this.#data = data;
    }
    getApiResponse() {
        return {
            response:this.#response,
            status:this.#status,
            message:this.#message,
            prevPath:this.#prevPath,
            data:this.#data
        }
    }
};