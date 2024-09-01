export class Episode {
    url: string;
    label: string;
    headers: Object;

    constructor(url: string, label: string, headers: Object = {}) {
        this.url = url;
        this.label = label;
        this.headers = headers;
    }
};