export class ApiResponse {
    #response;
    #status;
    #message;
    #data;
    constructor(response, status, message, data = null) {
        this.#response = response;
        this.#status = status;
        this.#message = message;
        this.#data = data;
    }
    get getResponse() {return this.#response;}
    set setResponse(response) {this.#response = response;}
    get getStatus() {return this.#status;}
    set setStatus(status) {this.#status = status;}
    get getMessage() {return this.#message;}
    set setMessage(message) {this.#message = message;}
    get getData() {return this.#data;}
    set setData(data) {this.#data = data;}

    setApiResponse(response, status, message, data = null) {
        this.#response = response;
        this.#status = status;
        this.#message = message;
        this.#data = data;
    }
    getApiResponse() {
        return {
            response:this.#response,
            status:this.#status,
            message:this.#message,
            data:this.#data
        }
    }
};