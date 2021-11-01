class Utils {
    static saveToLocalStorage(key: string, value: any) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (err) {
            console.warn(err)
        }
    }

    static getFromLocalStorage(key: string) {
        try {
            const value = localStorage.getItem(key);
            if (value) {
                return JSON.parse(value);
            }
        }
        catch (err) {
            console.warn(err);
            return null;
        }
    }

    static getStringArray(str: string): string[] {
        var result: string[] = [];
        if (!str)
            return result;
        var array = str.toString().split(';');
        for (var i in array) {
            result.push(array[i]);
        }
        return result;
    }

    static tryParseJson(text: string) {
        if (!text || text.length < 1)
            return false;
        var obj = {};
        try {
            obj = JSON.parse(text);
        }
        catch (e) {
            console.warn(text);
            console.warn(e);
            obj = false;
        }
        return obj;
    }

    static getArrayTimeFromSeconds(totalSeconds: number) {
        const hours = Math.round(totalSeconds / 3600);
        const mins = Math.round((totalSeconds - hours * 3600) / 60);
        const seconds = totalSeconds % 60;
        return [hours, mins, seconds];
    }

    static secondsToString(value: number) {
        var hours = Math.floor(value / 60 / 60);
        var minutes = Math.floor(value / 60) - (hours * 60);
        var seconds = value % 60;
        if (hours < 1) {
            return [
                minutes.toString().padStart(2, '0'),
                seconds.toString().padStart(2, '0')
            ].join(':');
        }
        return [
            hours.toString().padStart(2, '0'),
            minutes.toString().padStart(2, '0'),
            seconds.toString().padStart(2, '0')
        ].join(':');
    }

    static convertFileBase64 = (file: any) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file)
            fileReader.onload = () => {
                if (fileReader.result && typeof fileReader.result === 'string') {
                    resolve(fileReader.result?.split(',')[1]);
                }
            }
            fileReader.onerror = (error) => {
                reject(error);
            }
        });
    }

    static getError(err: any) {
        if (err.response) {
            return err.response.data;
        }
        return err;
    }

    static searchPrefix(value: string) {
        return `<${value}>`;
    }
}

export default Utils;